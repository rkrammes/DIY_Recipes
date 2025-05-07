# Data Layer Repository Pattern

## Overview

The Data Layer Repository Pattern provides a clean, consistent way to interact with data sources in the DIY Formulations application. It abstracts away the details of data access, making the codebase more maintainable and testable.

## Architecture

The repository pattern consists of the following components:

1. **Base Repository**: A generic class that provides common CRUD operations
2. **Specialized Repositories**: Classes that extend the base repository with entity-specific operations
3. **Repository Factory**: A singleton factory for creating and managing repository instances
4. **Repository Interfaces**: TypeScript interfaces that define the repository contracts
5. **Response Types**: Standardized response types for consistent error handling

## Benefits

The repository pattern provides several benefits:

1. **Separation of Concerns**: Data access logic is separated from business logic
2. **Consistent Error Handling**: Standardized error responses across all repositories
3. **Testability**: Repositories can be easily mocked for testing
4. **Code Reuse**: Common operations are implemented once in the base repository
5. **Maintainability**: Changes to the data source only require changes to the repositories
6. **Type Safety**: TypeScript interfaces ensure type safety across the application

## Implementation

### Base Repository

The `Repository<T>` class provides generic CRUD operations for any entity type:

```typescript
class Repository<T extends BaseEntity> {
  // Common operations
  async getAll(options: RepositoryQueryOptions): Promise<RepositoryListResponse<T>>
  async getById(id: string): Promise<RepositoryResponse<T>>
  async create(data: Partial<T>): Promise<RepositoryResponse<T>>
  async update(id: string, data: Partial<T>): Promise<RepositoryResponse<T>>
  async delete(id: string): Promise<RepositoryResponse<boolean>>
  
  // Realtime support
  subscribeToChanges(callback): { unsubscribe: () => void }
  subscribeToRecord(id: string, callback): { unsubscribe: () => void }
  
  // Utility methods
  protected applyFilters<U>(query, filters): PostgrestFilterBuilder<any, any, U[]>
  setFallbackData(data: T[]): void
}
```

### Specialized Repositories

Specialized repositories extend the base repository with entity-specific operations:

```typescript
class FormulationRepository extends Repository<Formulation> {
  // Formulation-specific operations
  async getWithIngredients(id: string): Promise<RepositoryResponse<FormulationWithIngredientsAndVersions>>
  async addIngredient(data: FormulationIngredientData): Promise<RepositoryResponse<FormulationIngredient>>
  async updateIngredient(id: string, data: Partial<FormulationIngredientData>): Promise<RepositoryResponse<FormulationIngredient>>
  async removeIngredient(id: string): Promise<RepositoryResponse<boolean>>
  async createVersion(formulationId: string, data: Partial<FormulationVersion>): Promise<RepositoryResponse<FormulationVersion>>
  async updateVersion(versionId: string, data: Partial<FormulationVersion>): Promise<RepositoryResponse<FormulationVersion>>
  async deleteVersion(versionId: string): Promise<RepositoryResponse<boolean>>
}

class IngredientRepository extends Repository<Ingredient> {
  // Ingredient-specific operations
  async searchByName(query: string): Promise<RepositoryListResponse<Ingredient>>
  async getByFormulationId(formulationId: string): Promise<RepositoryListResponse<Ingredient>>
  async getRecent(limit: number): Promise<RepositoryListResponse<Ingredient>>
}
```

### Repository Factory

The `RepositoryFactory` provides a way to create and manage repository instances:

```typescript
class RepositoryFactory {
  private static instance: RepositoryFactory;
  private repositories: Map<string, Repository<any>>;
  
  public static getInstance(): RepositoryFactory
  public getRepository<T extends BaseEntity>(tableName: string, options?: RepositoryOptions): Repository<T>
  public getFormulationRepository(options?: RepositoryOptions): FormulationRepository
  public getIngredientRepository(options?: RepositoryOptions): IngredientRepository
  public clearRepositories(): void
}
```

### Response Types

Standardized response types for consistent error handling:

```typescript
interface RepositoryResponse<T> {
  data: T | null;
  error: Error | PostgrestError | null;
}

interface RepositoryListResponse<T> {
  data: T[];
  error: Error | PostgrestError | null;
  count?: number;
}
```

## Usage Examples

### Using the Repository Factory

```typescript
import { getRepositoryFactory, getFormulationRepository } from '@/lib/data';

// Get a generic repository
const userRepository = getRepositoryFactory().getRepository<User>('users');

// Get a specialized repository
const formulationRepository = getFormulationRepository();
```

### Basic CRUD Operations

```typescript
// Get all formulations
const { data: formulations, error } = await formulationRepository.getAll();

// Get a specific formulation
const { data: formulation, error } = await formulationRepository.getById(id);

// Create a new formulation
const { data: newFormulation, error } = await formulationRepository.create({
  title: 'New Formulation',
  description: 'A new formulation',
  user_id: currentUserId
});

// Update a formulation
const { data: updatedFormulation, error } = await formulationRepository.update(id, {
  title: 'Updated Formulation'
});

// Delete a formulation
const { data: success, error } = await formulationRepository.delete(id);
```

### Using Specialized Repository Methods

```typescript
// Get a formulation with its ingredients and versions
const { data: formulation, error } = await formulationRepository.getWithIngredients(id);

// Add an ingredient to a formulation
const { data: ingredient, error } = await formulationRepository.addIngredient({
  formulationId: id,
  ingredientId: ingredientId,
  quantity: 100,
  unit: 'g'
});

// Search ingredients by name
const { data: ingredients, error } = await ingredientRepository.searchByName('salt');
```

### Using Repository Options

```typescript
// Enable realtime updates for a repository
const repository = getFormulationRepository({
  enableRealtime: true,
  useFallbackData: true
});

// Subscribe to changes in a table
const subscription = repository.subscribeToChanges((payload) => {
  console.log('Change detected:', payload);
  // Update UI or state
});

// Later, unsubscribe
subscription.unsubscribe();
```

## Fallback Data

The repository pattern supports fallback data for offline functionality:

```typescript
// Set fallback data for a repository
formulationRepository.setFallbackData([
  { id: '1', title: 'Offline Formulation 1', /* other properties */ },
  { id: '2', title: 'Offline Formulation 2', /* other properties */ }
]);

// Now if the database is unreachable, the fallback data will be used
```

## Integration with Modules

The repository pattern integrates with the Module Registry System through repository hooks that are provided to module components. This allows modules to access data in a consistent way while maintaining the separation of concerns.

## Future Enhancements

1. **Caching Layer**: Add a caching layer to improve performance
2. **Offline Support**: Enhance fallback data with local storage persistence
3. **Batch Operations**: Add support for batch operations to reduce API calls
4. **Pagination Helpers**: Add helpers for pagination and infinite scrolling
5. **Query Builder**: Create a fluent API for building complex queries
6. **Transaction Support**: Add support for transactions in repositories
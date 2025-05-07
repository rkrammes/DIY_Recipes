import { Repository, RepositoryOptions } from './repository';
import { FormulationRepository } from './formulationRepository';
import { IngredientRepository } from './ingredientRepository';
import { BaseEntity } from './repository';

/**
 * RepositoryFactory - Factory for creating and managing repositories
 * 
 * This class provides a centralized way to create and manage repositories.
 * It ensures that only one instance of a repository exists per table,
 * avoiding unnecessary duplication and ensuring consistent data access.
 */
export class RepositoryFactory {
  private static instance: RepositoryFactory;
  private repositories: Map<string, Repository<any>> = new Map();
  
  private constructor() {}
  
  /**
   * Get the singleton instance of RepositoryFactory
   */
  public static getInstance(): RepositoryFactory {
    if (!RepositoryFactory.instance) {
      RepositoryFactory.instance = new RepositoryFactory();
    }
    return RepositoryFactory.instance;
  }
  
  /**
   * Get a repository for a specific table
   * 
   * This method returns an existing repository instance if one exists,
   * or creates a new one if it doesn't. This ensures that only one
   * repository instance exists per table.
   */
  public getRepository<T extends BaseEntity>(
    tableName: string,
    options?: RepositoryOptions
  ): Repository<T> {
    const key = `generic:${tableName}`;
    
    if (!this.repositories.has(key)) {
      this.repositories.set(key, new Repository<T>(tableName, options));
    }
    
    return this.repositories.get(key) as Repository<T>;
  }
  
  /**
   * Get the formulation repository
   */
  public getFormulationRepository(options?: RepositoryOptions): FormulationRepository {
    const key = 'formulation';
    
    if (!this.repositories.has(key)) {
      this.repositories.set(key, new FormulationRepository(options));
    }
    
    return this.repositories.get(key) as FormulationRepository;
  }
  
  /**
   * Get the ingredient repository
   */
  public getIngredientRepository(options?: RepositoryOptions): IngredientRepository {
    const key = 'ingredient';
    
    if (!this.repositories.has(key)) {
      this.repositories.set(key, new IngredientRepository(options));
    }
    
    return this.repositories.get(key) as IngredientRepository;
  }
  
  /**
   * Clear all repositories
   * This is primarily useful for testing
   */
  public clearRepositories(): void {
    this.repositories.clear();
  }
}

// Create a convenience export for the getInstance method
export const getRepositoryFactory = RepositoryFactory.getInstance;

// Create convenience functions for commonly used repositories
export function getFormulationRepository(options?: RepositoryOptions): FormulationRepository {
  return RepositoryFactory.getInstance().getFormulationRepository(options);
}

export function getIngredientRepository(options?: RepositoryOptions): IngredientRepository {
  return RepositoryFactory.getInstance().getIngredientRepository(options);
}

export function getRepository<T extends BaseEntity>(
  tableName: string,
  options?: RepositoryOptions
): Repository<T> {
  return RepositoryFactory.getInstance().getRepository<T>(tableName, options);
}
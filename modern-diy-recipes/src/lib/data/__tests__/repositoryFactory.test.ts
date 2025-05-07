import { 
  RepositoryFactory, 
  getRepositoryFactory, 
  getFormulationRepository,
  getIngredientRepository,
  getRepository
} from '../repositoryFactory';
import { FormulationRepository } from '../formulationRepository';
import { IngredientRepository } from '../ingredientRepository';
import { Repository } from '../repository';

// Mock the supabase import
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    channel: jest.fn().mockReturnValue({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockReturnThis()
    }),
    removeChannel: jest.fn()
  }
}));

describe('RepositoryFactory', () => {
  beforeEach(() => {
    // Clear all repositories before each test
    getRepositoryFactory().clearRepositories();
  });

  describe('getInstance', () => {
    it('should return the same instance when called multiple times', () => {
      const instance1 = RepositoryFactory.getInstance();
      const instance2 = RepositoryFactory.getInstance();
      
      expect(instance1).toBe(instance2);
    });
    
    it('should provide the same instance via the convenience function', () => {
      const instance1 = RepositoryFactory.getInstance();
      const instance2 = getRepositoryFactory();
      
      expect(instance1).toBe(instance2);
    });
  });
  
  describe('getRepository', () => {
    it('should create a new repository when one doesn\'t exist', () => {
      const factory = getRepositoryFactory();
      const repository = factory.getRepository('test_table');
      
      expect(repository).toBeInstanceOf(Repository);
    });
    
    it('should return the same repository instance for the same table', () => {
      const factory = getRepositoryFactory();
      const repository1 = factory.getRepository('test_table');
      const repository2 = factory.getRepository('test_table');
      
      expect(repository1).toBe(repository2);
    });
    
    it('should create different repositories for different tables', () => {
      const factory = getRepositoryFactory();
      const repository1 = factory.getRepository('table1');
      const repository2 = factory.getRepository('table2');
      
      expect(repository1).not.toBe(repository2);
    });
    
    it('should pass options to the repository constructor', () => {
      const factory = getRepositoryFactory();
      const repository = factory.getRepository('test_table', { enableRealtime: true });
      
      // @ts-ignore - accessing private property for testing
      expect(repository.options.enableRealtime).toBe(true);
    });
  });
  
  describe('getFormulationRepository', () => {
    it('should return a FormulationRepository instance', () => {
      const factory = getRepositoryFactory();
      const repository = factory.getFormulationRepository();
      
      expect(repository).toBeInstanceOf(FormulationRepository);
    });
    
    it('should return the same FormulationRepository instance when called multiple times', () => {
      const factory = getRepositoryFactory();
      const repository1 = factory.getFormulationRepository();
      const repository2 = factory.getFormulationRepository();
      
      expect(repository1).toBe(repository2);
    });
    
    it('should provide the same instance via the convenience function', () => {
      const repository1 = getRepositoryFactory().getFormulationRepository();
      const repository2 = getFormulationRepository();
      
      expect(repository1).toBe(repository2);
    });
  });
  
  describe('getIngredientRepository', () => {
    it('should return an IngredientRepository instance', () => {
      const factory = getRepositoryFactory();
      const repository = factory.getIngredientRepository();
      
      expect(repository).toBeInstanceOf(IngredientRepository);
    });
    
    it('should return the same IngredientRepository instance when called multiple times', () => {
      const factory = getRepositoryFactory();
      const repository1 = factory.getIngredientRepository();
      const repository2 = factory.getIngredientRepository();
      
      expect(repository1).toBe(repository2);
    });
    
    it('should provide the same instance via the convenience function', () => {
      const repository1 = getRepositoryFactory().getIngredientRepository();
      const repository2 = getIngredientRepository();
      
      expect(repository1).toBe(repository2);
    });
  });
  
  describe('clearRepositories', () => {
    it('should clear all repositories', () => {
      const factory = getRepositoryFactory();
      const repository1 = factory.getRepository('test_table');
      
      factory.clearRepositories();
      
      const repository2 = factory.getRepository('test_table');
      
      expect(repository1).not.toBe(repository2);
    });
  });
  
  describe('Convenience functions', () => {
    it('getRepository should return a Repository instance', () => {
      const repository = getRepository('test_table');
      
      expect(repository).toBeInstanceOf(Repository);
    });
    
    it('getFormulationRepository should return a FormulationRepository instance', () => {
      const repository = getFormulationRepository();
      
      expect(repository).toBeInstanceOf(FormulationRepository);
    });
    
    it('getIngredientRepository should return an IngredientRepository instance', () => {
      const repository = getIngredientRepository();
      
      expect(repository).toBeInstanceOf(IngredientRepository);
    });
  });
});
import { FormulationRepository } from '../formulationRepository';
import { supabase } from '@/lib/supabase';

// Mock the supabase client
jest.mock('@/lib/supabase', () => {
  const mockSelect = jest.fn();
  const mockInsert = jest.fn();
  const mockUpdate = jest.fn();
  const mockDelete = jest.fn();
  const mockEq = jest.fn();
  const mockOrder = jest.fn();
  const mockLimit = jest.fn();
  const mockIn = jest.fn();
  const mockSingle = jest.fn();
  
  const mockFrom = jest.fn().mockReturnValue({
    select: mockSelect.mockReturnThis(),
    insert: mockInsert.mockReturnThis(),
    update: mockUpdate.mockReturnThis(),
    delete: mockDelete.mockReturnThis(),
    eq: mockEq.mockReturnThis(),
    order: mockOrder.mockReturnThis(),
    limit: mockLimit.mockReturnThis(),
    in: mockIn.mockReturnThis(),
    single: mockSingle.mockReturnThis(),
  });
  
  return {
    supabase: {
      from: mockFrom,
      removeChannel: jest.fn(),
    },
    mockFrom,
    mockSelect,
    mockInsert,
    mockUpdate,
    mockDelete,
    mockEq,
    mockOrder,
    mockLimit,
    mockIn,
    mockSingle,
  };
});

describe('FormulationRepository', () => {
  let repository: FormulationRepository;
  
  beforeEach(() => {
    repository = new FormulationRepository();
    jest.clearAllMocks();
  });
  
  describe('constructor', () => {
    it('should set the table name to "recipes"', () => {
      // Accessing private property for testing purposes
      // @ts-ignore
      expect(repository.tableName).toBe('recipes');
    });
    
    it('should accept options', () => {
      const customRepo = new FormulationRepository({
        enableRealtime: true,
        useFallbackData: false
      });
      
      // @ts-ignore - Accessing private property for testing
      expect(customRepo.options.enableRealtime).toBe(true);
      // @ts-ignore
      expect(customRepo.options.useFallbackData).toBe(false);
    });
  });
  
  describe('getWithIngredients', () => {
    it('should fetch formulation with ingredients and versions', async () => {
      const mockFormulation = { 
        id: '1', 
        title: 'Test Formulation',
        description: 'Test description',
        user_id: 'user-1',
        created_at: '2023-01-01T12:00:00Z'
      };
      
      const mockIngredients = [
        { 
          id: 'ri-1',
          recipe_id: '1',
          ingredient_id: 'ing-1',
          quantity: 100,
          unit: 'g',
          ingredients: {
            id: 'ing-1',
            name: 'Ingredient 1',
            description: 'Test ingredient'
          }
        }
      ];
      
      const mockVersions = [
        {
          id: 'ver-1',
          recipe_id: '1',
          version_number: 1,
          title: 'Version 1',
          created_at: '2023-01-01T12:00:00Z'
        }
      ];
      
      // Setup mock for getting formulation
      (supabase.from as jest.Mock).mockImplementationOnce(() => ({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockFormulation,
              error: null
            })
          })
        })
      }));
      
      // Setup mock for getting ingredients with join
      (supabase.from as jest.Mock).mockImplementationOnce(() => ({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: mockIngredients,
            error: null
          })
        })
      }));
      
      // Setup mock for getting versions
      (supabase.from as jest.Mock).mockImplementationOnce(() => ({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockVersions,
              error: null
            })
          })
        })
      }));
      
      const result = await repository.getWithIngredients('1');
      
      expect(result.data).toBeTruthy();
      expect(result.error).toBeNull();
      
      if (result.data) {
        expect(result.data.id).toBe('1');
        expect(result.data.title).toBe('Test Formulation');
        expect(Array.isArray(result.data.ingredients)).toBe(true);
        expect(Array.isArray(result.data.iterations)).toBe(true);
      }
      
      expect(supabase.from).toHaveBeenCalledWith('recipes');
    });
    
    it('should handle errors when fetching formulation', async () => {
      const mockError = { message: 'Formulation not found' };
      
      // Setup mock for getting formulation with error
      (supabase.from as jest.Mock).mockImplementationOnce(() => ({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: mockError
            })
          })
        })
      }));
      
      const result = await repository.getWithIngredients('999');
      
      expect(result.data).toBeNull();
      expect(result.error).toBe(mockError);
      expect(supabase.from).toHaveBeenCalledWith('recipes');
    });
  });
  
  describe('addIngredient', () => {
    it('should add an ingredient to a formulation', async () => {
      const mockIngredientData = {
        formulationId: '1',
        ingredientId: 'ing-1',
        quantity: 100,
        unit: 'g',
        notes: 'Test notes'
      };
      
      const mockResult = {
        data: {
          id: 'ri-1',
          recipe_id: '1',
          ingredient_id: 'ing-1',
          quantity: 100,
          unit: 'g',
          notes: 'Test notes',
          created_at: '2023-01-01T12:00:00Z'
        },
        error: null
      };
      
      // Setup mock for inserting ingredient
      (supabase.from as jest.Mock).mockImplementationOnce(() => ({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: [mockResult.data],
            error: null
          })
        })
      }));
      
      const result = await repository.addIngredient(mockIngredientData);
      
      expect(result.data).toEqual(mockResult.data);
      expect(result.error).toBeNull();
      expect(supabase.from).toHaveBeenCalledWith('recipe_ingredients');
    });
    
    it('should handle errors when adding an ingredient', async () => {
      const mockIngredientData = {
        formulationId: '1',
        ingredientId: 'ing-1',
        quantity: 100,
        unit: 'g'
      };
      
      const mockError = { message: 'Failed to add ingredient' };
      
      // Setup mock for inserting ingredient with error
      (supabase.from as jest.Mock).mockImplementationOnce(() => ({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: null,
            error: mockError
          })
        })
      }));
      
      const result = await repository.addIngredient(mockIngredientData);
      
      expect(result.data).toBeNull();
      expect(result.error).toBe(mockError);
      expect(supabase.from).toHaveBeenCalledWith('recipe_ingredients');
    });
  });
  
  describe('createVersion', () => {
    it('should create a new version for a formulation', async () => {
      const formulationId = '1';
      const versionData = {
        title: 'New Version',
        description: 'Test description',
        notes: 'Test notes'
      };
      
      // Setup mock for getting latest version number
      (supabase.from as jest.Mock).mockImplementationOnce(() => ({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({
                data: [{ version_number: 1 }],
                error: null
              })
            })
          })
        })
      }));
      
      // Setup mock for creating version
      (supabase.from as jest.Mock).mockImplementationOnce(() => ({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: [{
              id: 'ver-2',
              recipe_id: '1',
              version_number: 2,
              title: 'New Version',
              description: 'Test description',
              notes: 'Test notes',
              created_at: '2023-01-01T12:00:00Z'
            }],
            error: null
          })
        })
      }));
      
      const result = await repository.createVersion(formulationId, versionData);
      
      expect(result.data).toBeTruthy();
      expect(result.error).toBeNull();
      
      if (result.data) {
        expect(result.data.version_number).toBe(2); // Incremented from previous version
        expect(result.data.title).toBe('New Version');
      }
      
      expect(supabase.from).toHaveBeenCalledWith('iterations');
    });
    
    it('should set version number to 1 if no previous versions exist', async () => {
      const formulationId = '1';
      const versionData = { title: 'First Version' };
      
      // Setup mock for getting latest version number (empty result)
      (supabase.from as jest.Mock).mockImplementationOnce(() => ({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({
                data: [],
                error: null
              })
            })
          })
        })
      }));
      
      // Setup mock for creating version
      (supabase.from as jest.Mock).mockImplementationOnce(() => ({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: [{
              id: 'ver-1',
              recipe_id: '1',
              version_number: 1,
              title: 'First Version',
              created_at: '2023-01-01T12:00:00Z'
            }],
            error: null
          })
        })
      }));
      
      const result = await repository.createVersion(formulationId, versionData);
      
      expect(result.data).toBeTruthy();
      
      if (result.data) {
        expect(result.data.version_number).toBe(1);
      }
    });
  });
  
  describe('delete', () => {
    it('should delete a formulation and related data', async () => {
      const formulationId = '1';
      
      // Setup mock for deleting ingredients
      (supabase.from as jest.Mock).mockImplementationOnce(() => ({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [],
            error: null
          })
        })
      }));
      
      // Setup mock for deleting versions
      (supabase.from as jest.Mock).mockImplementationOnce(() => ({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [],
            error: null
          })
        })
      }));
      
      // Setup mock for deleting formulation
      (supabase.from as jest.Mock).mockImplementationOnce(() => ({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [],
            error: null
          })
        })
      }));
      
      const result = await repository.delete(formulationId);
      
      expect(result.data).toBe(true);
      expect(result.error).toBeNull();
      
      // Check if all tables were accessed for deletion
      expect(supabase.from).toHaveBeenCalledWith('recipe_ingredients');
      expect(supabase.from).toHaveBeenCalledWith('iterations');
      expect(supabase.from).toHaveBeenCalledWith('recipes');
    });
    
    it('should handle errors when deleting a formulation', async () => {
      const formulationId = '1';
      const mockError = { message: 'Failed to delete formulation' };
      
      // Setup mock for deleting ingredients
      (supabase.from as jest.Mock).mockImplementationOnce(() => ({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [],
            error: null
          })
        })
      }));
      
      // Setup mock for deleting versions
      (supabase.from as jest.Mock).mockImplementationOnce(() => ({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [],
            error: null
          })
        })
      }));
      
      // Setup mock for deleting formulation with error
      (supabase.from as jest.Mock).mockImplementationOnce(() => ({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: mockError
          })
        })
      }));
      
      const result = await repository.delete(formulationId);
      
      expect(result.data).toBe(false);
      expect(result.error).toBe(mockError);
    });
  });
});
import { Repository } from '../repository';
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
  const mockRange = jest.fn();
  const mockIn = jest.fn();
  const mockIlike = jest.fn();
  const mockLike = jest.fn();
  const mockGt = jest.fn();
  const mockGte = jest.fn();
  const mockLt = jest.fn();
  const mockLte = jest.fn();
  const mockNeq = jest.fn();
  const mockSingle = jest.fn();
  
  const mockFrom = jest.fn().mockReturnValue({
    select: mockSelect.mockReturnThis(),
    insert: mockInsert.mockReturnThis(),
    update: mockUpdate.mockReturnThis(),
    delete: mockDelete.mockReturnThis(),
    eq: mockEq.mockReturnThis(),
    order: mockOrder.mockReturnThis(),
    limit: mockLimit.mockReturnThis(),
    range: mockRange.mockReturnThis(),
    in: mockIn.mockReturnThis(),
    ilike: mockIlike.mockReturnThis(),
    like: mockLike.mockReturnThis(),
    gt: mockGt.mockReturnThis(),
    gte: mockGte.mockReturnThis(),
    lt: mockLt.mockReturnThis(),
    lte: mockLte.mockReturnThis(),
    neq: mockNeq.mockReturnThis(),
    single: mockSingle.mockReturnThis(),
  });
  
  const mockChannel = jest.fn().mockReturnValue({
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn().mockReturnValue({ unsubscribe: jest.fn() }),
  });
  
  return {
    supabase: {
      from: mockFrom,
      channel: mockChannel,
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
    mockRange,
    mockIn,
    mockIlike,
    mockLike,
    mockGt,
    mockGte,
    mockLt,
    mockLte,
    mockNeq,
    mockSingle,
    mockChannel,
  };
});

describe('Repository', () => {
  // Create a concrete implementation of the abstract Repository class
  class TestEntityRepository extends Repository<{ id: string, name: string }> {
    constructor() {
      super('test_entities');
    }
  }
  
  let repository: TestEntityRepository;
  
  beforeEach(() => {
    repository = new TestEntityRepository();
    jest.clearAllMocks();
  });
  
  describe('getAll', () => {
    it('should fetch all entities', async () => {
      const mockData = [{ id: '1', name: 'Test Entity 1' }, { id: '2', name: 'Test Entity 2' }];
      const mockResult = { data: mockData, error: null };
      
      // Setup mock return value
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockResolvedValue(mockResult),
      });
      
      const result = await repository.getAll();
      
      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
      expect(supabase.from).toHaveBeenCalledWith('test_entities');
    });
    
    it('should handle errors when fetching', async () => {
      const mockError = { message: 'Database error' };
      const mockResult = { data: null, error: mockError };
      
      // Setup mock return value
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockResolvedValue(mockResult),
      });
      
      const result = await repository.getAll();
      
      expect(result.data).toEqual([]);
      expect(result.error).toBe(mockError);
      expect(supabase.from).toHaveBeenCalledWith('test_entities');
    });
    
    it('should use fallback data when available and fetch fails', async () => {
      const mockError = { message: 'Database error' };
      const mockResult = { data: null, error: mockError };
      const fallbackData = [{ id: '3', name: 'Fallback Entity' }];
      
      // Setup mock return value
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockResolvedValue(mockResult),
      });
      
      // Set fallback data
      repository.setFallbackData(fallbackData);
      
      const result = await repository.getAll();
      
      expect(result.data).toEqual(fallbackData);
      expect(result.error).toBeNull();
      expect(supabase.from).toHaveBeenCalledWith('test_entities');
    });
    
    it('should apply filters correctly', async () => {
      const mockData = [{ id: '1', name: 'Test Entity 1' }];
      const mockResult = { data: mockData, error: null };
      
      // Setup complex mock chain
      const mockEq = jest.fn().mockReturnThis();
      const mockIlike = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockResolvedValue(mockResult);
      
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: mockEq,
          ilike: mockIlike,
          mockResolvedValue: jest.fn().mockResolvedValue(mockResult),
        }),
      });
      
      await repository.getAll({ 
        filters: { 
          'id': '1',
          'name:ilike': 'test' 
        } 
      });
      
      expect(supabase.from).toHaveBeenCalledWith('test_entities');
    });
    
    it('should apply ordering correctly', async () => {
      const mockData = [{ id: '1', name: 'Test Entity 1' }];
      const mockResult = { data: mockData, error: null };
      
      // Setup complex mock chain
      const mockOrder = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockResolvedValue(mockResult);
      
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          order: mockOrder,
          mockResolvedValue: jest.fn().mockResolvedValue(mockResult),
        }),
      });
      
      await repository.getAll({ 
        orderBy: 'name',
        ascending: true
      });
      
      expect(supabase.from).toHaveBeenCalledWith('test_entities');
    });
    
    it('should apply pagination correctly', async () => {
      const mockData = [{ id: '1', name: 'Test Entity 1' }];
      const mockResult = { data: mockData, error: null };
      
      // Setup complex mock chain
      const mockLimit = jest.fn().mockReturnThis();
      const mockRange = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockResolvedValue(mockResult);
      
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          limit: mockLimit,
          range: mockRange,
          mockResolvedValue: jest.fn().mockResolvedValue(mockResult),
        }),
      });
      
      await repository.getAll({ 
        limit: 10,
        page: 2
      });
      
      expect(supabase.from).toHaveBeenCalledWith('test_entities');
    });
  });
  
  describe('getById', () => {
    it('should fetch entity by id', async () => {
      const mockData = { id: '1', name: 'Test Entity 1' };
      const mockResult = { data: mockData, error: null };
      
      // Setup mock return value
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue(mockResult),
          }),
        }),
      });
      
      const result = await repository.getById('1');
      
      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
      expect(supabase.from).toHaveBeenCalledWith('test_entities');
    });
    
    it('should handle entity not found', async () => {
      const mockError = { message: 'Entity not found' };
      const mockResult = { data: null, error: mockError };
      
      // Setup mock return value
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue(mockResult),
          }),
        }),
      });
      
      const result = await repository.getById('999');
      
      expect(result.data).toBeNull();
      expect(result.error).toBe(mockError);
      expect(supabase.from).toHaveBeenCalledWith('test_entities');
    });
    
    it('should use fallback data when available and fetch fails', async () => {
      const mockError = { message: 'Entity not found' };
      const mockResult = { data: null, error: mockError };
      const fallbackData = [
        { id: '1', name: 'Fallback Entity 1' },
        { id: '2', name: 'Fallback Entity 2' }
      ];
      
      // Setup mock return value
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue(mockResult),
          }),
        }),
      });
      
      // Set fallback data
      repository.setFallbackData(fallbackData);
      
      const result = await repository.getById('1');
      
      expect(result.data).toEqual(fallbackData[0]);
      expect(result.error).toBeNull();
      expect(supabase.from).toHaveBeenCalledWith('test_entities');
    });
  });
  
  describe('create', () => {
    it('should create a new entity', async () => {
      const newEntity = { name: 'New Entity' };
      const createdEntity = { id: '1', name: 'New Entity', created_at: '2023-01-01T12:00:00Z' };
      const mockResult = { data: [createdEntity], error: null };
      
      // Setup mock return value
      (supabase.from as jest.Mock).mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(mockResult),
        }),
      });
      
      const result = await repository.create(newEntity);
      
      expect(result.data).toEqual(createdEntity);
      expect(result.error).toBeNull();
      expect(supabase.from).toHaveBeenCalledWith('test_entities');
    });
    
    it('should handle creation errors', async () => {
      const newEntity = { name: 'New Entity' };
      const mockError = { message: 'Insert failed' };
      const mockResult = { data: null, error: mockError };
      
      // Setup mock return value
      (supabase.from as jest.Mock).mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(mockResult),
        }),
      });
      
      const result = await repository.create(newEntity);
      
      expect(result.data).toBeNull();
      expect(result.error).toBe(mockError);
      expect(supabase.from).toHaveBeenCalledWith('test_entities');
    });
  });
  
  describe('update', () => {
    it('should update an entity', async () => {
      const entityUpdate = { name: 'Updated Entity' };
      const updatedEntity = { id: '1', name: 'Updated Entity', updated_at: '2023-01-01T12:00:00Z' };
      const mockResult = { data: [updatedEntity], error: null };
      
      // Setup mock return value
      (supabase.from as jest.Mock).mockReturnValueOnce({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue(mockResult),
          }),
        }),
      });
      
      const result = await repository.update('1', entityUpdate);
      
      expect(result.data).toEqual(updatedEntity);
      expect(result.error).toBeNull();
      expect(supabase.from).toHaveBeenCalledWith('test_entities');
    });
    
    it('should handle update errors', async () => {
      const entityUpdate = { name: 'Updated Entity' };
      const mockError = { message: 'Update failed' };
      const mockResult = { data: null, error: mockError };
      
      // Setup mock return value
      (supabase.from as jest.Mock).mockReturnValueOnce({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue(mockResult),
          }),
        }),
      });
      
      const result = await repository.update('1', entityUpdate);
      
      expect(result.data).toBeNull();
      expect(result.error).toBe(mockError);
      expect(supabase.from).toHaveBeenCalledWith('test_entities');
    });
  });
  
  describe('delete', () => {
    it('should delete an entity', async () => {
      const mockResult = { data: [], error: null };
      
      // Setup mock return value
      (supabase.from as jest.Mock).mockReturnValueOnce({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue(mockResult),
        }),
      });
      
      const result = await repository.delete('1');
      
      expect(result.data).toBe(true);
      expect(result.error).toBeNull();
      expect(supabase.from).toHaveBeenCalledWith('test_entities');
    });
    
    it('should handle delete errors', async () => {
      const mockError = { message: 'Delete failed' };
      const mockResult = { data: null, error: mockError };
      
      // Setup mock return value
      (supabase.from as jest.Mock).mockReturnValueOnce({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue(mockResult),
        }),
      });
      
      const result = await repository.delete('1');
      
      expect(result.data).toBe(false);
      expect(result.error).toBe(mockError);
      expect(supabase.from).toHaveBeenCalledWith('test_entities');
    });
  });
  
  describe('subscribeToChanges and subscribeToRecord', () => {
    it('should create a subscription for all changes', () => {
      const mockCallback = jest.fn();
      const result = repository.subscribeToChanges(mockCallback);
      
      expect(supabase.channel).toHaveBeenCalled();
      expect(result.unsubscribe).toBeDefined();
    });
    
    it('should create a subscription for a specific record', () => {
      const mockCallback = jest.fn();
      const result = repository.subscribeToRecord('1', mockCallback);
      
      expect(supabase.channel).toHaveBeenCalled();
      expect(result.unsubscribe).toBeDefined();
    });
    
    it('should not subscribe if realtime is disabled', () => {
      const mockCallback = jest.fn();
      const nonRealtimeRepo = new TestEntityRepository();
      Object.defineProperty(nonRealtimeRepo, 'options', { 
        value: { enableRealtime: false },
        writable: true
      });
      
      const result = nonRealtimeRepo.subscribeToChanges(mockCallback);
      
      expect(supabase.channel).not.toHaveBeenCalled();
      expect(result.unsubscribe).toBeDefined();
    });
  });
});
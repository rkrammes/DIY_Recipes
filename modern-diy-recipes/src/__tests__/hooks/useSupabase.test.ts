import { renderHook } from '@testing-library/react-hooks';
import { useSupabase } from '@/hooks/useSupabase';

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { id: '1' }, error: null }),
    })),
    auth: {
      getUser: jest.fn().mockResolvedValue({ 
        data: { user: { id: 'user1' } }, 
        error: null 
      }),
    },
  },
}));

describe('useSupabase', () => {
  it('should return supabase client', () => {
    const { result } = renderHook(() => useSupabase());
    
    expect(result.current).toBeDefined();
    expect(result.current.from).toBeDefined();
    expect(result.current.auth).toBeDefined();
  });

  it('should handle database queries', async () => {
    const { result } = renderHook(() => useSupabase());
    
    const response = await result.current
      .from('recipes')
      .select('*')
      .eq('id', '1')
      .single();
    
    expect(response.data).toEqual({ id: '1' });
    expect(response.error).toBeNull();
  });
});
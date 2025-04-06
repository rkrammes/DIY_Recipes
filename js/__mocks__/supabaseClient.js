// Mock Supabase client for tests
const supabaseClient = {
  from: jest.fn(() => ({
    delete: jest.fn(() => Promise.resolve({ data: [], error: null })),
    insert: jest.fn(() => Promise.resolve({ data: [], error: null })),
    update: jest.fn(() => Promise.resolve({ data: [], error: null })),
    select: jest.fn(() => Promise.resolve({ data: [], error: null })),
  })),
};

export { supabaseClient };

// Export default for ESM compatibility
export default supabaseClient;
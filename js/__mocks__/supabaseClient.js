// Mock Supabase client for tests
export const supabaseClient = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(() => ({
          data: null,
          error: null
        })),
        data: null,
        error: null
      })),
      data: null,
      error: null
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        data: null,
        error: null
      })),
      data: null,
      error: null
    })),
    delete: jest.fn(() => ({
      eq: jest.fn(() => ({
        data: null,
        error: null
      })),
      data: null,
      error: null
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => ({
        data: null,
        error: null
      })),
      data: null,
      error: null
    }))
  })),
  auth: {
    signUp: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn()
  }
};

// Export default for ESM compatibility
export default supabaseClient;
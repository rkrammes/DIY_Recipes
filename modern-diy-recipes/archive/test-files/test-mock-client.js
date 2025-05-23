// Simple test script to verify our MockSupabaseClient implementation

// Import the mock data for testing
const mockRecipes = [
  { id: "mock-1", title: "Chocolate Chip Cookies", created_at: "2023-01-01T12:00:00Z" },
  { id: "mock-2", title: "Sourdough Bread", created_at: "2023-02-01T12:00:00Z" },
  { id: "mock-3", title: "Vegetable Curry", created_at: "2023-03-01T12:00:00Z" }
];

const mockIngredients = [
  { id: "ing-1", name: "All-purpose flour", created_at: "2023-01-01T00:00:00Z" },
  { id: "ing-2", name: "Butter", created_at: "2023-02-01T00:00:00Z" },
  { id: "ing-3", name: "Chocolate chips", created_at: "2023-03-01T00:00:00Z" }
];

// MockSupabaseClient implementation
class MockSupabaseClient {
  constructor() {
    console.log('Using mock data in development mode');
  }

  from(table) {
    return {
      select: (columns) => {
        // Define a query builder that can be chainable
        const queryBuilder = {
          eq: (column, value) => {
            return {
              single: () => {
                // Find a single item by ID
                if (table === 'recipes') {
                  const recipe = mockRecipes.find(r => r.id === value);
                  return {
                    data: recipe || null,
                    error: recipe ? null : { message: 'Recipe not found', status: 404 }
                  };
                }
                if (table === 'ingredients') {
                  const ingredient = mockIngredients.find(i => i.id === value);
                  return {
                    data: ingredient || null,
                    error: ingredient ? null : { message: 'Ingredient not found', status: 404 }
                  };
                }
                return { data: null, error: { message: 'Not found', status: 404 } };
              },
              // Regular select with filter
              select: () => {
                return this.from(table).select(columns);
              }
            };
          },
          // Add order method for sorting results
          order: (column, { ascending = false } = {}) => {
            // Get sorted data
            const getSortedData = () => {
              let data = [];
              
              // Get the right mock data based on table
              if (table === 'recipes') {
                data = [...mockRecipes];
              } else if (table === 'ingredients') {
                data = [...mockIngredients];
              }
              
              // Sort the data
              if (data.length > 0 && column in data[0]) {
                data.sort((a, b) => {
                  if (a[column] < b[column]) return ascending ? -1 : 1;
                  if (a[column] > b[column]) return ascending ? 1 : -1;
                  return 0;
                });
              }
              
              return data;
            };
            
            // Return a chainable object
            return {
              // Method to handle promise resolution
              then: (callback) => {
                const data = getSortedData();
                callback({ data, error: null });
                return Promise.resolve({ data, error: null });
              },
              // Add more chainable methods as needed
              single: () => {
                const data = getSortedData();
                return {
                  data: data.length > 0 ? data[0] : null,
                  error: data.length > 0 ? null : { message: 'Not found', status: 404 }
                };
              }
            };
          },
          // Return all items from the table
          then: (callback) => {
            if (table === 'recipes') {
              callback({ data: mockRecipes, error: null });
              return Promise.resolve({ data: mockRecipes, error: null });
            } else if (table === 'ingredients') {
              callback({ data: mockIngredients, error: null });
              return Promise.resolve({ data: mockIngredients, error: null });
            } else {
              callback({ data: [], error: null });
              return Promise.resolve({ data: [], error: null });
            }
          }
        };
        
        return queryBuilder;
      }
    };
  }
}

// Test function
async function testMockSupabaseClient() {
  const mockClient = new MockSupabaseClient();
  
  console.log('Testing recipes with order by created_at (ascending=true)');
  try {
    const result1 = await mockClient
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: true });
    
    console.log('Ordered recipes (ascending):');
    console.log(result1.data);
  } catch (err) {
    console.error('Error with ascending order:', err);
  }
  
  console.log('\nTesting recipes with order by created_at (ascending=false)');
  try {
    const result2 = await mockClient
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false });
    
    console.log('Ordered recipes (descending):');
    console.log(result2.data);
  } catch (err) {
    console.error('Error with descending order:', err);
  }
  
  console.log('\nTesting ingredients with order by created_at (ascending=false)');
  try {
    const result3 = await mockClient
      .from('ingredients')
      .select('*')
      .order('created_at', { ascending: false });
    
    console.log('Ordered ingredients (descending):');
    console.log(result3.data);
  } catch (err) {
    console.error('Error with ingredients order:', err);
  }
}

// Run the test
testMockSupabaseClient().catch(err => console.error('Test failed:', err));
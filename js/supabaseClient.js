// supabaseClient.js
// Using CDN import for direct browser compatibility

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Use the actual Supabase URL and the PUBLIC ANONYMOUS KEY
const SUPABASE_URL = 'https://bzudglfxxywugesncjnz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6dWRnbGZ4eHl3dWdlc25jam56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4Mjk5MDAsImV4cCI6MjA1NzQwNTkwMH0.yYBWuD_bzfyh72URflGqJbn-lIwrZ6oAznxVocgxOm8';

// Ensure credentials exist
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Supabase URL or Anon Key is missing. Cannot initialize Supabase client.');
}

const realClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Simple mock data
const mockData = {
  recipes: [
    { id: 1, name: 'Mock Recipe 1', description: 'A fallback recipe' },
    { id: 2, name: 'Mock Recipe 2', description: 'Another fallback recipe' }
  ],
  ingredients: [
    { id: 1, name: 'Mock Ingredient 1' },
    { id: 2, name: 'Mock Ingredient 2' }
  ]
};

// Create a mock query object that mimics Supabase responses
function createMockQuery(tableName) {
  const baseQuery = {
    select: async () => ({ data: mockData[tableName] || [], error: null }),
    insert: async () => ({ data: null, error: null }),
    update: async () => ({ data: null, error: null }),
    delete: async () => ({ data: null, error: null }),
    order: function() { return this; }, // Chain-able method returns self
    limit: function() { return this; }  // Chain-able method returns self
  };
  return baseQuery;
}

// Proxy to wrap the real client with fallback
export const supabaseClient = new Proxy(realClient, {
  get(target, prop, receiver) {
    if (prop === 'from') {
      return function(tableName) {
        const realQuery = target.from(tableName);
        // Wrap each query method to provide fallback
        return new Proxy(realQuery, {
          get(qTarget, qProp) {
            if (['select', 'insert', 'update', 'delete'].includes(qProp)) {
              return async function(...args) {
                try {
                  const result = await qTarget[qProp](...args);
                  if (result.error) {
                    console.warn('Supabase error on ' + qProp + ': ', result.error);
                    return createMockQuery(tableName)[qProp](...args);
                  }
                  return result;
                } catch (e) {
                  console.warn('Supabase network failure on ' + qProp + ', using fallback', e);
                  return createMockQuery(tableName)[qProp](...args);
                }
              };
            } else if (['order', 'limit'].includes(qProp)) {
              // Handle chainable methods
              return function(...args) {
                try {
                  if (typeof qTarget[qProp] === 'function') {
                    return qTarget[qProp](...args);
                  } else {
                    console.warn(`Supabase method ${qProp} not available, using fallback`);
                    return createMockQuery(tableName);
                  }
                } catch (e) {
                  console.warn(`Error in Supabase ${qProp} method, using fallback`, e);
                  return createMockQuery(tableName);
                }
              };
            }
            // passthrough other properties/methods
            return qTarget[qProp];
          }
        });
      };
    }
    return Reflect.get(target, prop, receiver);
  }
});

console.log('Supabase client with fallback initialized.');

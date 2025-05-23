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
  // Create a base query object with chainable methods
  const query = {};
  
  // Core data methods that return results
  query.select = async () => ({ data: mockData[tableName] || [], error: null });
  query.insert = async () => ({ data: null, error: null });
  query.update = async () => ({ data: null, error: null });
  query.delete = async () => ({ data: null, error: null });
  
  // Chainable methods that return the query object itself
  query.order = function() { return query; };
  query.limit = function() { return query; };
  query.eq = function() { return query; };
  query.neq = function() { return query; };
  query.gt = function() { return query; };
  query.lt = function() { return query; };
  query.gte = function() { return query; };
  query.lte = function() { return query; };
  query.like = function() { return query; };
  query.ilike = function() { return query; };
  query.is = function() { return query; };
  query.in = function() { return query; };
  query.contains = function() { return query; };
  query.containedBy = function() { return query; };
  query.rangeLt = function() { return query; };
  query.rangeGt = function() { return query; };
  query.rangeGte = function() { return query; };
  query.rangeLte = function() { return query; };
  query.rangeAdjacent = function() { return query; };
  query.overlaps = function() { return query; };
  query.textSearch = function() { return query; };
  query.filter = function() { return query; };
  query.match = function() { return query; };
  query.single = function() { return query; };
  
  return query;
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
            // Define which methods are terminal (returning data) vs chainable (returning query)
            const terminalMethods = ['select', 'insert', 'update', 'delete'];
            const chainableMethods = [
              'order', 'limit', 'eq', 'neq', 'gt', 'lt', 'gte', 'lte',
              'like', 'ilike', 'is', 'in', 'contains', 'containedBy',
              'rangeLt', 'rangeGt', 'rangeGte', 'rangeLte', 'rangeAdjacent',
              'overlaps', 'textSearch', 'filter', 'match', 'single'
            ];
            
            // Handle terminal methods (that execute the query and return data)
            if (terminalMethods.includes(qProp)) {
              return async function(...args) {
                try {
                  console.log(`Executing Supabase ${qProp} on ${tableName}`);
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
            }
            // Handle chainable methods (that return the query builder)
            else if (chainableMethods.includes(qProp)) {
              return function(...args) {
                try {
                  if (typeof qTarget[qProp] === 'function') {
                    console.log(`Chaining Supabase method ${qProp} on ${tableName}`);
                    return qTarget[qProp](...args);
                  } else {
                    console.warn(`Supabase method ${qProp} not available on real client, using fallback`);
                    const mockQuery = createMockQuery(tableName);
                    return mockQuery[qProp](...args);
                  }
                } catch (e) {
                  console.warn(`Error in Supabase ${qProp} method, using fallback`, e);
                  const mockQuery = createMockQuery(tableName);
                  return mockQuery[qProp](...args);
                }
              };
            }
            
            // Passthrough other properties/methods
            return qTarget[qProp];
          }
        });
      };
    }
    return Reflect.get(target, prop, receiver);
  }
});

console.log('Supabase client with fallback initialized.');

/** @type {import('jest').Config} */
export default {
  // Use babel-jest with specific options
  transform: {
    '^.+\\.js$': [
      'babel-jest',
      {
        // Force CommonJS modules for tests
        presets: [
          ['@babel/preset-env', {
            targets: { node: 'current' },
            modules: 'commonjs'
          }]
        ]
      }
    ]
  },
  moduleFileExtensions: ['js', 'json', 'jsx', 'node'],
  // Default to jsdom environment
  testEnvironment: 'jest-environment-jsdom',
  // Setup files for jsdom environment
  setupFilesAfterEnv: ['./tests/test-setup.js', '@testing-library/jest-dom/extend-expect'],
  // Setup files for node environment will be specified in test files
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js', '!**/puppeteer.test.js'],
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: [
    'js/**/*.js',
    '!**/node_modules/**',
    '!**/__mocks__/**'
  ],
  transformIgnorePatterns: [
    '/node_modules/(?!(@supabase)/)'
  ],
  // Mock modules
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    // Mock CDN imports
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/\\+esm': '<rootDir>/js/__mocks__/supabaseClient.js'
  },
  // Override test environment for specific files
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons']
  },
  // Automatically clear mocks between tests
  clearMocks: true,
  // Respect the test environment specified in the test file
  testEnvironment: 'jest-environment-jsdom'
};
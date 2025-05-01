module.exports = {
  transform: {
    '^.+\\.(js|ts|tsx)$': 'babel-jest',
  },
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
  setupFilesAfterEnv: ['./tests/test-setup.js', './tests/setup.js', '@testing-library/jest-dom/extend-expect'],
  testMatch: [
    '**/__tests__/**/*.{js,ts,tsx}',
    '**/?(*.)+(spec|test).{js,ts,tsx}'
  ],
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: [
    'js/**/*.js',
    'modern-diy-recipes/src/**/*.{js,ts,tsx}',
    '!**/node_modules/**'
  ],
  transformIgnorePatterns: [
    "node_modules/(?!(@supabase)/)"
  ],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "^(\\.{1,2}/.*)\\.ts$": "$1",
    "^(\\.{1,2}/.*)\\.tsx$": "$1",
    "^@providers/(.*)$": "<rootDir>/DIY_Recipes/providers/$1"
  }
};
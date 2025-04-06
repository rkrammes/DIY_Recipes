module.exports = {
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'json', 'jsx', 'node'],
  setupFilesAfterEnv: ['./tests/test-setup.js', './tests/setup.js', '@testing-library/jest-dom/extend-expect'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: [
    'js/**/*.js',
    '!**/node_modules/**'
  ],
  transformIgnorePatterns: [
    "node_modules/(?!(@supabase)/)"
  ],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1"
  }
};
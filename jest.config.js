export default {
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'json', 'jsx', 'node'],
  setupFiles: ['./tests/setup.js'], // Include the setup file for environment variables
  setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: [
    'js/**/*.js',
    '!**/node_modules/**'
  ]
};
module.exports = {
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'jsx', 'node'],
  setupFiles: ['./tests/setup.js'], // Include the setup file for environment variables
};
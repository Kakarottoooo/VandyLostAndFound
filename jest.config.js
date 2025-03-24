// jest.config.js
module.exports = {
    testEnvironment: 'jsdom',
    setupFiles: ['<rootDir>/jest.setup.js'], // Ensure this is setupFiles
    moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
    transform: {
      '^.+\\.(js|jsx)$': 'babel-jest',
    },
  };
  
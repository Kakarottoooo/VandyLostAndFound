// jest.config.cjs
module.exports = {
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/jest.setup.js'], // Global setup (TextEncoder, etc.)
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],

  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest', // Use Babel for JSX/ESM parsing
  },

  transformIgnorePatterns: [
    '/node_modules/(?!(chai|@chakra-ui/react|react-router-dom)/)', // Ensure ESM deps are not ignored
  ],

  moduleNameMapper: {
    // Handle static assets (optional)
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },

  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
  ],
};

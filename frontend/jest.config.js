// frontend/jest.config.js
export default {
  rootDir: '.',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleDirectories: ['node_modules'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  testMatch: [
    '<rootDir>/../test/frontend/**/*.test.[jt]s?(x)',
    '<rootDir>/../test/frontend/**/*.spec.[jt]s?(x)'
  ],
};

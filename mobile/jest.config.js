module.exports = {
  preset: 'react-native',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
    'node_modules/react-native-reanimated/.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect',
    'react-native-gesture-handler/jestSetup',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-gesture-handler|react-native-reanimated|react-native-safe-area-context|react-native-svg|react-native-toast-message|react-native-vector-icons)/)'
  ],
  moduleNameMapper: {
    'react-native-config': '<rootDir>/__mocks__/react-native-config.js',
    'react-native-reanimated': 'react-native-reanimated/mock',
    '@react-native-async-storage/async-storage': '@react-native-async-storage/async-storage/jest/async-storage-mock',
  },
};



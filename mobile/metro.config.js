const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    alias: {
      // Avoid react-native-crypto which pulls RNRandomBytes and causes 'seed' crash
      stream: 'readable-stream',
      http: '@tradle/react-native-http',
      https: 'https-browserify',
      url: 'react-native-url-polyfill/auto',
    },
    fallback: {
      stream: require.resolve('readable-stream'),
      http: require.resolve('@tradle/react-native-http'),
      https: require.resolve('https-browserify'),
      url: require.resolve('react-native-url-polyfill/auto'),
      fs: false,
      net: false,
      tls: false,
    },
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = mergeConfig(defaultConfig, config); 
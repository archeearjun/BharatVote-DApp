import 'react-native-gesture-handler';
import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';
image.pngimport { enableScreens } from 'react-native-screens';
import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './package.json';

// Enable screens for better performance
enableScreens(true);

// Note: avoid react-native-crypto; it pulls RNRandomBytes and crashes if native module isn't linked
AppRegistry.registerComponent(appName, () => App); 
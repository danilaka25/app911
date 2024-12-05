/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import firebase from '@react-native-firebase/app';
import 'react-native-reanimated';


 

if (!firebase.apps.length) {
  firebase.initializeApp();
}

if (__DEV__) {
  require('$root/ReactotronConfig');
}

AppRegistry.registerComponent(appName, () => App);

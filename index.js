/**
 * @format
 */

import 'react-native-gesture-handler';
import { AppRegistry, LogBox } from 'react-native';
import App from './src/app';
import { name as appName } from './app.json';
import 'moment/locale/vi';
import './src/core/themes/SafeList';

LogBox.ignoreLogs(['Sending `onReanimatedPropsChange` with no listeners registered.']);

AppRegistry.registerComponent(appName, () => App);

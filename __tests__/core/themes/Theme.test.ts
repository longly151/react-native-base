import { Platform } from 'react-native';

test('should run correctly', () => {
  Platform.OS = 'ios';
  const iosDefaultTheme = require('@themes/DefaultColor');
  expect(iosDefaultTheme.default.colors.background).toEqual('#f2f2f7');

  jest.resetModules();

  Platform.OS = 'android';
  const androidDefaultTheme = require('@themes/DefaultColor');
  expect(androidDefaultTheme.default.colors.background).toEqual('#f2f2f2');
});

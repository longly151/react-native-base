import AppHelper from '@utils/AppHelper';
import i18next from 'i18next';
import React from 'react';
import { Text } from 'react-native';

global.console = {
  ...console,
  log: jest.fn(),
};

const { showMessage } = require('react-native-flash-message');
const mockShowMessage = jest.fn();
jest.mock('react-native-flash-message', () => ({
  ...jest.requireActual('react-native-flash-message'),
  showMessage: jest.fn(),
}));

showMessage.mockImplementation(mockShowMessage);

test('should run correctly', async () => {
  // getParams
  expect(AppHelper.getParams({ route: { params: { id: 1 } } })).toEqual({ id: 1 });

  // getDataFromParams
  expect(AppHelper.getDataFromParams({ route: { params: { item: { id: 1 } } } })).toEqual({
    id: 1,
  });

  // setDataIntoParams
  expect(AppHelper.setDataIntoParams({ id: 1 })).toEqual({ item: { id: 1 } });

  // showIsConnectionMessage
  AppHelper.showIsConnectionMessage();
  expect(mockShowMessage).toBeCalledWith({
    message: i18next.t('common.noInternet'),
    type: 'danger',
  });

  // showNotificationMessage
  AppHelper.showNotificationMessage({ notification: { title: 'Title', body: 'Body' } });
  const otherMessageProps = {
    backgroundColor: '#315DF7',
    icon: 'info',
    duration: 5000,
    hideStatusBar: true,
    titleStyle: { fontWeight: 'bold', fontSize: 15 },
    onPress: undefined,
  };
  expect(mockShowMessage).toBeCalledWith({
    message: 'Title',
    description: 'Body',
    ...otherMessageProps,
  });
  AppHelper.showNotificationMessage({ notification: { title: '', body: 'Body' } });
  expect(mockShowMessage).toBeCalledWith({
    message: '',
    description: 'Body',
    ...otherMessageProps,
  });
  AppHelper.showNotificationMessage({ notification: { title: '', body: 'Body' } });

  // setGlobalDeviceInfo
  await AppHelper.setGlobalDeviceInfo();
  expect(global.deviceInfo).toEqual({
    uniqueId: 'unknown',
    deviceName: 'unknown',
    systemName: 'unknown',
    systemVersion: 'unknown',
    isTablet: false,
    brand: 'unknown',
    model: 'unknown',
    buildNumber: NaN,
    buildVersion: 'unknown',
    manufacturer: 'unknown',
  });

  // compareProps
  const shouldUpdate = AppHelper.compareProps('Detail', { id: 1 }, { id: 2 });
  expect(shouldUpdate).toBe(true);

  const shouldNotUpdate = AppHelper.compareProps('Detail', { id: 1 }, { id: 1 });
  expect(shouldNotUpdate).toBe(false);

  // getComponentDisplayName
  expect(AppHelper.getComponentDisplayName(<Text />)).toBe('Component');
});

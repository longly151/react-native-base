import React from 'react';
import Navigation from '@utils/Navigation';
import {
  failCredential,
  failLoginResponse,
  fireEvent,
  mockAxios,
  render,
  successCredential,
  successLoginResponse,
  waitFor,
  waitForElementToBeRemoved,
} from '@utils/TestHelper';
import MainStack from '@containers/routes/index';
import { Platform } from 'react-native';
import navigation from '@react-navigation/native';
import Config from 'react-native-config';

global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
};

beforeEach(() => {
  Platform.OS = 'android';
  Config.NODE_ENV = 'production';
});

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
}));

jest.mock('react-native/Libraries/Components/StatusBar/StatusBar', () => 'StatusBar');

mockAxios.onPost('/auth/login', successCredential).reply(200, successLoginResponse);
mockAxios.onPost('/auth/login', failCredential).reply(401, failLoginResponse);

test('should keep showing login screen with invalid credential', async () => {
  const { getByTestId, findByTestId } = render(<MainStack />);

  await waitFor(() => expect(Navigation.getCurrentRoute()?.name).toBe('Login'));

  fireEvent.changeText(getByTestId('EmailInput'), failCredential.email);
  fireEvent.changeText(getByTestId('PasswordInput'), failCredential.password);
  fireEvent.press(getByTestId('LoginButton'));

  await findByTestId('Loading');

  await waitFor(() => expect(Navigation.getCurrentRoute()?.name).toBe('Login'));
  await waitFor(() =>
    expect(getByTestId('ErrorText')).toHaveTextContent('Incorrect email or password'),
  );
});

test('should show mainStack with valid credential', async () => {
  const { getByTestId, queryByTestId, findByTestId } = render(<MainStack />);

  await waitFor(() => expect(Navigation.getCurrentRoute()?.name).toBe('Login'));

  expect(getByTestId('EmailInput')).toHaveTextContent('');
  expect(getByTestId('PasswordInput')).toHaveTextContent('');

  fireEvent.changeText(getByTestId('EmailInput'), successCredential.email);
  fireEvent.changeText(getByTestId('PasswordInput'), successCredential.password);
  fireEvent.press(getByTestId('LoginButton'));

  await findByTestId('Loading');

  await waitForElementToBeRemoved(() => queryByTestId('Login'));
  await waitFor(() => expect(Navigation.getCurrentRoute()?.name).toBe('HomeTab'));

  global.fn.setIsTabBarHidden(true);
  Navigation.openDrawer();

  // Unfocus
  navigation.useIsFocused = jest.fn().mockReturnValue(false);
  render(<MainStack />);
});

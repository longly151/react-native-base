/* eslint-disable prefer-destructuring */
import React from 'react';
import { act, fireEvent, render, renderHook, waitFor } from '@utils/TestHelper';
import ModalProvider from '@components/common/Modal/ModalProvider';
import { useAppSelector } from '@utils/Redux';
import Navigation from '@utils/Navigation';
import MainStack from '@routes';
import ExpoActionSheet, { ActionSheetProvider } from '@expo/react-native-action-sheet';
import AppSettings from '@screens/Main/Settings/Tab';
import RNNavigation from '@react-navigation/native';
import DarkColor from '@themes/DarkColor';
import { Platform } from 'react-native';

global.console = {
  ...console,
  error: jest.fn(),
};

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
}));

jest.mock('@expo/react-native-action-sheet', () => ({
  ...jest.requireActual('@expo/react-native-action-sheet'),
}));
const useActionSheet = jest.spyOn(ExpoActionSheet, 'useActionSheet');

beforeEach(() => {
  Platform.OS = 'ios';
});

test('should run correctly', async () => {
  /**
   * Setup Test
   */
  const options = ['English', 'Tiếng Việt'];

  const showActionSheetWithOptions = jest.fn();
  useActionSheet.mockReturnValue({
    showActionSheetWithOptions,
  });

  const Wrapper = ({ children }: any) => (
    <ActionSheetProvider>
      <ModalProvider>{children}</ModalProvider>
    </ActionSheetProvider>
  );
  const { getByTestId, findByText } = render(<MainStack />, {
    wrapper: Wrapper,
    withAuth: true,
  });

  const { result } = renderHook(
    () => useAppSelector(state => [state.app.colorScheme, state.app.language, state.auth.data]),
    { withAuth: true },
  );

  await waitFor(() => expect(Navigation.getCurrentRoute()?.name).toBe('HomeTab'));

  Navigation.navigate('SettingsTab');

  await waitFor(() => expect(Navigation.getCurrentRoute()?.name).toBe('SettingsTab'));

  expect(result.current[2]).toBeTruthy(); // Data !== undefined

  /**
   * Theme
   */
  expect(getByTestId('ThemeSwitch')).toHaveProp('value', false);

  fireEvent(getByTestId('ThemeSwitch'), 'onValueChange');
  await waitFor(() => expect(result.current[0]).toBe('dark'));

  // userInterfaceStyle (isDark === true)
  const themeMock = jest.spyOn(RNNavigation, 'useTheme');

  themeMock.mockReturnValue(DarkColor);
  const showActionSheetWithOptionsDark = jest.fn();
  useActionSheet.mockReturnValue({
    showActionSheetWithOptions: showActionSheetWithOptionsDark,
  });

  const { getByTestId: getByTestIdDarkTheme } = render(<AppSettings />, {
    wrapper: Wrapper,
    withAuth: true,
    disableNavigationRef: true,
  });

  fireEvent.press(getByTestIdDarkTheme('Language'));
  const actionSheetConfigDark = showActionSheetWithOptionsDark.mock.calls[0][0];
  expect(actionSheetConfigDark.userInterfaceStyle).toEqual('dark');

  themeMock.mockRestore();

  /**
   * Language
   */
  fireEvent.press(getByTestId('Language'));

  const actionSheetConfig = showActionSheetWithOptions.mock.calls[0][0];
  const actionSheetCallback = showActionSheetWithOptions.mock.calls[0][1];

  expect(actionSheetConfig.destructiveButtonIndex).toEqual(undefined);
  expect(actionSheetConfig.options).toEqual([...options, 'Cancel']);

  await act(async () => {
    await actionSheetCallback(1);
  });
  await findByText('Ngôn ngữ');
  await findByText(options[1]);

  await act(async () => {
    await actionSheetCallback(0);
  });
  await findByText('Language');
  await findByText(options[0]);

  Platform.OS = 'android';
  const showActionSheetWithOptionsAndroid = jest.fn();
  useActionSheet.mockReturnValue({
    showActionSheetWithOptions: showActionSheetWithOptionsAndroid,
  });

  const { getByTestId: getByTestIdAndroid } = render(<AppSettings />, {
    wrapper: Wrapper,
    withAuth: true,
    disableNavigationRef: true,
  });

  fireEvent.press(getByTestIdAndroid('Language'));
  const actionSheetConfigAndroid = showActionSheetWithOptionsAndroid.mock.calls[0][0];
  expect(actionSheetConfigAndroid.destructiveButtonIndex).toEqual(options.length);

  /**
   * Logout
   */
  fireEvent.press(getByTestId('Logout'));
  fireEvent.press(getByTestId('OkButton'));

  await waitFor(() => expect(result.current[2]).toBeFalsy());
  expect(Navigation.getCurrentRoute()?.name).toBe('Login');
});

/* eslint-disable prefer-destructuring */
import React from 'react';
import { act, fireEvent, render, waitFor } from '@utils/TestHelper';
import Picker, { PickerType } from '@components/common/Picker/index';
import ExpoActionSheet, { ActionSheetProvider } from '@expo/react-native-action-sheet';
import DefaultColor from '@themes/DefaultColor';
import DarkColor from '@themes/DarkColor';
import AppView from '@utils/AppView';
import Color from 'color';
import { Platform } from 'react-native';
import * as Yup from 'yup';
import { Button } from '@components';
import { Formik } from 'formik';

global.console = {
  ...console,
  error: jest.fn(),
};

let mockTheme = DefaultColor;
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useTheme: jest.fn().mockImplementation(() => mockTheme),
}));

jest.mock('@expo/react-native-action-sheet', () => ({
  ...jest.requireActual('@expo/react-native-action-sheet'),
}));
const useActionSheet = jest.spyOn(ExpoActionSheet, 'useActionSheet');

const title = 'Select gender';
const options = ['Male', 'Female'];
const selectedIndex = 0;

beforeEach(() => {
  mockTheme = DefaultColor;
  Platform.OS = 'ios';
});

test('should render correctly', () => {
  const { toJSON, getByTestId } = render(<Picker options={['Male', 'Female']} />, {
    wrapper: ActionSheetProvider,
  });
  expect(toJSON()).toMatchSnapshot();
  expect(getByTestId('ContainerView')).toBeTruthy();
});

test('should have working props when unfocusing', () => {
  const { getByTestId, queryByTestId, rerender } = render(
    <Picker
      options={['Male', 'Female']}
      placeholderTextColor={mockTheme.colors.grey4}
      className="flex-1 flex-row self-center justify-between items-center rounded border mx-1 my-1 p-1 border-sky-700 bg-sky-500 text-white font-Roboto font-bold italic underline"
    />,
    {
      wrapper: ActionSheetProvider,
    },
  );

  // title, leftIcon, rightIcon should be null when the relevant props don't exist
  expect(queryByTestId('TitleText')).toBeFalsy();
  expect(queryByTestId('LeftIcon')).toBeFalsy();
  expect(queryByTestId('RightIcon')).toBeFalsy();

  // title, leftIcon, rightIcon should not be null when the relevant props exist
  const RootComponent = (
    <Picker
      title="Select gender"
      leftIconProps={{ name: 'search', size: 24 }}
      rightIconProps={{ name: 'close', size: 24 }}
      options={['Male', 'Female']}
      placeholderTextColor={mockTheme.colors.grey4}
      className="flex-1 flex-row self-center justify-between items-center rounded border mx-1 my-1 p-1 border-sky-700 bg-sky-500 text-white font-Roboto font-bold italic underline"
    />
  );
  rerender(RootComponent);

  expect(getByTestId('TitleText')).toBeTruthy();
  expect(getByTestId('LeftIcon')).toBeTruthy();
  expect(getByTestId('RightIcon')).toBeTruthy();

  // style testing
  expect(getByTestId('ContainerView')).toHaveStyle({
    flexGrow: 1,
    flexShrink: 1,
    flexDirection: 'row',
    alignSelf: 'center',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 4,
    marginRight: 4,
    marginTop: 4,
    marginBottom: 4,
  });

  expect(getByTestId('PickerButton')).toHaveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftColor: 'rgba(3, 105, 161, 1)',
    borderRightColor: 'rgba(3, 105, 161, 1)',
    borderTopColor: 'rgba(3, 105, 161, 1)',
    borderBottomColor: 'rgba(3, 105, 161, 1)',
    backgroundColor: 'rgba(14, 165, 233, 1)',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderRadius: AppView.roundedBorderRadius,
    borderColor: Color(mockTheme.colors.grey5).darken(0.1).hex(), // unfocus borderColor
  });

  expect(getByTestId('OptionText')).toHaveStyle({
    paddingLeft: 4,
    paddingRight: 4,
    paddingTop: 4,
    paddingBottom: 4,
    color: mockTheme.colors.grey4, // placeholderColor
    fontFamily: 'Roboto',
    fontWeight: '700',
    fontStyle: 'italic',
    textDecorationLine: 'underline',
  });

  /**
   * DarkColor
   */
  mockTheme = DarkColor;
  const { getByTestId: getByTestIdDarkTheme } = render(RootComponent);

  expect(getByTestIdDarkTheme('PickerButton')).toHaveStyle({
    borderColor: mockTheme.colors.grey5, // unfocus borderColor
  });
});

test('should have working props when focusing', async () => {
  /**
   * Setup Test
   */
  const focusIfEmpty = jest.fn();
  const showActionSheetWithOptions = jest.fn();

  useActionSheet.mockReturnValue({
    showActionSheetWithOptions,
  });

  const RootComponent = (
    <Picker
      title={title}
      leftIconProps={{ name: 'search', size: 24 }}
      rightIconProps={{ name: 'close', size: 24 }}
      options={options}
      placeholderTextColor={mockTheme.colors.grey4}
      className="flex-1 flex-row self-center justify-between items-center rounded border mx-1 my-1 p-1 border-sky-700 bg-sky-500 text-white font-Roboto font-bold italic underline"
      nextFieldRef={{ current: { focusIfEmpty } }}
    />
  );
  const { getByTestId } = render(RootComponent, {
    wrapper: ActionSheetProvider,
  });

  /**
   * Press Button (Focus Trigger)
   */
  fireEvent.press(getByTestId('PickerButton'));

  const actionSheetConfig = showActionSheetWithOptions.mock.calls[0][0];
  const actionSheetCallback = showActionSheetWithOptions.mock.calls[0][1];

  expect(actionSheetConfig.title).toEqual(title);
  expect(actionSheetConfig.options).toEqual([...options, 'Cancel']);

  expect(getByTestId('PickerButton')).toHaveStyle({
    borderColor: mockTheme.colors.primary, // focus borderColor
  });

  expect(getByTestId('OptionText')).toHaveTextContent('');
  expect(getByTestId('OptionText')).toHaveStyle({
    color: mockTheme.colors.grey4, // placeholderColor
  });

  expect(showActionSheetWithOptions).toBeCalledTimes(1);

  /**
   * Select Item
   */
  await act(async () => {
    await actionSheetCallback(selectedIndex);
  });
  expect(getByTestId('OptionText')).toHaveTextContent(options[selectedIndex]);
  expect(getByTestId('OptionText')).toHaveStyle({
    color: 'rgba(255, 255, 255, 1)', // textColor
  });
  expect(actionSheetConfig.userInterfaceStyle).toEqual('light');

  await waitFor(() => expect(focusIfEmpty).toBeCalledTimes(1));

  /**
   * DarkColor
   */
  mockTheme = DarkColor;

  const showActionSheetWithOptionsDark = jest.fn();
  useActionSheet.mockReturnValue({
    showActionSheetWithOptions: showActionSheetWithOptionsDark,
  });
  const { getByTestId: getByTestIdDarkTheme } = render(RootComponent);

  fireEvent.press(getByTestIdDarkTheme('PickerButton'));
  const actionSheetConfigDark = showActionSheetWithOptionsDark.mock.calls[0][0];
  expect(actionSheetConfigDark.userInterfaceStyle).toEqual('dark');
});

test('should work correctly on iOS & Android', async () => {
  /**
   * iOS
   */
  Platform.OS = 'ios';
  const showActionSheetWithOptions = jest.fn();
  useActionSheet.mockReturnValue({
    showActionSheetWithOptions,
  });

  const { getByTestId, rerender } = render(<Picker title={title} options={options} />, {
    wrapper: ActionSheetProvider,
  });

  fireEvent.press(getByTestId('PickerButton'));

  const actionSheetCallback = showActionSheetWithOptions.mock.calls[0][1];
  const actionSheetConfig = showActionSheetWithOptions.mock.calls[0][0];

  expect(actionSheetConfig.destructiveButtonIndex).toEqual(undefined);

  await act(async () => {
    await actionSheetCallback(0);
  });

  /**
   * Android
   */
  Platform.OS = 'android';
  const showActionSheetWithOptionsAndroid = jest.fn();
  useActionSheet.mockReturnValue({
    showActionSheetWithOptions: showActionSheetWithOptionsAndroid,
  });

  rerender(<Picker title={title} options={options} />);
  fireEvent.press(getByTestId('PickerButton'));

  const actionSheetConfigAndroid = showActionSheetWithOptionsAndroid.mock.calls[0][0];
  expect(actionSheetConfigAndroid.destructiveButtonIndex).toEqual(options.length);

  await act(async () => {
    await actionSheetCallback(0);
  });
});

test('should work correctly with formik & nextField', async () => {
  /**
   * Setup Test
   */
  const showActionSheetWithOptions = jest.fn();
  useActionSheet.mockReturnValue({
    showActionSheetWithOptions,
  });

  const focusIfEmpty = jest.fn();
  const onCancel = jest.fn();

  const error = 'Gender is required';
  const formValidationSchema = Yup.object().shape({
    gender: Yup.number().required(error),
  });

  const onSubmit = jest.fn();

  const pickerRef: React.RefObject<PickerType> = React.createRef();
  const RootComponent = (
    <Formik
      validationSchema={formValidationSchema}
      initialValues={{
        gender: undefined,
      }}
      onSubmit={onSubmit}
    >
      {formikProps => (
        <>
          <Picker
            ref={pickerRef}
            formikProps={formikProps}
            name="gender"
            options={options}
            title={title}
            onCancel={onCancel}
            nextFieldRef={{ current: { focusIfEmpty } }}
          />
          <Button testID="SubmitButton" title="Submit" onPress={formikProps.handleSubmit} />
        </>
      )}
    </Formik>
  );
  const { getByTestId, queryByTestId, findByTestId } = render(RootComponent, {
    wrapper: ActionSheetProvider,
  });

  /**
   * Trigger focusIfEmpty
   */
  act(() => pickerRef.current?.focusIfEmpty());
  expect(getByTestId('PickerButton')).toHaveStyle({
    borderColor: mockTheme.colors.primary, // focus borderColor
  });

  /**
   * Trigger Error
   */
  fireEvent.press(getByTestId('SubmitButton'));

  expect(focusIfEmpty).toBeCalledTimes(0);
  expect(onSubmit).toBeCalledTimes(0);
  const errorText = await findByTestId('ErrorText');
  expect(errorText).toHaveTextContent(error);

  /**
   * Cancel ActionSheet
   */
  fireEvent.press(getByTestId('PickerButton'));

  const actionSheetCallback = showActionSheetWithOptions.mock.calls[0][1];
  await act(async () => {
    await actionSheetCallback(undefined);
  });
  expect(onCancel).toBeCalledTimes(1);

  /**
   * Successfully Select Item
   */
  fireEvent.press(getByTestId('PickerButton'));

  await act(async () => {
    await actionSheetCallback(selectedIndex);
  });

  expect(getByTestId('OptionText')).toHaveTextContent(options[selectedIndex]);

  fireEvent.press(getByTestId('SubmitButton'));
  await findByTestId('SubmitButton');

  await waitFor(() => expect(focusIfEmpty).toBeCalledTimes(1));
  expect(queryByTestId('ErrorText')).toBeFalsy();
  expect(onSubmit).toBeCalledTimes(1);
  expect(onSubmit).toHaveBeenCalledWith(
    {
      gender: selectedIndex,
    },
    expect.anything(),
  );
});

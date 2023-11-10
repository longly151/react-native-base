import React from 'react';
import { fireEvent, render, waitFor } from '@utils/TestHelper';
import Input, { InputType } from '@components/common/Input/index';
import { Button, Platform } from 'react-native';
import DefaultColor from '@themes/DefaultColor';
import AppView from '@utils/AppView';
import Color from 'color';
import DarkColor from '@themes/DarkColor';
import { act } from 'react-test-renderer';
import * as Yup from 'yup';
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

const title = 'Select gender';
const text = 'abc@gmail.com';

beforeEach(() => {
  mockTheme = DefaultColor;
  Platform.OS = 'ios';
});

test('should render correctly', () => {
  const { toJSON, getByTestId } = render(<Input />);
  expect(toJSON()).toMatchSnapshot();
  expect(getByTestId('Input')).toBeTruthy();
});

test('should have working props when unfocusing', () => {
  const { getByTestId, queryByTestId, rerender } = render(
    <Input
      placeholderTextColor={mockTheme.colors.grey4}
      className="flex-1 flex-row self-center justify-between items-center rounded border mx-1 my-1 p-1 border-sky-700 bg-sky-500 text-white font-Roboto font-bold italic underline"
    />,
  );

  // title, leftIcon, rightIcon should be null when the relevant props don't exist
  expect(queryByTestId('TitleText')).toBeFalsy();
  expect(queryByTestId('LeftIcon')).toBeFalsy();
  expect(queryByTestId('RightIcon')).toBeFalsy();

  // title, leftIcon, rightIcon should not be null when the relevant props exist
  const RootComponent = (
    <Input
      title="Email"
      leftIconProps={{ name: 'search', size: 24 }}
      rightIconProps={{ name: 'close', size: 24 }}
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

  expect(getByTestId('InputView')).toHaveStyle({
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

  expect(getByTestId('Input')).toHaveProp('placeholderTextColor', mockTheme.colors.grey4);
  expect(getByTestId('Input')).toHaveStyle({
    paddingLeft: 4,
    paddingRight: 4,
    paddingTop: 4,
    paddingBottom: 4,
    color: 'rgba(255, 255, 255, 1)',
    fontFamily: 'Roboto',
    fontWeight: '700',
    fontStyle: 'italic',
    textDecorationLine: 'underline',
  });

  /**
   * Outline
   */
  rerender(<Input outline />);

  expect(getByTestId('InputView')).toHaveStyle({
    backgroundColor: 'transparent',
  });

  /**
   * Clear
   */
  rerender(<Input clear />);

  expect(getByTestId('InputView')).toHaveStyle({
    backgroundColor: 'transparent',
  });

  /**
   * DarkColor
   */
  mockTheme = DarkColor;
  const { getByTestId: getByTestIdDarkTheme } = render(RootComponent);

  expect(getByTestIdDarkTheme('InputView')).toHaveStyle({
    borderColor: mockTheme.colors.grey5, // unfocus borderColor
  });
});

test('should have working props when focusing', async () => {
  const inputRef: React.RefObject<InputType> = React.createRef();
  const focusIfEmpty = jest.fn();

  const RootComponent = (
    <Input
      ref={inputRef}
      title="Email"
      leftIconProps={{ name: 'search', size: 24 }}
      rightIconProps={{ name: 'close', size: 24 }}
      placeholderTextColor={mockTheme.colors.grey4}
      nextFieldRef={{ current: { focusIfEmpty } }}
      className="flex-1 flex-row self-center justify-between items-center rounded border mx-1 my-1 p-1 border-sky-700 bg-sky-500 text-white font-Roboto font-bold italic underline"
    />
  );
  const { getByTestId, rerender } = render(RootComponent);

  /**
   * Input text (Focus Trigger)
   */
  fireEvent(getByTestId('Input'), 'focus');
  expect(getByTestId('InputView')).toHaveStyle({
    borderColor: mockTheme.colors.primary, // focus borderColor
  });
  expect(getByTestId('Input')).toHaveTextContent('');

  // focusIfEmpty nextFieldRef
  fireEvent(getByTestId('Input'), 'onSubmitEditing');
  await waitFor(() => expect(focusIfEmpty).toBeCalledTimes(1));

  // Auto focus
  rerender(<Input autoFocus />);
  expect(getByTestId('InputView')).toHaveStyle({
    borderColor: mockTheme.colors.primary, // focus borderColor
  });
});

test('should work correctly on iOS & Android', () => {
  /**
   * Android
   */
  Platform.OS = 'android';
  const inputRef: React.RefObject<InputType> = React.createRef();

  const RootComponent = <Input ref={inputRef} />;
  const { getByTestId } = render(RootComponent);

  const setIsTabBarHidden = jest.fn();
  global.fn = {
    setIsTabBarHidden,
  };

  fireEvent(getByTestId('Input'), 'focus');
  expect(setIsTabBarHidden).toHaveBeenCalledWith(true);

  fireEvent(getByTestId('Input'), 'blur');
  expect(setIsTabBarHidden).toHaveBeenCalledWith(false);
});

test('should work correctly with formik & nextField', async () => {
  /**
   * Setup Test
   */

  const focusIfEmpty = jest.fn();
  const onChangeText = jest.fn();

  const error = 'Email is required';
  const formValidationSchema = Yup.object().shape({
    email: Yup.string().required(error),
  });

  const onSubmit = jest.fn();

  const inputRef: React.RefObject<InputType> = React.createRef();
  const RootComponent = (
    <Formik
      validationSchema={formValidationSchema}
      initialValues={{
        email: '',
      }}
      onSubmit={onSubmit}
    >
      {formikProps => (
        <>
          <Input
            ref={inputRef}
            formikProps={formikProps}
            name="email"
            title={title}
            onChangeText={onChangeText}
            nextFieldRef={{ current: { focusIfEmpty } }}
          />
          <Button testID="SubmitButton" title="Submit" onPress={formikProps.handleSubmit} />
        </>
      )}
    </Formik>
  );
  const { getByTestId, queryByTestId, findByTestId } = render(RootComponent);

  /**
   * Trigger focusIfEmpty
   */
  fireEvent(getByTestId('Input'), 'focus');
  act(() => inputRef.current?.focusIfEmpty());
  expect(getByTestId('InputView')).toHaveStyle({
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
   * Successfully Input
   */
  fireEvent.changeText(getByTestId('Input'), text);
  expect(onChangeText).toHaveBeenCalledWith(text);
  expect(inputRef.current?.getText()).toEqual(text);

  fireEvent(getByTestId('Input'), 'onSubmitEditing');

  await waitFor(() => expect(focusIfEmpty).toBeCalledTimes(1));
  expect(queryByTestId('ErrorText')).toBeFalsy();

  fireEvent.press(getByTestId('SubmitButton'));
  await waitFor(() => expect(onSubmit).toBeCalledTimes(1));
  expect(onSubmit).toHaveBeenCalledWith(
    {
      email: text,
    },
    expect.anything(),
  );
});

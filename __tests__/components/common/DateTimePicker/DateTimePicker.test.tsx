import React from 'react';
import { act, fireEvent, render, waitFor } from '@utils/TestHelper';
import DateTimePicker, { DateTimePickerType } from '@components/common/DateTimePicker/index';
import AppView from '@utils/AppView';
import Color from 'color';
import DefaultColor from '@themes/DefaultColor';
import DarkColor from '@themes/DarkColor';
import { Button, Platform } from 'react-native';
import moment from 'moment';
import i18next from 'i18next';
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

const title = 'Select birthday';
const selectedDate = new Date();

beforeEach(() => {
  mockTheme = DefaultColor;
  Platform.OS = 'ios';
});

test('should render correctly', () => {
  const { toJSON, getByTestId, queryByTestId } = render(<DateTimePicker />);
  expect(toJSON()).toMatchSnapshot();
  expect(getByTestId('ContainerView')).toBeTruthy();
  expect(queryByTestId('DateTimePickerModal')).toBeFalsy();
});

test('should have working props when unfocusing', () => {
  const { getByTestId, queryByTestId, rerender } = render(
    <DateTimePicker
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
    <DateTimePicker
      title={title}
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

  expect(getByTestId('DateTimePickerButton')).toHaveStyle({
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

  expect(getByTestId('DateTimeText')).toHaveStyle({
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

  expect(getByTestIdDarkTheme('DateTimePickerButton')).toHaveStyle({
    borderColor: mockTheme.colors.grey5, // unfocus borderColor
  });
});

test('should have working props when focusing', async () => {
  /**
   * Setup Test
   */
  const dateTimePickerRef: React.RefObject<DateTimePickerType> = React.createRef();
  const focusIfEmpty = jest.fn();

  const RootComponent = (
    <DateTimePicker
      ref={dateTimePickerRef}
      title={title}
      leftIconProps={{ name: 'search', size: 24 }}
      rightIconProps={{ name: 'close', size: 24 }}
      placeholderTextColor={mockTheme.colors.grey4}
      className="flex-1 flex-row self-center justify-between items-center rounded border mx-1 my-1 p-1 border-sky-700 bg-sky-500 text-white font-Roboto font-bold italic underline"
      nextFieldRef={{ current: { focusIfEmpty } }}
    />
  );
  const { getByTestId, rerender } = render(RootComponent);

  /**
   * Press Button (Focus Trigger)
   */
  fireEvent.press(getByTestId('DateTimePickerButton'));

  expect(getByTestId('DateTimePickerButton')).toHaveStyle({
    borderColor: mockTheme.colors.primary, // focus borderColor
  });

  expect(getByTestId('DateTimeText')).toHaveTextContent('');
  expect(getByTestId('DateTimeText')).toHaveStyle({
    color: mockTheme.colors.grey4, // placeholderColor
  });

  expect(getByTestId('DateTimePickerModal')).toBeTruthy();

  /**
   * Select Date
   */
  dateTimePickerRef.current?.props?.onConfirm?.(selectedDate);

  await waitFor(() =>
    expect(getByTestId('DateTimeText')).toHaveTextContent(
      moment(selectedDate).format(i18next.t('common.dateFormat')),
    ),
  );
  expect(getByTestId('DateTimeText')).toHaveStyle({
    color: 'rgba(255, 255, 255, 1)', // textColor
  });

  await waitFor(() => expect(focusIfEmpty).toBeCalledTimes(1));
  focusIfEmpty.mockClear();

  /**
   * Select Time
   */

  rerender(<DateTimePicker ref={dateTimePickerRef} mode="time" />);

  dateTimePickerRef.current?.props?.onConfirm?.(selectedDate);

  await waitFor(() =>
    expect(getByTestId('DateTimeText')).toHaveTextContent(
      moment(selectedDate).format(i18next.t('common.timeFormat')),
    ),
  );

  /**
   * Select DateTime
   */

  rerender(<DateTimePicker ref={dateTimePickerRef} mode="datetime" />);

  dateTimePickerRef.current?.props?.onConfirm?.(selectedDate);

  await waitFor(() =>
    expect(getByTestId('DateTimeText')).toHaveTextContent(
      moment(selectedDate).format(
        `${i18next.t('common.dateFormat')} ${i18next.t('common.timeFormat')}`,
      ),
    ),
  );
});

test('should work correctly on iOS & Android', async () => {
  const dateTimePickerRef: React.RefObject<DateTimePickerType> = React.createRef();

  /**
   * iOS
   */
  Platform.OS = 'ios';

  const { getByTestId } = render(<DateTimePicker ref={dateTimePickerRef} title={title} />);
  fireEvent.press(getByTestId('DateTimePickerButton'));

  await waitFor(() => expect(dateTimePickerRef.current?.props?.display).toEqual('inline'));

  /**
   * Android
   */
  Platform.OS = 'android';

  const { getByTestId: getByTestIdAndroid } = render(
    <DateTimePicker ref={dateTimePickerRef} title={title} display="compact" />,
  );
  fireEvent.press(getByTestIdAndroid('DateTimePickerButton'));

  await waitFor(() => expect(dateTimePickerRef.current?.props?.display).toEqual('compact'));

  dateTimePickerRef.current?.props?.onConfirm?.(selectedDate);

  await waitFor(() =>
    expect(getByTestIdAndroid('DateTimeText')).toHaveTextContent(
      moment(selectedDate).format(i18next.t('common.dateFormat')),
    ),
  );
});

test('should work correctly with formik & nextField', async () => {
  /**
   * Setup Test
   */
  const dateTimePickerRef: React.RefObject<DateTimePickerType> = React.createRef();

  const focusIfEmpty = jest.fn();
  const onCancel = jest.fn();

  const error = 'Birthday is required';
  const formValidationSchema = Yup.object().shape({
    birthday: Yup.date().required(error),
  });

  const onSubmit = jest.fn();

  const RootComponent = (
    <Formik
      validationSchema={formValidationSchema}
      initialValues={{
        birthday: undefined,
      }}
      onSubmit={onSubmit}
    >
      {formikProps => (
        <>
          <DateTimePicker
            ref={dateTimePickerRef}
            formikProps={formikProps}
            name="birthday"
            title={title}
            onCancel={onCancel}
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
  act(() => dateTimePickerRef.current?.focusIfEmpty());
  expect(getByTestId('DateTimePickerButton')).toHaveStyle({
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
  fireEvent.press(getByTestId('DateTimePickerButton'));

  dateTimePickerRef.current?.props?.onCancel?.(selectedDate);

  expect(onCancel).toBeCalledTimes(1);

  /**
   * Successfully Select Item
   */
  fireEvent.press(getByTestId('DateTimePickerButton'));

  dateTimePickerRef.current?.props?.onConfirm?.(selectedDate);

  await waitFor(() =>
    expect(getByTestId('DateTimeText')).toHaveTextContent(
      moment(selectedDate).format(i18next.t('common.dateFormat')),
    ),
  );

  fireEvent.press(getByTestId('SubmitButton'));
  await findByTestId('SubmitButton');

  await waitFor(() => expect(focusIfEmpty).toBeCalledTimes(1));
  expect(queryByTestId('ErrorText')).toBeFalsy();
  expect(onSubmit).toBeCalledTimes(1);
  expect(onSubmit).toHaveBeenCalledWith(
    {
      birthday: selectedDate,
    },
    expect.anything(),
  );
});

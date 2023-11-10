import React from 'react';
import { render } from '@utils/TestHelper';
import KeyboardAvoidingScrollView from '@components/common/View/KeyboardAvoidingScrollView/index';
import { Platform } from 'react-native';

test('should render correctly', () => {
  const { toJSON, getByTestId } = render(<KeyboardAvoidingScrollView />);
  expect(toJSON()).toMatchSnapshot();
  expect(getByTestId('KeyboardAvoidingScrollView')).toBeTruthy();
});

test('should have working props', () => {
  const { getByTestId } = render(
    <KeyboardAvoidingScrollView className="flex-1 flex-row self-center justify-between items-center rounded border mx-1 my-1 px-1 pt-1 border-sky-700 bg-sky-500" />,
  );

  expect(getByTestId('KeyboardAvoidingScrollView')).toHaveStyle({
    flexGrow: 1,
    flexShrink: 1,
    flexDirection: 'row',
    alignSelf: 'center',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderLeftColor: 'rgba(3, 105, 161, 1)',
    borderRightColor: 'rgba(3, 105, 161, 1)',
    borderTopColor: 'rgba(3, 105, 161, 1)',
    borderBottomColor: 'rgba(3, 105, 161, 1)',
    backgroundColor: 'rgba(14, 165, 233, 1)',
    marginLeft: 4,
    marginRight: 4,
    marginTop: 4,
    marginBottom: 4,
    paddingLeft: 4,
    paddingRight: 4,
    paddingTop: 4,
    // paddingBottom: 0 // depend on KeyboardAvoidingView
  });
});

test('should work correctly on iOS & Android', () => {
  Platform.OS = 'ios';
  const { UNSAFE_getByProps, rerender } = render(<KeyboardAvoidingScrollView />);
  expect(UNSAFE_getByProps({ behavior: 'padding' })).toBeTruthy();

  Platform.OS = 'android';
  rerender(<KeyboardAvoidingScrollView />);
  expect(UNSAFE_getByProps({ behavior: 'height' })).toBeTruthy();
});

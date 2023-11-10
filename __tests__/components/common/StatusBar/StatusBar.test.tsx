import React from 'react';
import { render } from '@utils/TestHelper';
import StatusBar from '@components/common/StatusBar/index';
import navigation from '@react-navigation/native';

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
}));

jest.mock('react-native/Libraries/Components/StatusBar/StatusBar', () => 'StatusBar');

test('should be visible when focusing', () => {
  navigation.useIsFocused = jest.fn().mockReturnValue(true);
  const { toJSON } = render(<StatusBar />);

  expect(toJSON()).toBeTruthy();
  expect(toJSON()).toMatchSnapshot();
});

test('should be invisible when unfocusing', () => {
  navigation.useIsFocused = jest.fn().mockReturnValue(false);

  const { toJSON } = render(<StatusBar />);
  expect(toJSON()).toBeFalsy();
});

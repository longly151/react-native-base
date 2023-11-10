import { render, waitFor, waitForElementToBeRemoved } from '@testing-library/react-native';
import AppView from '@utils/AppView';
import Navigation from '@utils/Navigation';
import React from 'react';
import { Platform } from 'react-native';
import App from '@app/index';

global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

beforeEach(() => {
  Platform.OS = 'ios';
});

test('should render App correctly', async () => {
  const mockOnDimensionChange = jest.fn();
  AppView.onDimensionChange = mockOnDimensionChange;
  // const appDimensionsSpy = jest.spyOn(Dimensions, 'addEventListener');

  const { getByTestId, queryByTestId, findByTestId } = render(<App />);

  expect(getByTestId('LoadingImageBackground')).toBeTruthy();
  await waitForElementToBeRemoved(() => queryByTestId('LoadingImageBackground'));
  await findByTestId('Login');

  // Open Modal
  Navigation.navigate('DefaultModal');
  expect(Navigation.getCurrentRoute()?.name).toBe('DefaultModal');
  await findByTestId('ModalView');

  // Go Back
  Navigation.goBack();
  await waitFor(() => expect(Navigation.getCurrentRoute()?.name).not.toBe('DefaultModal'));

  // const dimensionsData = {
  //   window: { width: 200, height: 200, scale: 1, fontScale: 1 },
  //   screen: { width: 200, height: 200, scale: 1, fontScale: 1 },
  // };

  // appDimensionsSpy.mock.calls[0][1](dimensionsData);
  // await waitFor(() => expect(mockOnDimensionChange).toBeCalled());

  Platform.OS = 'android';
  const { getByTestId: getByTestIdAndroid, queryByTestId: queryByTestIdAndroid } = render(<App />);
  expect(getByTestIdAndroid('LoadingImageBackground')).toBeTruthy();
  await waitForElementToBeRemoved(() => queryByTestIdAndroid('LoadingImageBackground'));
});

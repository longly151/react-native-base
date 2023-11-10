import React from 'react';
import { render, waitFor } from '@utils/TestHelper';
import MainStack from '@routes';
import Navigation from '@utils/Navigation';

global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
};

test('should run correctly', async () => {
  render(<MainStack />, {
    withAuth: true,
  });
  // Should show HomeTab as the first screen
  await waitFor(() => expect(Navigation.getCurrentRoute()?.name).toBe('HomeTab'));

  expect(Navigation.getRootState()).toBeTruthy();
  expect(Navigation.canGoBack()).toBeFalsy();

  // Navigate to Settings Tab
  Navigation.navigate('SettingsTab');

  await waitFor(() => expect(Navigation.getCurrentRoute()?.name).toBe('SettingsTab'));
  expect(Navigation.canGoBack()).toBeTruthy();

  // Go back to HomeTab
  Navigation.goBack();

  await waitFor(() => expect(Navigation.getCurrentRoute()?.name).toBe('HomeTab'));

  // Push List & Detail Screen
  Navigation.push('List');
  await waitFor(() => expect(Navigation.getCurrentRoute()?.name).toBe('List'));
  Navigation.push('Detail', { item: { id: 1, title: 'Lorem ipsum' } });
  await waitFor(() => expect(Navigation.getCurrentRoute()?.name).toBe('Detail'));

  // Pop 1 screen
  Navigation.pop();
  await waitFor(() => expect(Navigation.getCurrentRoute()?.name).toBe('List'));

  // Go to Detail Screen again
  Navigation.push('Detail', { item: { id: 1, title: 'Lorem ipsum' } });
  await waitFor(() => expect(Navigation.getCurrentRoute()?.name).toBe('Detail'));

  // Pop 2 screens
  Navigation.pop(2);
  await waitFor(() => expect(Navigation.getCurrentRoute()?.name).toBe('HomeTab'));

  // Push List & Detail Screen again
  Navigation.push('List');
  await waitFor(() => expect(Navigation.getCurrentRoute()?.name).toBe('List'));
  Navigation.push('Detail', { item: { id: 1, title: 'Lorem ipsum' } });
  await waitFor(() => expect(Navigation.getCurrentRoute()?.name).toBe('Detail'));

  // Pop to top
  Navigation.popToTop();
  await waitFor(() => expect(Navigation.getCurrentRoute()?.name).toBe('HomeTab'));
});

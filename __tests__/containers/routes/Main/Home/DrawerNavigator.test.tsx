import React from 'react';
import { fireEvent, render, renderHook } from '@utils/TestHelper';
import DrawerNavigator from '@routes/Main/Home/DrawerNavigator';
import { useAppSelector } from '@utils/Redux';

test('should run correctly', () => {
  // @ts-ignore
  const { getByTestId } = render(<DrawerNavigator />);
  expect(getByTestId('ThemeSwitch')).toHaveProp('value', false);

  fireEvent(getByTestId('ThemeSwitch'), 'onValueChange');

  const { result } = renderHook(() => useAppSelector(state => state.app.colorScheme));
  expect(result.current).toBe('dark');
});

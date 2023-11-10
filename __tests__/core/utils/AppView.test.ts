import AppView from '@utils/AppView';
import { Dimensions } from 'react-native';

Dimensions.get = jest.fn().mockReturnValue({ width: 100, height: 200 }); // horizontal

test('should run correctly', () => {
  // Shadow
  expect(AppView.shadow(0)).toEqual({});
  expect(AppView.shadow()).toEqual(AppView.shadow(10));

  // onDimensionChange
  expect(AppView.isHorizontal).toBe(false);
  const horizontalDimensionsData = {
    window: { width: 200, height: 100, scale: 1, fontScale: 1 },
    screen: { width: 200, height: 100, scale: 1, fontScale: 1 },
  };
  AppView.onDimensionChange(horizontalDimensionsData);
  expect(AppView.isHorizontal).toBe(true);

  const verticalDimensionsData = {
    window: { width: 100, height: 200, scale: 1, fontScale: 1 },
    screen: { width: 100, height: 200, scale: 1, fontScale: 1 },
  };
  AppView.onDimensionChange(verticalDimensionsData);
  expect(AppView.isHorizontal).toBe(false);
});

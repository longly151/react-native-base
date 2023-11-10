import { renderHook } from '@utils/TestHelper';
import { useAppSelector } from '@utils/Redux';

jest.mock('react-native-localize', () => ({
  getLocales: () => [
    {
      countryCode: 'VN',
      languageTag: 'vi-VN',
      languageCode: 'vi',
      isRTL: false,
    },
  ],
}));

afterAll(() => {
  jest.resetModules();
});

jest.mock('react-native/Libraries/Utilities/Appearance', () => ({
  ...jest.requireActual('react-native/Libraries/Utilities/Appearance'),
  getColorScheme: jest.fn().mockReturnValue('dark'),
}));

test('should run correctly', () => {
  const { result } = renderHook(
    () => useAppSelector(state => [state.app.colorScheme, state.app.language, state.auth.data]),
    {
      preloadedState: { config: { language: 'vi', colorScheme: 'dark' } },
      disableNavigationRef: true,
    },
  );

  expect(result.current[0]).toBe('dark');
  expect(result.current[1]).toBe('vi');
});

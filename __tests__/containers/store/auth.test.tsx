import { renderHook, successLoginResponse } from '@utils/TestHelper';
import { useAppSelector } from '@utils/Redux';
import { setNewToken } from '@store/auth';

global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
};

test('should run correctly', () => {
  const { result } = renderHook(() => useAppSelector(state => state.auth.data), {
    withAuth: true,
  });
  expect(result.current?.token).toEqual(successLoginResponse.data.token);

  global.dispatch(setNewToken('abcd'));
  expect(result.current?.token).toEqual('abcd');
});

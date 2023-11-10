import { mockAxios, renderHook, waitFor } from '@utils/TestHelper';
import useRequest from '@components/hooks/useRequest';

global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
};

const data = { id: 1, title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit' };

afterEach(() => {
  mockAxios.reset();
});

test('should run correctly', async () => {
  mockAxios.onGet('/posts', { params: { id: 1 } }).reply(200, {
    data,
  });

  const { result, waitForNextUpdate } = renderHook(() =>
    useRequest('/posts', { queryParams: { id: 1 } }),
  );

  // Pending
  expect(result.current.loading).toBeTruthy();
  expect(result.current.data).toBeFalsy();
  expect(result.current.error).toBeFalsy();

  // Fulfilled
  await waitFor(() => expect(result.current.loading).toBeFalsy());
  await waitFor(() => expect(result.current.data).toEqual(data));
  await waitFor(() => expect(result.current.error).toBeFalsy());

  // Rejected
  mockAxios.onGet('/posts', { params: { id: 1 } }).reply(400, {
    statusCode: 400,
    message: 'Invalid search param. JSON expected',
    error: 'Bad Request',
  });

  result.current.fetch();
  await waitForNextUpdate();

  await waitFor(() => expect(result.current.loading).toBeFalsy());
  await waitFor(() =>
    expect(result.current.error).toEqual({
      code: 400,
      messages: ['Invalid search param. JSON expected'],
    }),
  );

  // Merge & Replace QueryParams
  result.current.fetch({
    queryParams: { id: 2 },
    overrideQueryParams: true,
  });
  await waitForNextUpdate();

  await waitFor(() => expect(result.current.queryParams).toEqual({ id: 2 }));

  result.current.fetch({
    queryParams: { title: 'Lorem ipsum' },
  });
  await waitForNextUpdate();

  await waitFor(() => expect(result.current.queryParams).toEqual({ id: 2, title: 'Lorem ipsum' }));
});

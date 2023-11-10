import { mockAxios, waitFor, act, renderHook } from '@utils/TestHelper';
import useMutation from '@components/hooks/useMutation';

global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
};

const body = { title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit' };

afterEach(() => {
  mockAxios.reset();
});

test('should run correctly', async () => {
  mockAxios.onPost('/posts', body).reply(200, {
    data: {},
  });
  mockAxios.onPut('/posts', body).reply(200, {
    data: {},
  });
  mockAxios.onPatch('/posts', body).reply(200, {
    data: {},
  });
  mockAxios.onDelete('/posts', body).reply(200, {
    data: {},
  });

  // URL === null
  const { result: resultNull } = renderHook(() => useMutation(''));
  await waitFor(async () => expect(await resultNull.current[0](body)).toBeFalsy());

  const { result, waitForNextUpdate } = renderHook(() => useMutation('/posts', 'POST'));

  // Pending
  expect(result.current[1].loading).toBeFalsy();
  expect(result.current[1].data).toBeFalsy();
  expect(result.current[1].error).toBeFalsy();

  // Fulfilled
  result.current[0](body);
  await waitForNextUpdate();

  await waitFor(() => expect(result.current[1].loading).toBeFalsy());
  await waitFor(() => expect(result.current[1].data).toBeTruthy());
  await waitFor(() => expect(result.current[1].error).toBeFalsy());

  // Rejected
  mockAxios.onPost('/posts', body).reply(400, {
    statusCode: 400,
    message: [
      {
        code: 'IS_NOT_EMPTY',
        description: 'content should not be empty',
        property: 'viTitle',
      },
      {
        code: 'IS_NOT_EMPTY',
        description: 'status should not be empty',
        property: 'status',
      },
    ],
    error: 'Bad Request',
  });

  await act(async () => {
    await result.current[0](body);
  });

  await waitFor(() => expect(result.current[1].loading).toBeFalsy());
  await waitFor(() =>
    expect(result.current[1].error).toEqual({
      code: 400,
      messages: ['content should not be empty', 'status should not be empty'],
    }),
  );

  // PUT
  const { result: resultPut } = renderHook(() => useMutation('/posts', 'PUT'));
  await act(async () => {
    await resultPut.current[0](body);
  });
  await waitFor(() => expect(resultPut.current[1].data).toBeTruthy());

  // PATCH
  const { result: resultPatch } = renderHook(() => useMutation('/posts', 'PATCH'));
  await act(async () => {
    await resultPatch.current[0](body);
  });
  await waitFor(() => expect(resultPatch.current[1].data).toBeTruthy());

  // DELETE
  const { result: resultDelete } = renderHook(() => useMutation('/posts', 'DELETE'));
  await act(async () => {
    await resultDelete.current[0](body);
  });
  await waitFor(() => expect(resultDelete.current[1].data).toBeTruthy());
});

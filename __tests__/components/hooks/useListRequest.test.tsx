import React from 'react';
import { act, fireEvent, mockAxios, render, renderHook, waitFor } from '@utils/TestHelper';
import useListRequest from '@components/hooks/useListRequest';
import { View } from 'react-native';

global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
};

const data = [
  { id: 1, title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit' },
  { id: 2, title: 'Duis placerat in nibh et lacinia' },
];
const metadata = { count: 2, total: 4, page: 1, pageCount: 2 };

const data2 = [
  { id: 3, title: 'Optio unde quaerat quia odit dolor sequi eveniet dolorum' },
  { id: 4, title: 'Nisi nobis assumenda non et accusantium necessitatibus' },
];
const metadata2 = { count: 2, total: 4, page: 2, pageCount: 2 };

afterEach(() => {
  mockAxios.reset();
});

test('should run correctly', async () => {
  mockAxios.onGet('/posts', { params: { page: 1, limit: 2 } }).reply(200, {
    data,
    ...metadata,
  });

  mockAxios.onGet('/posts', { params: { page: 2, limit: 2 } }).reply(200, {
    data: data2,
    ...metadata2,
  });

  const { result } = renderHook(() => useListRequest('/posts', { queryParams: { limit: 2 } }));

  // Pending
  expect(result.current.loading).toBeTruthy();
  expect(result.current.data).toEqual([]);
  expect(result.current.error).toBeFalsy();

  // Fulfilled
  await waitFor(() => expect(result.current.loading).toBeFalsy());
  await waitFor(() => expect(result.current.data).toEqual(data));
  await waitFor(() => expect(result.current.metadata).toEqual(metadata));
  await waitFor(() => expect(result.current.error).toBeFalsy());

  // Rejected
  mockAxios.onGet('/posts').reply(400, {
    statusCode: 400,
    // message: 'Invalid search param. JSON expected',
    message: [
      {
        code: 'UNAUTHORIZED',
        description: 'Missing authentication',
      },
    ],
    error: 'Bad Request',
  });
  const { result: failedResult } = renderHook(() => useListRequest('/posts'));

  await waitFor(() => expect(failedResult.current.loading).toBeFalsy());
  await waitFor(() =>
    expect(failedResult.current.error).toEqual({
      code: 400,
      messages: ['Missing authentication'],
    }),
  );

  // UpdateData after fetching
  const updateData = (oldData: any) => {
    const newData = [...oldData];
    if (newData.length > 0) {
      newData[0].title = 'Abcd';
    }
    return newData;
  };
  const { result: updateDataResult } = renderHook(() =>
    useListRequest('/posts', { queryParams: { page: 1, limit: 2 }, updateData }),
  );

  await waitFor(() => expect(updateDataResult.current.loading).toBeFalsy());

  await waitFor(() =>
    expect(updateDataResult.current.data).toContainEqual({ id: 1, title: 'Abcd' }),
  );
});

test('should render FlatList correctly', async () => {
  mockAxios.onGet('/posts', { params: { page: 1, limit: 2 } }).reply(200, {
    data,
    ...metadata,
  });

  mockAxios.onGet('/posts', { params: { page: 2, limit: 2 } }).reply(200, {
    data: data2,
    ...metadata2,
  });

  const { result, waitForNextUpdate } = renderHook(() =>
    useListRequest('/posts', { queryParams: { limit: 2 } }),
  );

  const { getByTestId: getByTestIdLoading } = render(
    result.current.renderFlatList({
      testID: 'FlatList',
      renderItem: () => <View testID="ItemView" style={{ height: 100, width: 100 }} />,
    }) as React.ReactElement,
  );
  expect(getByTestIdLoading('Loading')).toBeTruthy();

  await waitFor(() => expect(result.current.loading).toBeFalsy());
  await waitFor(() => expect(result.current.data).toEqual(data));

  const onEndReached = jest.fn();
  const onRefresh = jest.fn();

  // Return nothing when renderFlatList has no params
  expect(result.current.renderFlatList()).toBeFalsy();

  // Failed FlatList rendering
  mockAxios.onGet('/posts').reply(400, {
    statusCode: 400,
    // message: 'Invalid search param. JSON expected',
    message: [
      {
        code: 'UNAUTHORIZED',
        description: 'Missing authentication',
      },
    ],
    error: 'Bad Request',
  });
  const { result: failedResult } = renderHook(() => useListRequest('/posts'));

  await waitFor(() =>
    expect(failedResult.current.error).toEqual({
      code: 400,
      messages: ['Missing authentication'],
    }),
  );

  const { getByTestId: getByTestIdFailed } = render(
    failedResult.current.renderFlatList({
      renderItem: () => <View testID="ItemView" style={{ height: 100, width: 100 }} />,
    }) as React.ReactElement,
  );
  expect(getByTestIdFailed('ErrorText')).toHaveTextContent('Missing authentication');

  // Successful FlatList rendering
  const { getByTestId } = render(
    result.current.renderFlatList({
      testID: 'FlatList',
      onEndReached,
      onRefresh,
      renderItem: () => <View testID="ItemView" style={{ height: 100, width: 100 }} />,
    }) as React.ReactElement,
  );

  await waitFor(() => expect(result.current.data).toHaveLength(2));

  // onEndReached
  const endReachedEventData = {
    nativeEvent: {
      contentOffset: {
        y: 300,
      },
      contentSize: {
        // Dimensions of the scrollable content
        height: 200,
        width: 100,
      },
      layoutMeasurement: {
        // Dimensions of the device
        height: 100,
        width: 100,
      },
    },
  };

  fireEvent.scroll(getByTestId('FlatList'), endReachedEventData);

  await waitFor(() => expect(onEndReached).toHaveBeenCalledTimes(1));
  await waitFor(() => expect(result.current.metadata.page).toBe(2));
  await waitFor(() => expect(result.current.data).toHaveLength(4));

  // Refresh Data
  const { refreshControl } = getByTestId('FlatList').props;
  await act(async () => {
    refreshControl.props.onRefresh();
  });

  result.current.fetch({
    queryParams: { title: 'Lorem ipsum' },
  });
  await waitForNextUpdate();

  await waitFor(() => expect(onRefresh).toHaveBeenCalledTimes(1));
  await waitFor(() => expect(result.current.metadata.page).toBe(1));
  await waitFor(() => expect(result.current.data).toHaveLength(2));

  result.current.refresh();
  await waitForNextUpdate();

  /**
   * Merge & Replace QueryParams
   */

  result.current.fetch({
    queryParams: { s: { enTitle: { $contL: 'Audi' } } },
    overrideQueryParams: true,
  });
  await waitForNextUpdate();

  await waitFor(() =>
    expect(result.current.queryParams).toEqual({ s: { enTitle: { $contL: 'Audi' } } }),
  );

  result.current.fetch({
    queryParams: { limit: 3 },
  });
  await waitForNextUpdate();

  await waitFor(() => expect(result.current.loading).toBeFalsy());
  await waitFor(() =>
    expect(result.current.queryParams).toEqual({ s: { enTitle: { $contL: 'Audi' } }, limit: 3 }),
  );
});

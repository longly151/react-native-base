import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '@react-navigation/native';
import useRequest, { IResultUseRequest, RequestRedux } from './useRequest';
import { FlatList, FlatListProps, RefreshControl } from 'react-native';
import Loading from '@components/common/Loading';
import ErrorText from '@components/custom/Text/ErrorText';
import _ from 'lodash';
import CONSTANT from '@configs/constant';

interface RenderFlatListProps extends Omit<FlatListProps<any>, 'data'> {
  data?: any;
}

interface IResultUseListRequest<TItem> extends Omit<IResultUseRequest<TItem>, 'data'> {
  data: TItem[];
  readonly flatListRef: React.RefObject<FlatList<any>>;
  readonly refresh: (
    options?:
      | {
          showRefreshing?: boolean | undefined;
          queryParams?: { [key: string]: any };
          overrideQueryParams?: boolean | undefined;
        }
      | undefined,
  ) => Promise<void>;
  readonly renderFlatList: (flatListProps?: RenderFlatListProps | undefined) => JSX.Element | null;
}

type TUseListRequest = <TItem = { [key: string]: any }>(
  url: string,
  params?:
    | {
        queryParams?: { [key: string]: any };
        modifyData?: (previousQueryData: any) => any;
        defaultData?: Array<{ [key: string]: any }>;
        redux?: RequestRedux;
      }
    | undefined,
) => IResultUseListRequest<TItem>;

const useListRequest: TUseListRequest = (url, params) => {
  const flatListRef = useRef<FlatList>(null);
  const theme = useTheme();

  const [refreshStatus, setRefreshStatus] = useState(
    'inactive' as 'active' | 'silentActive' | 'inactive',
  );

  const [data, setData] = useState<Array<any>>(params?.defaultData || []);

  const limit = useMemo(
    () => params?.queryParams?.limit || CONSTANT.LIST_REQUEST.PAGE_SIZE,
    [params?.queryParams?.limit],
  );

  const {
    loading,
    data: rawData,
    metadata,
    queryParams,
    error,
    setLoading,
    setMetadata,
    setError,
    fetch,
  } = useRequest(url, {
    ...params,
    queryParams: {
      ...(params?.queryParams || {}),
      page: 1,
      limit,
    },
    defaultData: params?.defaultData || [],
  });

  const fetchMore = async () => {
    if (url) {
      if (metadata.page < metadata.pageCount) {
        fetch({ queryParams: { page: metadata.page + 1 } });
      }
    }
  };

  useEffect(() => {
    const handledData = params?.modifyData ? params?.modifyData(rawData) : rawData;
    if (!metadata.page || metadata.page === 1) {
      setData(handledData);
    } else {
      const merged = data.slice(0);
      const offset = metadata.page ? (metadata.page - 1) * limit : 0;

      for (let i = 0; i < handledData.length; ++i) {
        merged[offset + i] = handledData[i];
      }
      setData(merged);
    }
    setRefreshStatus('inactive');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawData]);

  const refresh = async (options?: {
    showRefreshing?: boolean;
    queryParams?: any;
    overrideQueryParams?: boolean;
  }) => {
    if (options?.showRefreshing) {
      setRefreshStatus('active');
      // setTimeout(() => {
      //   flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
      // }, 250);
    } else {
      setRefreshStatus('silentActive');
    }
    const newQueryParams = _.merge(options?.queryParams, { page: 1 });
    await fetch({
      queryParams: newQueryParams,
      overrideQueryParams: options?.overrideQueryParams,
    });
    setRefreshStatus('inactive');
  };

  const onEndReached = async (
    onEndReachedInfo: {
      distanceFromEnd: number;
    },
    flatListProps?: RenderFlatListProps,
  ) => {
    if (metadata.page < metadata.pageCount && !loading && !error) {
      await fetchMore();
    }
    if (flatListProps?.onEndReached) flatListProps?.onEndReached(onEndReachedInfo);
  };

  const renderEmpty = (EmptyComponent: RenderFlatListProps['ListEmptyComponent']) => {
    if (!error && refreshStatus !== 'active' && EmptyComponent) {
      return EmptyComponent;
    }
    return null;
  };

  const renderFooter = () => {
    if (loading && refreshStatus !== 'active' && refreshStatus !== 'silentActive') {
      return <Loading testID="Loading" className="mb-1 mt-2" />;
    }
    return null;
  };

  const renderHeader = (HeaderComponent: RenderFlatListProps['ListHeaderComponent']) => {
    if (error) {
      if (error.messages?.some(e => e.includes('No result'))) {
        return null;
      }
      return (
        <>
          <ErrorText error={error} />
          {HeaderComponent}
        </>
      );
    }
    return HeaderComponent;
  };

  const renderFlatList = (flatListProps?: RenderFlatListProps) => {
    if (flatListProps) {
      return (
        <FlatList
          ref={flatListRef}
          data={data}
          keyExtractor={(item, index) => (item.id || index).toString()}
          ListFooterComponent={renderFooter}
          refreshing={refreshStatus === 'active'}
          refreshControl={
            <RefreshControl
              testID="RefreshControl"
              refreshing={refreshStatus === 'active'}
              onRefresh={() => {
                refresh({ showRefreshing: true });
                flatListProps?.onRefresh?.();
              }}
              tintColor={theme.colors.primary}
            />
          }
          {...flatListProps}
          onRefresh={undefined}
          ListEmptyComponent={renderEmpty(flatListProps.ListEmptyComponent)}
          ListHeaderComponent={renderHeader(flatListProps.ListHeaderComponent)}
          onEndReached={info => onEndReached(info, flatListProps)}
        />
      );
    }
    return null;
  };

  return {
    flatListRef,
    loading,
    data,
    metadata,
    error,
    setLoading,
    setData,
    setMetadata,
    setError,
    queryParams,
    fetch,
    refresh,
    renderFlatList,
  } as const;
};

export default useListRequest;

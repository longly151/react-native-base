import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';
import { ActionCreatorWithPayload } from '@reduxjs/toolkit';
import Api, { TError } from '@utils/Api';
import Helper from '@utils/Helper';
import { useAppDispatch } from '@utils/Redux';
import _ from 'lodash';
import NetInfo from '@react-native-community/netinfo';

const REQUEST_CONSTANT = {
  pageField: 'currentPage',
  pageSizeField: 'pageSize',
};

const initialMetadata = {
  count: 10,
  total: 0,
  page: 0,
  pageCount: 1,
};

export interface IResultUseRequest<TData = {}> {
  readonly loading: boolean;
  readonly data: TData;
  readonly metadata: {
    count: number;
    total: number;
    page: number;
    pageCount: number;
  };
  readonly error: TError | null;
  readonly setLoading: Dispatch<SetStateAction<boolean>>;
  readonly setData: Dispatch<any>;
  readonly setMetadata: Dispatch<
    SetStateAction<{
      count: number;
      total: number;
      page: number;
      pageCount: number;
    }>
  >;
  readonly setError: Dispatch<SetStateAction<TError | null>>;
  readonly queryParams: any;
  readonly fetch: (
    options?:
      | {
          queryParams?: any;
          overrideQueryParams?: boolean | undefined;
          silent?: boolean;
        }
      | undefined,
  ) => Promise<boolean>;
}

export type RequestRedux = {
  data?: any;
  setData?: ActionCreatorWithPayload<any, string>;
  setDataParams?: { [key: string]: any };
};

type TUseRequest = <TData = { [key: string]: any }>(
  url: string,
  params?: {
    queryParams?: { [key: string]: any };
    useLazyLoad?: boolean;
    defaultData?: any;
    redux?: RequestRedux;
  },
) => IResultUseRequest<TData>;

const useRequest: TUseRequest = (url, params) => {
  const [queryParams, setQueryParams] = useState(params?.queryParams);

  const [loading, setLoading] = useState(false);
  const [dataState, setDataState] = useState<any>(params?.defaultData || {});

  const dispatch = useAppDispatch();

  const data = params?.redux?.data || dataState;
  const setData = useCallback(
    (dataParams: any) => {
      if (params?.redux?.setData) {
        if (params?.redux?.setDataParams) {
          return dispatch(
            params?.redux?.setData({ data: dataParams, ...params?.redux?.setDataParams }),
          );
        }
        return dispatch(params?.redux?.setData({ data: dataParams }));
      } else {
        return setDataState(dataParams);
      }
    },
    [params, dispatch],
  );

  const [metadata, setMetadata] = useState<{
    count: number;
    total: number;
    page: number;
    pageCount: number;
  }>(initialMetadata);

  const [error, setError] = useState<TError | null>(null);

  let lastFetchTime = 0;
  const fetch = async (options?: {
    queryParams?: any;
    overrideQueryParams?: boolean;
    silent?: boolean;
  }) => {
    if (Date.now() - lastFetchTime < 200) return false; // Avoid multiple fetch in short time
    lastFetchTime = Date.now();

    let newQueryParams;
    if (options?.queryParams && options?.overrideQueryParams) {
      newQueryParams = options.queryParams;
    } else {
      newQueryParams = options?.queryParams
        ? _.merge(queryParams, options?.queryParams)
        : queryParams;
    }

    if (options?.queryParams) {
      setQueryParams(newQueryParams);
    }

    if (!global.isConnected) {
      const { isConnected: isReconnected } = await NetInfo.fetch();
      if (!isReconnected) {
        return false;
      }
    }

    if (url) {
      if (!options?.silent) setLoading(true);
      setError(null);
      try {
        const requestQueryParams = { ...queryParams };
        Helper.changeObjectKey(requestQueryParams, 'page', REQUEST_CONSTANT.pageField);
        Helper.changeObjectKey(requestQueryParams, 'limit', REQUEST_CONSTANT.pageSizeField);

        const response = await Api.get(url, requestQueryParams);
        const { data: serverData } = response;
        if (response.page) {
          setMetadata({
            count: response.count,
            total: response.total,
            page: response.page,
            pageCount: response.pageCount,
          });
        } else if (newQueryParams && _.has(newQueryParams, 'page') && _.has(response, 'total')) {
          const { total } = response;

          const page = newQueryParams.page || 1;
          const limit = newQueryParams.limit || 10;

          const pageCount = Math.ceil(response.total / limit);
          const count = _.isArray(serverData) ? serverData.length : 0;

          setMetadata({
            count,
            total,
            page,
            pageCount,
          });
        }
        // setData must be at the bottom (for "data useEffect(...,[data])" at parent components)
        setLoading(false);
        const result = typeof serverData !== 'undefined' ? serverData : response;
        setData(result);

        if (!result) return true;
        return result;
      } catch (e: any) {
        setLoading(false);
        setError(e);
        return false;
      }
    }
    return false;
  };

  useEffect(() => {
    if (!params?.useLazyLoad) {
      fetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
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
  } as const;
};

export default useRequest;

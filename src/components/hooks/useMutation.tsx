import Api, { TError } from '@utils/Api';
import { useAppDispatch, useAppSelector } from '@utils/Redux';
import { Dispatch, SetStateAction, useState } from 'react';
import { addBackgroundFetch } from '@store/app';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import AppHelper from '@utils/AppHelper';
import Navigation from '@utils/Navigation';

export type TResultUseMutation<TResult, TBody> = readonly [
  (body: TBody) => Promise<TResult>,
  {
    readonly loading: boolean;
    readonly data: TResult;
    readonly error: TError | null;
    readonly setLoading: Dispatch<SetStateAction<boolean>>;
    readonly setData: Dispatch<any>;
    readonly setError: Dispatch<SetStateAction<TError | null>>;
  },
];

type TUseMutation = <TResult = any, TBody = any>(
  url: string,
  method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  params?: {
    backgroundFetch?: boolean;
    backgroundFetchId?: string;
  },
) => TResultUseMutation<TResult, TBody>;

const useMutation: TUseMutation = (url, method = 'POST', params) => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>();
  const [error, setError] = useState<TError | null>(null);

  const isConnected = useAppSelector(state => state.app.isConnected);
  const backgroundFetchData = useAppSelector(state => state.app.backgroundFetchData);

  const dispatch = useAppDispatch();

  const addToBackground = (body: any) => {
    Alert.alert(t('common.connectionLost'), t('common.goToBackgroundMode'), [
      {
        text: t('common.gotoUploadHistory'),
        style: 'cancel',
        onPress: () => Navigation.navigate('UploadHistory'),
      },
      { text: t('common.ok') },
    ]);
    if (params?.backgroundFetch) {
      const newBackgroundFetch: App.BackgroundFetch = {
        url,
        data: body,
        method,
        createdAt: new Date().toISOString(),
      };
      dispatch(addBackgroundFetch(newBackgroundFetch));
    }
  };

  const completeBackground = (body: any) => {
    const newBackgroundFetch: App.BackgroundFetch = {
      url,
      data: body,
      method,
      completedAt: new Date().toISOString(),
      failedAt: undefined,
      errorMessage: undefined,
    };

    const matchIndex = AppHelper.getBackgroundFetchIndex(backgroundFetchData, newBackgroundFetch);

    if (
      params?.backgroundFetch &&
      matchIndex !== -1 &&
      !backgroundFetchData[matchIndex]?.completedAt
    ) {
      dispatch(addBackgroundFetch(newBackgroundFetch));
    }
  };

  const trigger = async (body: any) => {
    if (!isConnected) {
      addToBackground(body);
      return false;
    }

    if (url) {
      setLoading(true);
      setError(null);
      try {
        let response;
        switch (method) {
          case 'PUT':
            response = await Api.put(url, body);
            break;
          case 'PATCH':
            response = await Api.patch(url, body);
            break;
          case 'DELETE':
            response = await Api.del(url, body);
            break;
          default:
            response = await Api.post(url, body);
        }
        const { data: serverData } = response;
        setLoading(false);

        const result = typeof serverData !== 'undefined' ? serverData : response;
        setData(result);

        completeBackground(body);

        if (!result) return true;
        return result;
      } catch (e: any) {
        if (e.code === 408 || e.code === 503) {
          addToBackground(body);
        }

        setLoading(false);
        setError(e);
        return false;
      }
    }
    return false;
  };

  return [trigger, { loading, data, error, setLoading, setData, setError }] as const;
};

export default useMutation;

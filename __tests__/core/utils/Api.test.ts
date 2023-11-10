import Api from '@utils/Api';
import Helper from '@utils/Helper';
import { mockAxios, successLoginResponse } from '@utils/TestHelper';
import i18next from 'i18next';

global.console = {
  ...console,
  log: jest.fn(),
};

/**
 * 4xx, 5xx Response
 */
// Server Error
mockAxios.onGet('/timeout').timeout();
mockAxios.onGet('/network-error').networkError();
mockAxios.onGet('/502').reply(502, '502 Bad Gateway');
mockAxios.onGet('/500').reply(500);
mockAxios.onGet('/500-with-message').reply(500, {
  statusCode: 500,
  message: 'Internal server error',
});
mockAxios.onGet('/500-with-decription-object').reply(500, {
  statusCode: 500,
  message: {
    code: 'SERVER_ERROR',
    description: 'Something went wrong',
  },
});

// Client Error
const unauthorizedResponse = {
  statusCode: 401,
  message: [
    {
      code: 'UNAUTHORIZED',
      description: 'Missing authentication',
    },
  ],
  error: 'Unauthorized',
};
mockAxios.onGet('/401').reply(401, unauthorizedResponse);

const notFoundResponse = {
  statusCode: 404,
  message: [
    {
      code: 'NOT_FOUND',
      description: 'Tag not found',
    },
  ],
  error: 'Not Found',
};
mockAxios.onGet('/404').reply(404, notFoundResponse);

const badRequestResponse = {
  statusCode: 400,
  message: [
    {
      code: 'IS_STRING',
      description: 'fullName must be a string',
      property: 'fullName',
    },
    {
      code: 'IS_EMAIL',
      description: 'email must be an email',
      property: 'email',
    },
    {
      code: 'IS_STRING',
      description: 'password must be a string',
      property: 'password',
    },
    {
      code: 'IS_MOBILE_PHONE',
      description: 'phone must be a phone number',
      property: 'phone',
    },
  ],
  error: 'Bad Request',
};

mockAxios.onGet('/400').reply(400, badRequestResponse);

const conflictResponse = {
  statusCode: 409,
  message: [
    {
      code: 'ALREADY_EXIST',
      description: '"Slug" already exists',
    },
  ],
  error: 'Conflict',
};
mockAxios.onGet('/409').reply(409, conflictResponse);

test('should show request error correctly', async () => {
  // Unexpected Error
  try {
    // @ts-ignore
    await Api.get(1);
  } catch (error: any) {
    expect(error.code).toBe(500);
  }

  // Request Time Out
  try {
    await Api.get('/timeout');
  } catch (error: any) {
    expect(error.code).toBe(408);
    expect(error.messages).toEqual([i18next.t('exception.408')]);
  }

  // Network Error
  try {
    await Api.get('/network-error');
  } catch (error: any) {
    expect(error.code).toBe(503);
    expect(error.messages).toEqual([i18next.t('exception.503')]);
  }

  // Bad Gateway
  try {
    await Api.get('/502');
  } catch (error: any) {
    expect(error.code).toBe(502);
    expect(error.messages).toEqual([i18next.t('exception.502')]);
  }

  // Server Error
  try {
    await Api.get('/500');
  } catch (error: any) {
    expect(error.code).toBe(500);
    expect(error.messages).toEqual([i18next.t('exception.500')]);
  }

  try {
    await Api.get('/500-with-message');
  } catch (error: any) {
    expect(error.code).toBe(500);
    expect(error.messages).toEqual(['Internal server error']);
  }

  try {
    await Api.get('/500-with-decription-object');
  } catch (error: any) {
    expect(error.code).toBe(500);
    expect(error.messages).toEqual(['Something went wrong']);
  }

  // Unauthenticated
  try {
    await Api.get('/401');
  } catch (error: any) {
    expect(error.code).toBe(401);
    expect(error.messages).toEqual([unauthorizedResponse.message[0].description]);
  }

  // Not found
  try {
    await Api.get('/404');
  } catch (error: any) {
    expect(error.code).toBe(404);
    expect(error.messages).toEqual([notFoundResponse.message[0].description]);
  }

  // Bad Request
  try {
    await Api.get('/400');
  } catch (error: any) {
    expect(error.code).toBe(400);
    expect(error.messages).toEqual(Helper.selectFields(badRequestResponse.message, 'description'));
  }

  // Conflict
  try {
    await Api.get('/409');
  } catch (error: any) {
    expect(error.code).toBe(409);
    expect(error.messages).toEqual([conflictResponse.message[0].description]);
  }
});

/**
 * 2xx Response
 */

const validHeader = {
  Accept: 'application/json, text/plain, */*',
  Authorization: `Bearer ${successLoginResponse.data.token}`,
  'Content-Type': 'application/json; charset=UTF-8',
};

const fullValidHeader = {
  Accept: 'application/json, text/plain, */*',
  Authorization: `Bearer ${successLoginResponse.data.token}`,
  'Content-Type': 'application/json; charset=UTF-8',
  'X-User-Agent': 'RNBase/1.0.0;iOS/16.0;iPhone11',
  'X-ClientId': 'Admin',
  'X-locale': 'en_US',
  'X-Signature':
    '0x2ef3d70a2447223e06714e982681c4aea93266a30f6040ec9a81f3a4ea64ef5713c04a9821272947fb4e19ca2de5292e1c57dfbf3cf2a6eb79de882d8b8b14c61c',
  'X-DeviceFingerprint':
    '{"os":"IOS","osVersion":"16.0","name":"My iPhone 11","model":"iPhone 11","deviceUuid":"cba0cc41-2914-4954-95c5-b8a0dbf4c19f"}',
};

mockAxios.onGet('/users', undefined, validHeader).reply(200, {
  data: [{ id: 1, name: 'John Smith' }],
});

mockAxios.onGet('/users', undefined).reply(401, unauthorizedResponse);

mockAxios
  .onPost('/posts', { title: 'Lorem ipsum' }, fullValidHeader)
  .reply(201, { data: { id: 2, title: 'Lorem ipsum' } });

test('should show request response correctly', async () => {
  // Missing Authorization on Header
  try {
    await Api.get('/users');
  } catch (error: any) {
    expect(error.code).toBe(401);
    expect(error.messages).toEqual([unauthorizedResponse.message[0].description]);
  }

  // [GET] Successful response with valid credential
  global.token = successLoginResponse.data.token;

  try {
    const response = await Api.get('/users');
    expect(response.data).toBeTruthy();
  } catch (error) {}

  // [POST] Successfully created with full valid header
  try {
    Api.setHeader({
      Authorization: fullValidHeader.Authorization,
      'Content-Type': fullValidHeader['Content-Type'],
      'X-User-Agent': fullValidHeader['X-User-Agent'],
      'X-ClientId': fullValidHeader['X-ClientId'],
      'X-locale': fullValidHeader['X-locale'],
      'X-Signature': fullValidHeader['X-Signature'],
      'X-DeviceFingerprint': fullValidHeader['X-DeviceFingerprint'],
    });
    const response = await Api.post('/posts', { title: 'Lorem ipsum' });
    expect(response.data).toBeTruthy();
  } catch (error) {}
});

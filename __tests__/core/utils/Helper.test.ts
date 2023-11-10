import Helper from '@utils/Helper';

test('should run correctly', async () => {
  // getKeys
  enum PostStatus {
    ACTIVE_STATUS = 'ACTIVE',
    DRAFT_STATUS = 'DRAFT',
  }
  const enumObject = { premiumOption1: 'premium1M', premiumOption2: 'premium1Y' };

  expect(Helper.getKeys(PostStatus)).toEqual(['ACTIVE_STATUS', 'DRAFT_STATUS']);
  expect(Helper.getKeys(enumObject)).toEqual(['premiumOption1', 'premiumOption2']);

  // getValues
  expect(Helper.getValues(enumObject)).toEqual(['premium1M', 'premium1Y']);

  // getSubvalues
  const collection = [{ a: 1 }, { b: { a: 2 } }, { c: { a: 3 } }];
  const aValues: any[] = [];
  Helper.getSubvalues(collection, 'a');
  Helper.getSubvalues(collection, 'a', aValues);
  expect(aValues).toEqual([1, 2, 3]);

  // selectFields
  const selectFieldsData = [
    { a: 1, b: 10 },
    { a: { a: 2 }, b: 11 },
    { a: { b: 20 }, b: 12 },
  ];
  expect(Helper.selectFields(selectFieldsData, 'a')).toEqual([1, { a: 2 }, { b: 20 }]);
  expect(Helper.selectFields(selectFieldsData, ['a'])).toEqual([
    { a: 1 },
    { a: { a: 2 } },
    { a: { b: 20 } },
  ]);

  // selectDeepField
  const selectDeepFieldData = [{ a: 1 }, { b: { a: 2 } }, { c: { a: 3 } }];
  expect(Helper.selectDeepField(selectDeepFieldData, 'a')).toEqual([1, 2, 3]);

  // selectObjectField
  const selectObjectFieldData = { a: { b: 1 } };
  expect(Helper.selectObjectField(selectObjectFieldData, 'a.b')).toEqual(1);

  // selectCollectionField
  const selectCollectionFieldData = [{ a: { b: 1 } }, { a: { b: 2 } }, { a: { b: 3 } }];
  expect(Helper.selectCollectionField(selectCollectionFieldData, 'a.b')).toEqual([1, 2, 3]);

  // findItemFromDeepField
  const navigationRootState = {
    stale: false,
    type: 'stack',
    key: 'stack-bsYQyFIFKO0cCnMhsEiSQ',
    index: 2,
    routeNames: ['MainBottomTab', 'List', 'Detail', 'AppSettings'],
    routes: [
      {
        key: 'MainBottomTab-cGMfYZiV-FJAKQVSG7zhD',
        name: 'MainBottomTab',
        state: {
          stale: false,
          type: 'tab',
          key: 'tab-2bnTWN_vVE8ScgKcKDtAT',
          index: 0,
          routeNames: ['HomeTab', 'SettingsTab'],
          history: [{ type: 'route', key: 'HomeTab-JQrEh_eVgHKKTaCA1vnbm' }],
          routes: [
            { name: 'HomeTab', key: 'HomeTab-JQrEh_eVgHKKTaCA1vnbm' },
            { name: 'SettingsTab', key: 'SettingsTab-ln4IXwMunDe754KZ7r2r_' },
          ],
        },
      },
      { key: 'List-FEjsxzfkW-4O3Vz_qNewy', name: 'List' },
      {
        key: 'Detail-C78VqHInfONeczAiHvNPt',
        name: 'Detail',
        params: { item: { id: 1, title: 'Lorem ipsum' } },
      },
    ],
  };
  expect(Helper.findItemFromDeepField(navigationRootState, 'name', 'HomeTab')).toEqual({
    key: 'HomeTab-JQrEh_eVgHKKTaCA1vnbm',
    name: 'HomeTab',
  });

  // assignKeyToPlainArray
  const imagesUrls = [
    'https://images.unsplash.com/photo-1514604426857-abb26d2fb4af?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1512798738109-af8814836728?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60',
  ];
  expect(Helper.assignKeyToPlainArray(imagesUrls, 'uri')).toEqual([
    {
      uri: 'https://images.unsplash.com/photo-1514604426857-abb26d2fb4af?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60',
    },
    {
      uri: 'https://images.unsplash.com/photo-1512798738109-af8814836728?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60',
    },
  ]);

  // convertToRgb
  expect(Helper.convertToRgb('#FFFFFF')).toEqual('rgb(255,255,255)');
  expect(Helper.convertToRgb('#FFF')).toEqual('rgb(255,255,255)');
  expect(Helper.convertToRgb('#12312312')).toEqual('#12312312'); // Cannot convert

  // getRgbArray
  expect(Helper.getRgbArray('rgb(255,255,255)')).toEqual([255, 255, 255]);

  // sleep
  await Helper.sleep(100);

  // round
  expect(Helper.round(1.2345)).toEqual(1.23);
  expect(Helper.round(1.23456, 3)).toEqual(1.235);
  expect(Helper.round(1.235)).toEqual(1.24);

  // removeUselessCharacters
  expect(Helper.removeUselessCharacters('$1,000,000.248', ['-', ',', '\\$'])).toEqual(
    '1000000.248',
  );

  // currencyFormat
  expect(Helper.currencyFormat(1000000.248)).toEqual('$1,000,000.25');

  // numberWithCommas
  expect(Helper.numberWithCommas(1000000.248)).toEqual('1,000,000.248');

  // inputCurrencyFormat
  expect(Helper.inputCurrencyFormat('')).toEqual('$0');
  expect(Helper.inputCurrencyFormat('$')).toEqual('$0');
  expect(Helper.inputCurrencyFormat('5.999')).toEqual('$6.00');
  expect(Helper.inputCurrencyFormat('10')).toEqual('$10');
  expect(Helper.inputCurrencyFormat('10.789')).toEqual('$10.79');
  expect(Helper.inputCurrencyFormat('.789')).toEqual('$0.79');
  expect(Helper.inputCurrencyFormat('$1000000.789')).toEqual('$1,000,000.79');

  // inputNumberFormat
  expect(Helper.inputNumberFormat('')).toEqual('');
  expect(Helper.inputNumberFormat('5.999')).toEqual('6.00');
  expect(Helper.inputNumberFormat('10')).toEqual('10');
  expect(Helper.inputNumberFormat('10.789')).toEqual('10.79');
  expect(Helper.inputNumberFormat('.789', 3)).toEqual('0.789');
  expect(Helper.inputNumberFormat('1000000.789')).toEqual('1,000,000.79');

  // shallowEqual
  expect(Helper.shallowEqual({ a: { b: 1 } }, { a: { b: 1 } })).toBe(false); // Only equal when using deep compare
  expect(Helper.shallowEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
  expect(Helper.shallowEqual({ a: 1 }, { a: 2 })).toBe(false);
  expect(Helper.shallowEqual({ a: 1 }, { a: 1 })).toBe(true);
});

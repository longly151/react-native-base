import React from 'react';
import { render, act, renderHook } from '@utils/TestHelper';
import { useBottomSheet } from '@components/hooks';
import { View } from 'react-native';
import Text from '@components/common/Text';
import BottomSheetProvider from '@components/common/BottomSheet/BottomSheetProvider';
import { BottomSheetProps, BottomSheetType } from '@components/common/BottomSheet';

test('should render correctly', () => {
  const { toJSON } = render(<React.Fragment />, { wrapper: BottomSheetProvider });
  expect(toJSON()).toMatchSnapshot();
});

test('should show bottomSheet correctly', async () => {
  /**
   * Init New BottomSheet
   */
  const { result } = renderHook(() => useBottomSheet(), { wrapper: BottomSheetProvider });

  const DEFAULT_SHEET = 'DefaultBottomSheet';
  const NEW_SHEET = 'NewBottomSheet';

  act(() => {
    result.current.setBottomSheet(DEFAULT_SHEET, {
      children: <View testID="BottomSheetContent" />,
    });
  });

  const bottomSheet = result.current.getBottomSheet(DEFAULT_SHEET) as BottomSheetType;

  // @ts-expect-error
  const bottomSheetProps = bottomSheet._reactInternals.stateNode.props as BottomSheetProps;

  const { getByTestId, rerender } = render(bottomSheetProps?.children as any);

  expect(getByTestId('BottomSheetContent')).toBeTruthy();

  /**
   * Add new BottomSheet
   */
  act(() => {
    result.current.setBottomSheet(NEW_SHEET, {
      children: <View testID="NewBottomSheetContent" />,
    });
  });

  const newbottomSheet = result.current.getBottomSheet(NEW_SHEET) as BottomSheetType;
  // @ts-expect-error
  const newBottomSheetProps = newbottomSheet._reactInternals.stateNode.props as BottomSheetProps;

  rerender(newBottomSheetProps?.children as any);
  expect(getByTestId('NewBottomSheetContent')).toBeTruthy();

  /**
   * Update existed BottomSheet
   */
  act(() => {
    result.current.setBottomSheet(DEFAULT_SHEET, {
      children: <Text testID="UpdateBottomSheetContent" />,
    });
  });

  const updatebottomSheet = result.current.getBottomSheet(DEFAULT_SHEET) as BottomSheetType;
  // @ts-expect-error
  const updateBottomSheetProps = updatebottomSheet._reactInternals.stateNode
    .props as BottomSheetProps;

  rerender(updateBottomSheetProps?.children as any);
  expect(getByTestId('UpdateBottomSheetContent')).toBeTruthy();
});

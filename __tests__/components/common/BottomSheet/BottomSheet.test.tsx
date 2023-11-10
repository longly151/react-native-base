import React from 'react';
import { render } from '@utils/TestHelper';
import BottomSheet, {
  BottomSheetProps,
  BottomSheetType,
} from '@components/common/BottomSheet/index';
import { View } from 'react-native';
import BottomSheetProvider from '@components/common/BottomSheet/BottomSheetProvider';
import BottomSheetView from '@components/common/BottomSheet/children/BottomSheetView';
import BottomSheetScrollView from '@components/common/BottomSheet/children/BottomSheetScrollView';
import BottomSheetFlatList from '@components/common/BottomSheet/children/BottomSheetFlatList';
import BottomSheetSectionList from '@components/common/BottomSheet/children/BottomSheetSectionList';

test('should render correctly', () => {
  const { toJSON } = render(
    <BottomSheet>
      <View />
    </BottomSheet>,
    { wrapper: BottomSheetProvider },
  );
  expect(toJSON()).toMatchSnapshot();
});

test('should have working props', async () => {
  const bottomSheetModalRef: React.RefObject<BottomSheetType> = React.createRef();

  const { getByTestId, rerender } = render(
    <BottomSheet ref={bottomSheetModalRef} showCloseIcon>
      <View testID="BottomSheetStaticView" />
    </BottomSheet>,
    { wrapper: BottomSheetProvider },
  );

  expect(getByTestId('BottomSheetStaticView')).toBeTruthy();

  // @ts-expect-error
  const bottomSheetProps = bottomSheetModalRef.current._reactInternals.stateNode
    .props as BottomSheetProps;

  // @ts-ignore
  expect(bottomSheetProps.snapPoints?.length).toBeGreaterThanOrEqual(1);
  expect(bottomSheetProps.backdropComponent?.({} as any)).toBeTruthy();
  expect(bottomSheetProps.backgroundComponent?.({} as any)).toBeTruthy();
  expect(bottomSheetProps.handleComponent?.({} as any)).toBeTruthy();

  /**
   * BottomSheetView
   */
  rerender(
    <BottomSheet ref={bottomSheetModalRef} showCloseIcon>
      <BottomSheetView>
        <View testID="BottomSheetStaticView" />
      </BottomSheetView>
    </BottomSheet>,
  );
  expect(getByTestId('BottomSheetStaticView')).toBeTruthy();

  /**
   * BottomSheetScrollView
   */
  rerender(
    <BottomSheet ref={bottomSheetModalRef} showCloseIcon>
      <BottomSheetScrollView>
        <View testID="BottomSheetStaticView" />
      </BottomSheetScrollView>
    </BottomSheet>,
  );
  expect(getByTestId('BottomSheetStaticView')).toBeTruthy();

  /**
   * BottomSheetFlatList
   */
  rerender(
    <BottomSheet ref={bottomSheetModalRef}>
      <BottomSheetFlatList
        data={['Demo']}
        renderItem={() => <View testID="BottomSheetStaticView" />}
      />
    </BottomSheet>,
  );
  expect(getByTestId('BottomSheetStaticView')).toBeTruthy();

  /**
   * BottomSheetSectionList
   */
  rerender(
    <BottomSheet ref={bottomSheetModalRef} showCloseIcon>
      <BottomSheetSectionList
        sections={[{ title: 'Demo', data: ['Demo'] }]}
        renderItem={() => <View testID="BottomSheetStaticView" />}
      />
    </BottomSheet>,
  );
  expect(getByTestId('BottomSheetStaticView')).toBeTruthy();
});

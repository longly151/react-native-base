import { useContext } from 'react';
import { BottomSheetContext } from '@components/common/BottomSheet/BottomSheetProvider';

const useBottomSheet = () => useContext(BottomSheetContext);

export default useBottomSheet;

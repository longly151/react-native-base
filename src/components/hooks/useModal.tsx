import { useContext } from 'react';
import { ModalContext } from '@components/common/Modal/ModalProvider';

const useModal = () => useContext(ModalContext);

export default useModal;

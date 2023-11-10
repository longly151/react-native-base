/* eslint-disable react/destructuring-assignment */
import React, { useRef, useState, useImperativeHandle } from 'react';
import { act, fireEvent, render, waitFor } from '@utils/TestHelper';
import Modal, { ModalType } from '@components/common/Modal/index';
import { Text, TouchableOpacity, View } from 'react-native';

global.console = {
  ...console,
  error: jest.fn(),
};

test('should render correctly', () => {
  const { toJSON, getByTestId } = render(
    <Modal>
      <View />
    </Modal>,
  );
  expect(toJSON()).toMatchSnapshot();
  expect(getByTestId('Modal')).toBeTruthy();
});

const ModalScreen = React.forwardRef(
  ({ onBackdropPress }: { onBackdropPress: () => any }, ref: any) => {
    const modalRef = useRef<ModalType>(null);
    const [isVisible, setIsVisible] = useState(false);

    useImperativeHandle(ref, () => ({
      ...modalRef.current,
    }));

    const Content = (props: any) => (
      <>
        <Text testID="ModalContent">{props.forwardData?.content}</Text>
        <TouchableOpacity testID="CloseButton" onPress={() => props.close()} />
      </>
    );

    return (
      <>
        <TouchableOpacity testID="ModalButton" onPress={() => setIsVisible(!isVisible)} />
        <Modal ref={modalRef} isVisible={isVisible} onBackdropPress={onBackdropPress} backdropClose>
          <Content />
        </Modal>
      </>
    );
  },
);

test('should have working props', async () => {
  const modalRef: React.RefObject<ModalType> = React.createRef();
  const onBackdropPress = jest.fn();

  const { getByTestId, queryByTestId } = render(
    <ModalScreen ref={modalRef} onBackdropPress={onBackdropPress} />,
  );

  expect(getByTestId('Modal')).toHaveProp('visible', false);
  expect(queryByTestId('ModalContent')).toBeFalsy();

  // Open Modal
  fireEvent.press(getByTestId('ModalButton'));

  expect(getByTestId('Modal')).toHaveProp('visible', true);
  expect(getByTestId('ModalContent')).toBeTruthy();

  // Press backdrop
  act(() => {
    getByTestId('Modal').props.onBackdropPress();
  });
  await waitFor(() => expect(getByTestId('Modal')).toHaveProp('visible', false));
  expect(onBackdropPress).toBeCalledTimes(1);

  act(() => {
    modalRef.current?.setForwardData({ content: 'Hello' });
    modalRef.current?.trigger(true);
  });

  await waitFor(() => expect(getByTestId('Modal')).toHaveProp('visible', true));
  await waitFor(() => expect(getByTestId('ModalContent')).toHaveTextContent('Hello'));

  // Press CloseButton
  fireEvent.press(getByTestId('CloseButton'));
  await waitFor(() => expect(getByTestId('Modal')).toHaveProp('visible', false));
  await waitFor(() => expect(queryByTestId('ModalContent')).toBeFalsy());

  // Test "trigger" function
  act(() => {
    modalRef.current?.trigger(false);
  });
  await waitFor(() => expect(getByTestId('Modal')).toHaveProp('visible', false));
});

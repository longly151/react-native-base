import React from 'react';
import { fireEvent, render, act, renderHook } from '@utils/TestHelper';
import { useModal } from '@components/hooks';
import { Text, View } from 'react-native';
import ModalProvider from '@components/common/Modal/ModalProvider';
import { ModalType } from '@components/common/Modal';

test('should render correctly', () => {
  const { toJSON, getByTestId } = render(<React.Fragment />, { wrapper: ModalProvider });
  expect(toJSON()).toMatchSnapshot();
  expect(getByTestId('ModalProvider')).toBeTruthy();
});

test('should show alert modal correctly', async () => {
  const { result } = renderHook(() => useModal(), { wrapper: ModalProvider });

  const onOkButtonPress = jest.fn();
  const onCancelButtonPress = jest.fn();

  /**
   * Alert Modal
   */
  act(() => {
    result.current.alert({
      title: 'Confirmation',
      description: 'Are you sure you want to log out?',
      okTitle: 'Logout',
      showCancel: true,
      reverseButtonPosition: true,
      onOkButtonPress,
      onCancelButtonPress,
    });
  });

  let alertModalProps = result.current.getModal('alert')?.props;

  expect(alertModalProps?.isVisible).toBe(true);

  const { toJSON, getByTestId, rerender } = render(alertModalProps?.children as any);
  expect(toJSON()).toMatchSnapshot();

  expect(getByTestId('TitleText')).toHaveTextContent('Confirmation');
  expect(getByTestId('DescriptionText')).toHaveTextContent('Are you sure you want to log out?');
  expect(getByTestId('OkButton')).toHaveTextContent('Logout');

  fireEvent.press(getByTestId('CancelButton'));
  expect(onCancelButtonPress).toBeCalledTimes(1);

  fireEvent.press(getByTestId('OkButton'));
  expect(onOkButtonPress).toBeCalledTimes(1);

  onOkButtonPress.mockClear();
  onCancelButtonPress.mockClear();

  /**
   * Loading Modal
   */
  act(() => {
    result.current.alert({
      loading: true,
    });
  });
  alertModalProps = result.current.getModal('alert')?.props;

  rerender(alertModalProps?.children as any);
  expect(toJSON()).toMatchSnapshot();

  expect(alertModalProps?.isVisible).toBe(true);
  expect(getByTestId('Loading')).toBeTruthy();

  act(() => {
    result.current.alert({
      loading: false,
    });
  });
  alertModalProps = result.current.getModal('alert')?.props;
  expect(alertModalProps?.isVisible).toBe(false);

  /**
   * Success/Error Modal
   */
  act(() => {
    result.current.alert({
      title: 'Submission successful',
      type: 'success',
      onOkButtonPress,
    });
  });

  alertModalProps = result.current.getModal('alert')?.props;
  expect(alertModalProps?.isVisible).toBe(true);

  rerender(alertModalProps?.children as any);
  expect(toJSON()).toMatchSnapshot();

  expect(getByTestId('TitleText')).toHaveTextContent('Submission successful');
  expect(getByTestId('SuccessIcon')).toBeTruthy();

  fireEvent.press(getByTestId('OkButton'));
  expect(onOkButtonPress).toBeCalledTimes(1);

  alertModalProps = result.current.getModal('alert')?.props;
  expect(alertModalProps?.isVisible).toBe(false);

  act(() => {
    result.current.alert({
      title: 'Submission failed',
      type: 'error',
      onOkButtonPress,
    });
  });

  alertModalProps = result.current.getModal('alert')?.props;
  rerender(alertModalProps?.children as any);
  expect(toJSON()).toMatchSnapshot();

  expect(getByTestId('TitleText')).toHaveTextContent('Submission failed');
  expect(getByTestId('ErrorIcon')).toBeTruthy();
});

test('should show modal correctly', () => {
  /**
   * Init New Modal
   */
  const { result } = renderHook(() => useModal(), { wrapper: ModalProvider });

  const MODAL_NAME = 'DefaultModal';
  act(() => {
    result.current.setModal(MODAL_NAME, {
      children: <View testID="ModalContent" />,
    });
  });

  let modal = result.current.getModal(MODAL_NAME) as ModalType;

  const { toJSON, getByTestId, rerender } = render(modal.props?.children as any);

  expect(toJSON()).toMatchSnapshot();

  expect(getByTestId('ModalContent')).toBeTruthy();

  // Open Modal
  act(() => {
    modal.trigger();
  });
  modal = result.current.getModal(MODAL_NAME) as ModalType;
  expect(modal.props?.isVisible).toBe(true);

  // Close Modal
  act(() => {
    modal.trigger();
  });
  modal = result.current.getModal(MODAL_NAME) as ModalType;
  expect(modal.props?.isVisible).toBe(false);

  /**
   * Update Modal
   */
  act(() => {
    result.current.setModal(MODAL_NAME, {
      children: <Text testID="NewModalContent" />,
    });
  });

  modal = result.current.getModal(MODAL_NAME) as ModalType;
  rerender(modal.props?.children as any);
  expect(getByTestId('NewModalContent')).toBeTruthy();
});

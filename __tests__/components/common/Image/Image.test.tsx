import React from 'react';
import RN, { Image as RNImage } from 'react-native';
import { act, fireEvent, render, waitFor } from '@utils/TestHelper';
import Image, { ImageType } from '@components/common/Image/index';
import ImageSource from '@images';
import AppView from '@utils/AppView';
import DefaultColor from '@themes/DefaultColor';
import DarkColor from '@themes/DarkColor';

global.console = {
  ...console,
  error: jest.fn(),
};

jest.spyOn(RN.Animated, 'FlatList', 'get').mockImplementation(() => RN.FlatList);

let mockTheme = DefaultColor;
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useTheme: jest.fn().mockImplementation(() => mockTheme),
}));

const localSource = ImageSource.iconAppIOS;
const remoteSource = {
  uri: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1500&q=80',
};
const imageWidth = 100;
const imageHeight = imageWidth * 2;

RNImage.resolveAssetSource = jest.fn().mockReturnValue({ width: imageWidth, height: imageHeight });

test('should render correctly', () => {
  const { toJSON, getByTestId } = render(<Image source={localSource} />);
  expect(toJSON()).toMatchSnapshot();
  expect(getByTestId('Image')).toBeTruthy();
});

test('should have working props with local image', async () => {
  /**
   * Local Image
   */
  const { getByTestId } = render(
    <Image
      source={localSource}
      className="flex-1 flex-row self-center justify-between items-center rounded border mx-1 my-1 p-1 border-sky-700 bg-sky-500"
    />,
  );

  expect(getByTestId('ContainerTouchableOpacity')).toHaveStyle({
    alignSelf: 'center',
    marginLeft: 4,
    marginRight: 4,
    marginTop: 4,
    marginBottom: 4,
    borderLeftColor: 'rgba(3, 105, 161, 1)',
    borderRightColor: 'rgba(3, 105, 161, 1)',
    borderTopColor: 'rgba(3, 105, 161, 1)',
    borderBottomColor: 'rgba(3, 105, 161, 1)',
  });

  expect(getByTestId('Image')).toHaveStyle({
    flexGrow: 1,
    flexShrink: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    backgroundColor: 'rgba(14, 165, 233, 1)',
    paddingLeft: 4,
    paddingRight: 4,
    paddingTop: 4,
    paddingBottom: 4,

    // Image Dimensions
    width: AppView.bodyWidth,
    height: AppView.bodyWidth * 2,
  });
});

test('should have working props with remote image', async () => {
  /**
   * Remote Image (with width = screenWidth & autoHeight = true in default)
   */
  const { getByTestId, findByTestId, queryByTestId } = render(
    <Image source={remoteSource} viewEnable sharp />,
  );

  expect(getByTestId('Image')).toHaveStyle({
    borderRadius: 0, // Sharp Image
    width: AppView.bodyWidth,
    height: AppView.bodyWidth,
  });

  expect(getByTestId('PlaceholderImage')).toHaveStyle({
    tintColor: mockTheme.colors.grey3,
  });

  fireEvent(getByTestId('Image'), 'onLoad', {
    nativeEvent: {
      source: { width: imageWidth, height: imageHeight },
    },
  });

  expect(getByTestId('Image')).toHaveStyle({
    width: AppView.bodyWidth,
    height: AppView.bodyWidth * 2,
  });
  expect(queryByTestId('PlaceholderImage')).toBeFalsy();

  // Open Image in FullScreen View
  fireEvent.press(getByTestId('ContainerTouchableOpacity'));
  const ImageViewerModal = await findByTestId('ImageViewerModal');

  expect(ImageViewerModal).toHaveProp('visible', true);
  expect(getByTestId('ImageFullScreen')).toHaveStyle({
    width: AppView.screenWidth,
    height: AppView.screenWidth * 2,
  });

  /**
   * Remote Image (with autoWidth = true)
   */
  const { getByTestId: getByTestIdAutoWidth } = render(
    <Image source={remoteSource} viewEnable autoWidth />,
  );

  expect(getByTestIdAutoWidth('Image')).toHaveStyle({
    height: AppView.bodyWidth,
    width: AppView.bodyWidth,
  });

  fireEvent(getByTestIdAutoWidth('Image'), 'onLoad', {
    nativeEvent: {
      source: { width: imageWidth, height: imageHeight },
    },
  });

  expect(getByTestIdAutoWidth('Image')).toHaveStyle({
    height: AppView.bodyWidth,
    width: AppView.bodyWidth / 2,
  });

  /**
   * Remote Image (with custom width, height)
   */
  const { getByTestId: getByTestIdCustomDimensions } = render(
    <Image source={remoteSource} width={500} height={1000} />,
  );
  expect(getByTestIdCustomDimensions('Image')).toHaveStyle({
    width: 500,
    height: 1000,
  });

  /**
   * Show Loading (disablePlaceholder === true)
   */
  const { findByTestId: findByTestIdWithLoading } = render(
    <Image source={remoteSource} viewEnable disablePlaceholder width={200} />,
  );

  expect(await findByTestIdWithLoading('Loading')).toBeTruthy();

  /**
   * DarkColor
   */
  mockTheme = DarkColor;
  const { getByTestId: getByTestIdDark } = render(<Image source={remoteSource} />);

  expect(getByTestIdDark('PlaceholderImage')).toHaveStyle({
    tintColor: mockTheme.colors.grey1,
  });
});

test('should render fullscreen view correctly', async () => {
  const imageRef: React.RefObject<ImageType> = React.createRef();

  const { getByTestId: getByTestIdImage } = render(
    <Image
      ref={imageRef}
      source={localSource}
      multipleSources={[remoteSource, localSource]}
      viewEnable
    />,
  );

  // Open Image in FullScreen View
  fireEvent.press(getByTestIdImage('ContainerTouchableOpacity'));

  expect(getByTestIdImage('ImageViewerModal')).toHaveProp('visible', true);
  expect(imageRef.current?.imageViewerModalRef.current?.props.index).toBe(1); // localSource index

  // Close Image FullScreen View
  act(() => {
    imageRef.current?.imageViewerModalRef.current?.handleCancel();
  });

  await waitFor(() => expect(getByTestIdImage('ImageViewerModal')).toHaveProp('visible', false));
});

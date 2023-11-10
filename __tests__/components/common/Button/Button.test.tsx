import React from 'react';
import { render } from '@utils/TestHelper';
import Button from '@components/common/Button/index';
import DefaultColor from '@themes/DefaultColor';
import { Platform, View } from 'react-native';
import _ from 'lodash';
import Touchable, { containerStyleKeys } from '@components/common/Button/Touchable';
import Color from 'color';
import TouchableOpacity from '@components/common/Button/TouchableOpacity';
import TouchableWithoutFeedback from '@components/common/Button/TouchableWithoutFeedback';
import AppView from '@utils/AppView';

let mockTheme = DefaultColor;
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useTheme: jest.fn().mockImplementation(() => mockTheme),
}));

beforeEach(() => {
  mockTheme = DefaultColor;
  Platform.OS = 'ios';
});

test('should render correctly', () => {
  const { toJSON, getByTestId } = render(<Button />);
  expect(toJSON()).toMatchSnapshot();
  expect(getByTestId('TouchableView')).toBeTruthy();
});

test('should have working props', () => {
  const RootComponent = (
    <Button className="flex-1 flex-row self-center justify-between items-center rounded border mx-1 my-1 p-1 border-sky-700 bg-sky-500" />
  );
  const { getByTestId, rerender } = render(RootComponent);

  const style = {
    flexGrow: 1,
    flexShrink: 1,
    flexDirection: 'row',
    alignSelf: 'center',
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
    borderLeftColor: 'rgba(3, 105, 161, 1)',
    borderRightColor: 'rgba(3, 105, 161, 1)',
    borderTopColor: 'rgba(3, 105, 161, 1)',
    borderBottomColor: 'rgba(3, 105, 161, 1)',
    backgroundColor: 'rgba(14, 165, 233, 1)',
    marginLeft: 4,
    marginRight: 4,
    marginTop: 4,
    marginBottom: 4,
    paddingLeft: 4,
    paddingRight: 4,
    paddingTop: 4,
    paddingBottom: 4,
  };

  let containerStyle = _.pick(style, containerStyleKeys[Platform.OS]);
  let otherStyle = _.omit(style, containerStyleKeys[Platform.OS]);
  expect(getByTestId('ContainerView')).toHaveStyle(containerStyle);
  expect(getByTestId('TouchableView')).toHaveStyle(otherStyle);

  /**
   * Shadow Button
   */
  const { getByTestId: getByTestIdShadow } = render(<Button style={AppView.shadow(5)} />);

  expect(getByTestIdShadow('ContainerView')).toHaveStyle({ elevation: 5 });
  expect(getByTestIdShadow('TouchableView')).toHaveStyle({
    shadowColor: '#000',
    // shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  });

  /**
   * Outline Button
   */
  const { getByTestId: getByTestIdOutline } = render(<Button outline />);

  expect(getByTestIdOutline('ContainerView')).toHaveStyle({ elevation: 0 });
  expect(getByTestIdOutline('TouchableView')).toHaveStyle({
    backgroundColor: 'transparent',
    borderWidth: 1,
  });

  /**
   * Clear Button
   */
  const { getByTestId: getByTestIdClear } = render(<Button clear />);

  expect(getByTestIdClear('ContainerView')).toHaveStyle({ elevation: 0 });
  expect(getByTestIdClear('TouchableView')).toHaveStyle({
    backgroundColor: 'transparent',
    borderWidth: undefined,
  });

  /**
   * Icon Button
   */

  rerender(
    <Button
      leftIconProps={{
        type: 'material-community',
        name: 'arrow-left',
      }}
      rightIconProps={{
        type: 'material-community',
        name: 'arrow-right',
      }}
    />,
  );
  expect(getByTestId('LeftIcon')).toBeTruthy();
  expect(getByTestId('RightIcon')).toBeTruthy();

  /**
   * Loading Button
   */
  rerender(<Button loading title="Loading Button" />);
  expect(getByTestId('Loading')).toBeTruthy();
  expect(getByTestId('ButtonTitleText')).toHaveStyle({ opacity: 0 });

  /**
   * Disabled Button
   */
  rerender(<Button disabled title="Disabled Button" />);
  expect(getByTestId('ButtonTitleText')).toHaveStyle({
    color: Color(mockTheme.colors.grey3).lighten(0.2).hex(),
  });
  expect(getByTestId('TouchableView')).toHaveStyle({
    backgroundColor: mockTheme.colors.grey5,
  });

  /**
   * Android
   */
  Platform.OS = 'android';
  const { getByTestId: getByTestIdAndroid } = render(RootComponent);
  containerStyle = _.pick(style, containerStyleKeys[Platform.OS]);
  otherStyle = _.omit(style, containerStyleKeys[Platform.OS]);
  expect(getByTestIdAndroid('ContainerView')).toHaveStyle(containerStyle);
  expect(getByTestIdAndroid('TouchableView')).toHaveStyle(otherStyle);
});

test('should have working props [Touchable]', () => {
  const RootComponent = (
    <Touchable className="flex-1 flex-row self-center justify-between items-center rounded border mx-1 my-1 p-1 border-sky-700 bg-sky-500" />
  );
  const { getByTestId } = render(RootComponent);

  const style = {
    flexGrow: 1,
    flexShrink: 1,
    flexDirection: 'row',
    alignSelf: 'center',
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
    borderLeftColor: 'rgba(3, 105, 161, 1)',
    borderRightColor: 'rgba(3, 105, 161, 1)',
    borderTopColor: 'rgba(3, 105, 161, 1)',
    borderBottomColor: 'rgba(3, 105, 161, 1)',
    backgroundColor: 'rgba(14, 165, 233, 1)',
    marginLeft: 4,
    marginRight: 4,
    marginTop: 4,
    marginBottom: 4,
    paddingLeft: 4,
    paddingRight: 4,
    paddingTop: 4,
    paddingBottom: 4,
  };

  const containerStyle = _.pick(style, containerStyleKeys[Platform.OS]);
  const otherStyle = _.omit(style, containerStyleKeys[Platform.OS]);
  expect(getByTestId('ContainerView')).toHaveStyle(containerStyle);
  expect(getByTestId('TouchableView')).toHaveStyle(otherStyle);

  /**
   * Android
   */
  Platform.OS = 'android';
  Platform.Version = 31;
  const { getByTestId: getByTestIdAndroid } = render(<Touchable className="w-1 h-1 border" />);

  expect(getByTestIdAndroid('ContainerView')).toHaveStyle({ width: 5, height: 5 });
});

test('should have working props [TouchableOpacity]', () => {
  const RootComponent = (
    <TouchableOpacity className="flex-1 flex-row self-center justify-between items-center rounded border mx-1 my-1 p-1 border-sky-700 bg-sky-500" />
  );
  const { getByTestId } = render(RootComponent);

  expect(getByTestId('TouchableOpacity')).toHaveStyle({
    flexGrow: 1,
    flexShrink: 1,
    flexDirection: 'row',
    alignSelf: 'center',
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
    borderLeftColor: 'rgba(3, 105, 161, 1)',
    borderRightColor: 'rgba(3, 105, 161, 1)',
    borderTopColor: 'rgba(3, 105, 161, 1)',
    borderBottomColor: 'rgba(3, 105, 161, 1)',
    backgroundColor: 'rgba(14, 165, 233, 1)',
    marginLeft: 4,
    marginRight: 4,
    marginTop: 4,
    marginBottom: 4,
    paddingLeft: 4,
    paddingRight: 4,
    paddingTop: 4,
    paddingBottom: 4,
  });
});

test('should have working props [TouchableWithoutFeedback]', () => {
  const RootComponent = (
    <TouchableWithoutFeedback className="flex-1 flex-row self-center justify-between items-center rounded border mx-1 my-1 p-1 border-sky-700 bg-sky-500">
      <View />
    </TouchableWithoutFeedback>
  );
  const { queryByTestId } = render(RootComponent);

  expect(queryByTestId('TouchableWithoutFeedback')?.props.style).toBeFalsy();
});

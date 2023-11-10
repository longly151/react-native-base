import React from 'react';
import { fireEvent, render } from '@utils/TestHelper';
import Icon from '@components/common/Icon/index';
import DefaultColor from '@themes/DefaultColor';

const mockTheme = DefaultColor;
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useTheme: jest.fn().mockImplementation(() => mockTheme),
}));

test('should render correctly', () => {
  const { toJSON, getByTestId } = render(<Icon name="arrow-left" />);
  expect(toJSON()).toMatchSnapshot();
  expect(getByTestId('Icon')).toBeTruthy();
});

test('should have working props', () => {
  /**
   * Vector Icon
   */
  const onIconPress = jest.fn();

  const { getByTestId, rerender, toJSON } = render(
    <Icon
      primary
      name="arrow-left"
      onPress={onIconPress}
      className="flex-1 flex-row self-center justify-between items-center rounded border mx-1 my-1 p-1 border-sky-700 bg-sky-500"
    />,
  );

  expect(getByTestId('Icon')).toHaveStyle({
    color: mockTheme.colors.primary,
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

  fireEvent.press(getByTestId('Icon'));

  expect(onIconPress).toBeCalledTimes(1);

  /**
   * SVG Icon
   */
  rerender(<Icon type="svg" name="loginBackground" />);
  expect(JSON.stringify(toJSON())).toContain('SvgMock');
});

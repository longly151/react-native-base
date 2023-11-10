import React from 'react';
import { render } from '@utils/TestHelper';
import ScrollView from '@components/common/View/ScrollView';

test('should render correctly', () => {
  const { toJSON, getByTestId } = render(<ScrollView />);
  expect(toJSON()).toMatchSnapshot();
  expect(getByTestId('ScrollView')).toBeTruthy();
});

test('should have working props', () => {
  const { getByTestId } = render(
    <ScrollView
      scrollEnabled={false}
      className="flex-1 flex-row self-center justify-between items-center rounded border mx-1 my-1 p-1 border-sky-700 bg-sky-500"
    />,
  );

  expect(getByTestId('ScrollView')).toHaveStyle({
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

  expect(getByTestId('ScrollView')).toHaveProp('scrollEnabled', false);
});

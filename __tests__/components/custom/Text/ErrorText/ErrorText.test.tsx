import React from 'react';
import { render } from '@utils/TestHelper';
import ErrorText from '@components/custom/Text/ErrorText/index';
import DefaultColor from '@themes/DefaultColor';

let mockTheme = DefaultColor;
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useTheme: jest.fn().mockImplementation(() => mockTheme),
}));

beforeEach(() => {
  mockTheme = DefaultColor;
});

test('should render correctly', () => {
  const { getByTestId, queryByTestId, rerender } = render(<ErrorText />);
  expect(queryByTestId('ErrorText')).toBeFalsy();

  // Server Error
  rerender(<ErrorText error={{ code: 404, messages: ['Cannot find Item'] }} />);
  expect(getByTestId('ErrorText')).toHaveTextContent('Cannot find Item');

  rerender(<ErrorText error={{ code: 404, messages: ['undefined'] }} />);
  expect(getByTestId('ErrorText')).not.toHaveTextContent('undefined');

  // Custom Error
  rerender(<ErrorText error="Something went wrong" />);
  expect(getByTestId('ErrorText')).toHaveTextContent('Something went wrong');

  rerender(
    <ErrorText
      error={{
        code: 400,
        message: 'Incorrect username or password',
      }}
    />,
  );
  expect(getByTestId('ErrorText')).toHaveTextContent('Incorrect username or password');
});

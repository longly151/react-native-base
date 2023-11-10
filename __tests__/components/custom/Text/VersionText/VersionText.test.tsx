import React from 'react';
import { render } from '@utils/TestHelper';
import VersionText from '@components/custom/Text/VersionText/index';
import Config from 'react-native-config';
import DeviceInfo from 'react-native-device-info';

test('should run correctly', () => {
  const getVersionMock = jest.spyOn(DeviceInfo, 'getVersion');
  const getBuildNumberMock = jest.spyOn(DeviceInfo, 'getBuildNumber');

  getVersionMock.mockReturnValue('1.0.0');
  getBuildNumberMock.mockReturnValue('1');

  const { getByTestId, rerender } = render(<VersionText />);
  expect(getByTestId('VersionText')).toHaveTextContent('1.0.0.1 (development)');

  // Blank Info
  getVersionMock.mockReturnValue('');
  getBuildNumberMock.mockReturnValue('');
  Config.NODE_ENV = 'production';

  rerender(<VersionText />);
  expect(getByTestId('VersionText')).toHaveTextContent('');
});

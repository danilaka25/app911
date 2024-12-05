import DeviceInfo from 'react-native-device-info';

export const userService = {
  async getUserId(): Promise<string> {
    return await DeviceInfo.getUniqueId();
  },
};

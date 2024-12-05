import {PermissionsAndroid, Platform} from 'react-native';

export enum AppPermission {
  LOCATION = 'LOCATION',
  CAMERA = 'CAMERA',
  BLUETOOTH = 'BLUETOOTH',
}

const isAndroid12OrHigher = Platform.OS === 'android' && Platform.Version >= 31;

export const PermissionMap = {
  [AppPermission.LOCATION]: {
    android: PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  },
  [AppPermission.CAMERA]: {
    android: PermissionsAndroid.PERMISSIONS.CAMERA,
  },
  [AppPermission.BLUETOOTH]: {
    android: isAndroid12OrHigher
      ? PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN
      : PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  },
} as const;

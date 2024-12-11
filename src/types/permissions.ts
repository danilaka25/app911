import {PermissionsAndroid, Platform} from 'react-native';

export enum AppPermission {
  LOCATION = 'LOCATION',
  CAMERA = 'CAMERA',
  BLUETOOTH = 'BLUETOOTH',
}

const isAndroid31Higher = Platform.OS === 'android' && Platform.Version >= 31;
const isAndroid29Higher = Platform.OS === 'android' && Platform.Version >= 29;

export const PermissionMap = {
  [AppPermission.LOCATION]: {
    android: PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  },
  [AppPermission.CAMERA]: {
    android: PermissionsAndroid.PERMISSIONS.CAMERA,
  },
  [AppPermission.BLUETOOTH]: {
    android: isAndroid31Higher
      ? [
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]
      : isAndroid29Higher
      ? PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      : PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
  },
} as const;

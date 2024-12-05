import {NavigatorScreenParams} from '@react-navigation/native';

export type RootTabParamList = {
  Barcode: undefined;
  Wifi: undefined;
  Bluetooth: undefined;
  Map: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<RootTabParamList>;
  Settings: undefined;
};

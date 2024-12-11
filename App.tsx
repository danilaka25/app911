import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Provider} from 'react-redux';
import {store} from '$src/store/store';

import {
  BarcodeScreen,
  WifiScreen,
  BluetoothScreen,
  MapScreen,
  SettingsScreen,
} from '$src/screens';
import {RootTabParamList, RootStackParamList} from '$src/types';
import {SettingsButton} from '$src/components';
import * as Sentry from '@sentry/react-native';
import {SENTRY_DSN} from '@env';

Sentry.init({
  dsn: SENTRY_DSN,
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
  enableAutoPerformanceTracing: true,
  debug: true,
  enabled: true,
  environment: __DEV__ ? 'development' : 'production',
  integrations: [
    Sentry.breadcrumbsIntegration({
      console: true,
      dom: true,
      fetch: true,
      history: true,
    }),
  ],
});

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const iconMap: Record<keyof RootTabParamList, string> = {
  Barcode: 'qr-code-scanner',
  Wifi: 'wifi',
  Bluetooth: 'bluetooth',
  Map: 'map',
  Settings: 'settings',
};

const getTabBarIcon =
  (routeName: keyof RootTabParamList) =>
  ({color, size}: {color: string; size: number}) =>
    <Icon name={iconMap[routeName]} size={size} color={color} />;

const renderSettingsButton = () => <SettingsButton />;

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: getTabBarIcon(route.name),
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#CCC',
        headerRight: renderSettingsButton,
      })}>
      <Tab.Screen name="Barcode" component={BarcodeScreen} />
      <Tab.Screen name="Wifi" component={WifiScreen} />
      <Tab.Screen name="Bluetooth" component={BluetoothScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
    </Tab.Navigator>
  );
};

const App: React.FC = (): JSX.Element => {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="MainTabs"
            component={MainTabs}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              headerBackTitle: 'Back',
              animation: 'slide_from_right',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
};

export default Sentry.wrap(App);

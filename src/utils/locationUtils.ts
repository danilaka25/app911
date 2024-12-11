import Geolocation from '@react-native-community/geolocation';
import {Location} from '$src/types';
import {WifiNetwork} from '$src/types/wifi';
import {BluetoothDevice} from '$src/types/bluetooth';
import {logger} from '$src/utils/logger';

export const getCurrentLocation = (): Promise<Location> => {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        resolve({
          id: 'current',
          title: 'Current Location',
          description: 'You are here',
          latitude,
          longitude,
          type: 'current',
          icon: 'my-location',
        });
      },
      error => {
        logger.error('Geolocation error:', error);
        reject(error);
      },
      {enableHighAccuracy: false, timeout: 15000, maximumAge: 10000},
    );
  });
};

export const getLocations = (
  currentLocation: Location | null,
  wifiNetworks: Record<string, WifiNetwork>,
  bluetoothDevices: Record<string, BluetoothDevice>,
): Location[] => {
  const locations: Location[] = [];

  if (currentLocation) {
    locations.push(currentLocation);
  }

  Object.values(wifiNetworks).forEach(network => {
    locations.push({
      id: network.BSSID,
      title: network.SSID || 'Unknown Network',
      description: `BSSID: ${network.BSSID}`,
      latitude: network.latitude,
      longitude: network.longitude,
      type: 'wifi',
      icon: 'wifi',
      details: `Signal: ${network.level}dBm, Frequency: ${network.frequency}MHz`,
    });
  });

  Object.values(bluetoothDevices).forEach(device => {
    locations.push({
      id: device.id,
      title: device.name || 'Unknown Device',
      description: `ID: ${device.id}`,
      latitude: device.latitude,
      longitude: device.longitude,
      type: 'bluetooth',
      icon: 'bluetooth',
      details: `Signal: ${device.rssi}dBm`,
    });
  });

  return locations;
};

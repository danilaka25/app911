import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {BluetoothDevice} from '$src/types';

interface DeviceItemProps {
  device: BluetoothDevice;
  onLongPress: (device: BluetoothDevice) => void;
}

const DeviceItem: React.FC<DeviceItemProps> = ({device, onLongPress}) => {
  return (
    <TouchableOpacity
      style={styles.deviceItem}
      onLongPress={() => onLongPress(device)}>
      <View style={styles.deviceHeader}>
        <Text style={styles.deviceName}>{device.name || 'Unknown Device'}</Text>
        <Text style={styles.signalStrength}>{device.rssi} dBm</Text>
      </View>
      <Text style={styles.deviceDetails}>ID: {device.id}</Text>
      {device.serviceUUIDs && device.serviceUUIDs.length > 0 && (
        <Text style={styles.deviceDetails}>
          Services: {device.serviceUUIDs.join(', ')}
        </Text>
      )}
      <Text style={styles.deviceDetails}>
        Connectable: {device.isConnectable ? 'Yes' : 'No'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  deviceItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  signalStrength: {
    fontSize: 14,
    color: '#666',
  },
  deviceDetails: {
    fontSize: 13,
    color: '#666',
    marginVertical: 2,
  },
});

export default DeviceItem;

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {BleManager} from 'react-native-ble-plx';
import {useSelector} from 'react-redux';
import {RootState} from '$src/store';
import {bluetoothService} from '$src/services';
import {BluetoothDevice} from '$src/types';
import usePermissions from '$src/hooks/usePermissions';
import {AppPermission} from '$src/types/permissions';
import {
  DeviceItem,
  ConnectionStateModal,
  BlockedPermissionView,
} from '$src/components';
import {randomGeo} from '$src/utils/randomGeo';
import {logger} from '$src/utils/logger';

const BluetoothScreen = () => {
  const {devices, loading} = useSelector((state: RootState) => state.bluetooth);
  const devicesList = Object.values(devices);
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const {granted: hasPermission, requestPermission} = usePermissions(
    AppPermission.BLUETOOTH,
    () => setShowBlockedModal(true),
  );
  const manager = new BleManager();
  const [isBluetoothOff, setIsBluetoothOff] = useState(false);

  useEffect(() => {
    logger.info('BluetoothScreen opened');
    initializeFirestoreSubscription();
    return () => {
      manager.destroy();
      bluetoothService.unsubscribeFromDevices();
    };
  }, []);

  const initializeFirestoreSubscription = async () => {
    try {
      await bluetoothService.subscribeToDevices();
    } catch (error) {
      logger.error('Error initializing Firestore subscription:', error);
    }
  };

  const handleStartScanning = async () => {
    if (hasPermission) {
      startScanning();
    } else {
      const granted = await requestPermission();
      if (granted) {
        startScanning();
      }
    }
  };

  const startScanning = async () => {
    logger.info('Start scanning bluetooth');

    setIsScanning(true);
    const scannedDevices: BluetoothDevice[] = [];

    try {
      manager.startDeviceScan(null, null, async (error, device) => {
        if (error) {
          if (error.message.includes('powered off')) {
            logger.error('Bluetooth powered off', error.message);
            setIsBluetoothOff(true);
          }

          logger.info('Stop scanning bluetooth');
          stopScanning();
          return;
        }

        const randomPosition = randomGeo();

        if (device) {
          const bluetoothDevice: BluetoothDevice = {
            id: device.id,
            name: device.name,
            rssi: device.rssi || 0,
            serviceUUIDs: device.serviceUUIDs,
            isConnectable: device.isConnectable,
            latitude: randomPosition.latitude,
            longitude: randomPosition.longitude,
            updatedAt: Date.now(),
          };

          scannedDevices.push(bluetoothDevice);
        }
      });

      // Stop scanning after 5 seconds
      setTimeout(async () => {
        logger.info('Stop scanning bluetooth');
        stopScanning();
        if (scannedDevices.length > 0) {
          logger.info('Save bluetooth devices');
          await bluetoothService.saveDevices(scannedDevices);
        }
      }, 5000);
    } catch (error) {
      logger.error('Scanning failed:', error);
      setIsBluetoothOff(true);
      stopScanning();
    }
  };

  const stopScanning = () => {
    manager.stopDeviceScan();
    setIsScanning(false);
  };

  const handleLongPress = (device: BluetoothDevice) => {
    Alert.alert(
      'Delete Device',
      `Are you sure you want to delete ${device.name || 'this device'}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await bluetoothService.deleteDevice(device.id);
            } catch (error) {
              logger.error('Failed to delete device:', error);
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        style={styles.list}
        data={devicesList}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <DeviceItem device={item} onLongPress={handleLongPress} />
        )}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator
              size="large"
              color="#007bff"
              style={styles.loader}
            />
          ) : (
            <Text style={styles.emptyText}>No Bluetooth devices found</Text>
          )
        }
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.scanButton, isScanning && styles.buttonDisabled]}
          onPress={handleStartScanning}
          disabled={isScanning}>
          <Text style={styles.buttonText}>
            {isScanning ? 'Scanning...' : 'Scan Devices'}
          </Text>
        </TouchableOpacity>
      </View>

      <ConnectionStateModal
        visible={isBluetoothOff}
        onClose={() => setIsBluetoothOff(false)}
        type="bluetooth"
      />

      <BlockedPermissionView
        visible={showBlockedModal}
        permissionType={AppPermission.BLUETOOTH}
        icon="Bluetooth"
        onClose={() => setShowBlockedModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    flex: 1,
    padding: 16,
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  scanButton: {
    backgroundColor: '#007bff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 32,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 32,
  },
});

export default BluetoothScreen;

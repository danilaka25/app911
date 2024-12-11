import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import WifiManager from 'react-native-wifi-reborn';
import Geolocation from '@react-native-community/geolocation';
import {useSelector} from 'react-redux';
import {RootState} from '$src/store';
import {wifiService} from '$src/services';
import {WifiNetwork, RawWifiNetwork} from '$src/types';
import {
  NetworkItem,
  ConnectionStateModal,
  ConnectToWifiModal,
  BlockedPermissionView,
} from '$src/components';
import usePermissions from '$src/hooks/usePermissions';
import {AppPermission} from '$src/types/permissions';
import {logger} from '$src/utils/logger';

const WifiScreen = () => {
  const {networks, loading} = useSelector((state: RootState) => state.wifi);
  const networksList = Object.values(networks);

  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentSSID, setCurrentSSID] = useState('');
  const [isWifiOff, setIsWifiOff] = useState(false);
  const [showBlockedModal, setShowBlockedModal] = useState(false);

  const {granted: hasPermission, requestPermission} = usePermissions(
    AppPermission.LOCATION,
    () => setShowBlockedModal(true),
  );

  useEffect(() => {
    initializeFirestoreSubscription();
    return () => {
      wifiService.unsubscribeFromWifiNetworks();
    };
  }, []);

  const initializeFirestoreSubscription = async () => {
    try {
      logger.info('Initializing Firestore subscription...');
      await wifiService.subscribeToWifiNetworks();
      logger.info('Firestore subscription initialized successfully');
    } catch (error) {
      logger.error('Error initializing Firestore subscription:', error);
    }
  };

  const getCurrentPosition = async (): Promise<{
    latitude: number;
    longitude: number;
  }> => {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
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

  const handleScanWifi = async () => {
    if (hasPermission) {
      scanWifiNetworks();
    } else {
      const granted = await requestPermission();
      if (granted) {
        scanWifiNetworks();
      }
    }
  };

  const scanWifiNetworks = async () => {
    setIsScanning(true);
    try {
      const isWifiEnabled = await WifiManager.isEnabled();
      if (!isWifiEnabled) {
        setIsWifiOff(true);
        setIsScanning(false);
        return;
      }

      logger.info('Starting WiFi scan');

      const position = await getCurrentPosition();
      logger.info('Current position:', position);

      const rawNetworks = await WifiManager.loadWifiList();
      logger.info('Raw networks found:', rawNetworks.length);

      const parsedNetworks: WifiNetwork[] = rawNetworks.map(
        (network: RawWifiNetwork) => ({
          ...network,
          latitude: position.latitude,
          longitude: position.longitude,
          updatedAt: Date.now(),
        }),
      );
      logger.info('Saving networks to Firestore...');
      await wifiService.saveNetworks(parsedNetworks);
      logger.info('Networks saved successfully');
    } catch (error) {
      logger.error('WiFi scan failed:', error);
      Alert.alert('Scan Failed', 'Failed to scan WiFi networks');
    } finally {
      setIsScanning(false);
    }
  };

  const connectToWifi = async (ssid: string, pass: string = '') => {
    try {
      await WifiManager.connectToProtectedSSID(ssid, pass, false, true);
      Alert.alert('Success', `Connected to ${ssid}`);
    } catch (error) {
      logger.error('WiFi connection failed:', error);
      Alert.alert(
        'Connection Failed',
        'Please check the password and try again',
      );
    }
  };

  const showPasswordModal = (ssid: string) => {
    setCurrentSSID(ssid);
    setModalVisible(true);
  };

  const handleConnect = (password: string) => {
    connectToWifi(currentSSID, password);
    setModalVisible(false);
  };

  const handleLongPress = (network: WifiNetwork) => {
    Alert.alert(
      'Delete Network',
      `Are you sure you want to delete ${network.SSID || 'this network'}?`,
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
              await wifiService.deleteNetwork(network.BSSID);
            } catch (error) {
              logger.error('Failed to delete network:', error);
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
        data={networksList}
        keyExtractor={item => item.BSSID}
        renderItem={({item}) => (
          <NetworkItem
            network={item}
            onPress={showPasswordModal}
            onLongPress={handleLongPress}
          />
        )}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator
              size="large"
              color="#007bff"
              style={styles.loader}
            />
          ) : (
            <Text style={styles.emptyText}>No WiFi networks found</Text>
          )
        }
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.scanButton, isScanning && styles.buttonDisabled]}
          onPress={handleScanWifi}
          disabled={isScanning}>
          <Text style={styles.buttonText}>
            {isScanning ? 'Scanning...' : 'Scan Networks'}
          </Text>
        </TouchableOpacity>
      </View>

      <ConnectToWifiModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConnect={handleConnect}
        ssid={currentSSID}
      />

      <ConnectionStateModal
        visible={isWifiOff}
        onClose={() => setIsWifiOff(false)}
        type="wifi"
      />

      <BlockedPermissionView
        visible={showBlockedModal}
        permissionType={AppPermission.LOCATION}
        icon="map"
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

export default WifiScreen;

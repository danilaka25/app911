import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  Linking,
} from 'react-native';
import {wifiService, bluetoothService, barcodeService} from '$src/services';

const SettingsScreen = () => {
  const handleDeleteAll = async (
    type: 'wifi' | 'bluetooth' | 'barcode',
    deleteFunction: () => Promise<void>,
  ) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete all ${type} items?`,
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
              await deleteFunction();
              Alert.alert('Success', `All ${type} items deleted successfully`);
            } catch (error) {
              Alert.alert('Error', `Failed to delete ${type} items`);
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => handleDeleteAll('wifi', wifiService.deleteAllNetworks)}>
        <Text style={styles.buttonText}>Delete All WiFi Networks</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          handleDeleteAll('bluetooth', bluetoothService.deleteAllDevices)
        }>
        <Text style={styles.buttonText}>Delete All Bluetooth Devices</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          handleDeleteAll('barcode', barcodeService.deleteAllBarcodes)
        }>
        <Text style={styles.buttonText}>Delete All Barcodes</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.buttonBlue]}
        onPress={() => Linking.openSettings()}>
        <Text style={styles.buttonText}>Go to settings</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  button: {
    backgroundColor: '#ff4444',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  buttonBlue: {
    backgroundColor: 'blue',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default SettingsScreen;

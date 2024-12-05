import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {WifiNetwork} from '$src/types';

interface NetworkItemProps {
  network: WifiNetwork;
  onPress: (ssid: string) => void;
  onLongPress: (network: WifiNetwork) => void;
}

const NetworkItem: React.FC<NetworkItemProps> = ({
  network,
  onPress,
  onLongPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.networkItem}
      onPress={() => onPress(network.SSID)}
      onLongPress={() => onLongPress(network)}>
      <View style={styles.networkHeader}>
        <Text style={styles.networkName}>
          {network.SSID || 'Unknown Network'}
        </Text>
        <Text style={styles.signalStrength}>{network.level} dBm</Text>
      </View>

      <Text style={styles.networkDetails}>BSSID: {network.BSSID}</Text>
      <Text style={styles.networkDetails}>
        Frequency: {network.frequency} MHz
      </Text>

      <Text style={styles.securityInfo}>{network.capabilities}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  networkItem: {
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
  networkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  networkName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  signalStrength: {
    fontSize: 14,
    color: '#666',
  },
  networkDetails: {
    fontSize: 13,
    color: '#666',
    marginVertical: 2,
  },
  securityInfo: {
    fontSize: 12,
    color: '#007bff',
    marginTop: 4,
  },
});

export default NetworkItem;

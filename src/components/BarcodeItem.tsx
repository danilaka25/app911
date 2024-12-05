import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {BarcodeData} from '$src/types';

interface BarcodeItemProps {
  barcode: BarcodeData;
  onLongPress: (barcode: BarcodeData) => void;
}

const BarcodeItem: React.FC<BarcodeItemProps> = ({barcode, onLongPress}) => {
  return (
    <TouchableOpacity
      style={styles.item}
      onLongPress={() => onLongPress(barcode)}>
      <View style={styles.itemHeader}>
        <Icon name="qr-code" size={24} color="#007AFF" />
        <Text style={styles.itemTitle}>{barcode.format}</Text>
      </View>
      <Text style={styles.itemValue}>{barcode.rawValue}</Text>
      <Text style={styles.timestamp}>
        {new Date(barcode.updatedAt).toLocaleString()}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  item: {
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
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  itemValue: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});

export default BarcodeItem;

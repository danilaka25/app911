import React from 'react';
import {Modal, View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface ConnectionStateModalProps {
  visible: boolean;
  onClose: () => void;
  type: 'wifi' | 'bluetooth';
}

const ConnectionStateModal: React.FC<ConnectionStateModalProps> = ({
  visible,
  onClose,
  type,
}) => {
  const getIcon = () => {
    return type === 'wifi' ? 'wifi-off' : 'bluetooth-disabled';
  };

  const getTitle = () => {
    return `${type === 'wifi' ? 'Wi-Fi' : 'Bluetooth'} is Off`;
  };

  const getMessage = () => {
    return `Please enable ${
      type === 'wifi' ? 'Wi-Fi' : 'Bluetooth'
    } to scan for ${type === 'wifi' ? 'networks' : 'devices'}`;
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Icon name={getIcon()} size={48} color="#007AFF" />
          <Text style={styles.modalTitle}>{getTitle()}</Text>
          <Text style={styles.modalText}>{getMessage()}</Text>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ConnectionStateModal;

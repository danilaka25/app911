import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Linking} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {AppPermission} from '$src/types/permissions';

interface BlockedPermissionViewProps {
  visible: boolean;
  permissionType: AppPermission;
  icon: string;
  onClose: () => void;
}

const getPermissionName = (type: AppPermission): string => {
  switch (type) {
    case AppPermission.CAMERA:
      return 'Camera';
    case AppPermission.BLUETOOTH:
      return 'Bluetooth';
    case AppPermission.LOCATION:
      return 'Location';
    default:
      return type;
  }
};

const BlockedPermissionView: React.FC<BlockedPermissionViewProps> = ({
  visible,
  permissionType,
  icon,
  onClose,
}) => {
  if (!visible) {
    return null;
  }

  const permissionName = getPermissionName(permissionType);

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <Icon name={icon} size={48} color="#666" />
        <Text style={styles.title}>Permission Required</Text>
        <Text style={styles.description}>
          {permissionName} permission is blocked. Please enable it in settings
          to use this feature.
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.settingsButton]}
            onPress={Linking.openSettings}>
            <Text style={styles.settingsButtonText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '80%',
    maxWidth: 400,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#f2f2f2',
  },
  settingsButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  settingsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default BlockedPermissionView;

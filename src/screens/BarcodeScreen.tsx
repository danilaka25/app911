import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  Camera,
  useCameraDevices,
  useCodeScanner,
  Code,
} from 'react-native-vision-camera';
import {useSelector} from 'react-redux';
import {RootState} from '$src/store/store';
import {barcodeService} from '$src/services';
import {BarcodeData} from '$src/types';
import {BarcodeItem} from '$src/components';
import {usePermissions} from '$src/hooks';
import {AppPermission} from '$src/types/permissions';
import {BlockedPermissionView} from '$src/components';

const BarcodeScreen: React.FC = () => {
  const {codes, loading} = useSelector((state: RootState) => state.barcode);
  const barcodesList = Object.values(codes);
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const {granted: hasPermission, requestPermission} = usePermissions(
    AppPermission.CAMERA,
    () => setShowBlockedModal(true),
  );
  const [isCameraOpened, setIsCameraOpened] = useState<boolean>(false);
  const devices = useCameraDevices();
  const device = devices.find(d => d.position === 'back');

  useEffect(() => {
    initializeFirestoreSubscription();
    return () => {
      barcodeService.unsubscribeFromBarcodes();
    };
  }, []);

  const initializeFirestoreSubscription = async () => {
    try {
      await barcodeService.subscribeToBarcodes();
    } catch (error) {
      console.error('Error initializing Firestore subscription:', error);
    }
  };

  const handleCodeScanned = async (barcodes: Code[]) => {
    setIsCameraOpened(false);

    const newBarcodes: BarcodeData[] = barcodes.map(item => ({
      id: Date.now().toString(),
      rawValue: item.value || '',
      format: item.type,
      updatedAt: Date.now(),
    }));

    try {
      await barcodeService.saveBarcodes(newBarcodes);
    } catch (error) {
      console.error('Failed to save barcodes:', error);
    }
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'upc-a'],
    onCodeScanned: handleCodeScanned,
  });

  const handleLongPress = (barcode: BarcodeData) => {
    Alert.alert(
      'Delete Barcode',
      `Are you sure you want to delete this ${barcode.format} code?`,
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
              await barcodeService.deleteBarcode(barcode.id);
            } catch (error) {
              console.error('Failed to delete barcode:', error);
            }
          },
        },
      ],
    );
  };

  const handleScanPress = async () => {
    if (!hasPermission) {
      const granted = await requestPermission();
      if (granted) {
        setIsCameraOpened(true);
      }
    } else {
      setIsCameraOpened(!isCameraOpened);
    }
  };

  if (!device) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isCameraOpened ? (
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          codeScanner={codeScanner}
        />
      ) : (
        <FlatList
          style={styles.list}
          data={barcodesList}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <BarcodeItem barcode={item} onLongPress={handleLongPress} />
          )}
          ListEmptyComponent={
            loading ? (
              <ActivityIndicator
                size="large"
                color="#007AFF"
                style={styles.loader}
              />
            ) : (
              <Text style={styles.emptyText}>No barcodes scanned yet</Text>
            )
          }
        />
      )}

      <TouchableOpacity style={styles.scanButton} onPress={handleScanPress}>
        <Text style={styles.buttonText}>
          {isCameraOpened ? 'View Codes' : 'Scan Code'}
        </Text>
      </TouchableOpacity>

      <BlockedPermissionView
        visible={showBlockedModal}
        permissionType={AppPermission.CAMERA}
        icon="camera"
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  list: {
    flex: 1,
    padding: 16,
    marginBottom: 100,
  },
  scanButton: {
    position: 'absolute',
    bottom: 32,
    left: 16,
    right: 16,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
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

export default BarcodeScreen;

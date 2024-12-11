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
import {logger} from '$src/utils/logger';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const BarcodeScreen: React.FC = () => {
  const {codes, loading} = useSelector((state: RootState) => state.barcode);
  const barcodesList = Object.values(codes);
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const {granted: hasPermission, requestPermission} = usePermissions(
    AppPermission.CAMERA,
    () => setShowBlockedModal(true),
  );
  const [isCameraOpened, setIsCameraOpened] = useState<boolean>(false);
  const [showAlreadyExistingCode, setShowAlreadyExistingCode] = useState(false);

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
      logger.error('Error initializing Firestore subscription:', error);
    }
  };

  const handleCodeScanned = (() => {
    let lastScanTimestamp = 0;

    return async (barcodes: Code[]) => {
      const now = Date.now();

      // Prevent re-triggering if less than 3 seconds have passed
      if (now - lastScanTimestamp < 3000) {
        return;
      }

      // Update the timestamp for the next scan
      lastScanTimestamp = now;

      const newBarcodes: BarcodeData[] = barcodes.map(item => ({
        id: item.value || '',
        rawValue: item.value || '',
        format: item.type,
        updatedAt: Date.now(),
      }));

      const existingCodes = barcodesList.filter(existingCode =>
        newBarcodes.some(newCode => newCode.rawValue === existingCode.rawValue),
      );

      logger.info('Barcode scanned:', {barcodes});

      if (existingCodes.length > 0) {
        await wait(1000);
        setShowAlreadyExistingCode(true);
        await wait(3000);
        setShowAlreadyExistingCode(false);
      } else {
        setShowAlreadyExistingCode(false);
        try {
          await barcodeService.saveBarcodes(newBarcodes);
        } catch (error) {
          logger.error('Failed to save barcode:', error);
        } finally {
          setIsCameraOpened(false);
          setShowAlreadyExistingCode(false);
        }
      }
    };
  })();

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'upc-a', 'code-128'],
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
              logger.error('Failed to delete barcode:', error);
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
        <>
          <Camera
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={isCameraOpened}
            codeScanner={codeScanner}
            photoQualityBalance="speed"
          />
          {showAlreadyExistingCode && (
            <View style={styles.overlay}>
              <Text style={styles.overlayText}>Code allready in database</Text>
            </View>
          )}
        </>
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default BarcodeScreen;

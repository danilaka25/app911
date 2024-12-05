import firestore from '@react-native-firebase/firestore';
import {store} from '$src/store/store';
import {setDevices, setDevicesLoading, setDevicesError} from '$src/store';
import {BluetoothDevice} from '$src/types/bluetooth';
import {userService} from '$src/services/userService';

const COLLECTION_NAME = 'savedData';

const convertFirestoreData = (doc: any): BluetoothDevice => {
  const data = doc.data();
  return {
    ...data,
    id: doc.id,
    updatedAt: data.updatedAt ? data.updatedAt.toMillis() : Date.now(),
  };
};

export const bluetoothService = {
  unsubscribe: null as (() => void) | null,

  async subscribeToDevices() {
    store.dispatch(setDevicesLoading(true));

    try {
      const userId = await userService.getUserId();
      console.log('Subscribing to Bluetooth devices for user:', userId);

      this.unsubscribe = firestore()
        .collection(COLLECTION_NAME)
        .doc(userId)
        .collection('devices')
        .onSnapshot(
          snapshot => {
            console.log('Firestore snapshot received:', snapshot.size, 'documents');
            const devices: Record<string, BluetoothDevice> = {};
            snapshot.forEach(doc => {
              devices[doc.id] = convertFirestoreData(doc);
            });
            console.log('Processed devices:', Object.keys(devices).length);
            store.dispatch(setDevices(devices));
            store.dispatch(setDevicesLoading(false));
          },
          error => {
            console.error('Firestore subscription error:', error);
            store.dispatch(setDevicesError(error.message));
            store.dispatch(setDevicesLoading(false));
          },
        );
    } catch (error) {
      console.error('Error setting up Firestore subscription:', error);
      store.dispatch(setDevicesError('Failed to connect to database'));
      store.dispatch(setDevicesLoading(false));
    }
  },

  async saveDevices(devices: BluetoothDevice[]) {
    try {
      const userId = await userService.getUserId();
      console.log('Saving devices for user:', userId);

      const batch = firestore().batch();
      const userDevicesRef = firestore()
        .collection(COLLECTION_NAME)
        .doc(userId)
        .collection('devices');

      devices.forEach(device => {
        if (!device.id) {
          console.warn('Device missing ID:', device);
          return;
        }

        const deviceRef = userDevicesRef.doc(device.id);
        const data = {
          ...device,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        };

        batch.set(deviceRef, data, {merge: true});
      });

      console.log('Committing batch write...');
      await batch.commit();
      console.log('Devices saved successfully');
    } catch (error) {
      console.error('Error saving devices:', error);
      store.dispatch(setDevicesError('Failed to save devices'));
      throw error;
    }
  },

  unsubscribeFromDevices() {
    if (this.unsubscribe) {
      console.log('Unsubscribing from Firestore');
      this.unsubscribe();
      this.unsubscribe = null;
    }
  },


  async deleteDevice(bssid: string) {
    try {
      const userId = await userService.getUserId();
      await firestore()
        .collection(COLLECTION_NAME)
        .doc(userId)
        .collection('devices')
        .doc(bssid)
        .delete();
    } catch (error) {
      console.error('Error deleting network:', error);
      store.dispatch(setDevicesError('Failed to delete network'));
    }
  },

  async deleteAllDevices() {
    try {
      const userId = await userService.getUserId();
      const snapshot = await firestore()
        .collection(COLLECTION_NAME)
        .doc(userId)
        .collection('devices')
        .get();

      const batch = firestore().batch();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
    } catch (error) {
      console.error('Error deleting all networks:', error);
      store.dispatch(setDevicesError('Failed to delete all networks'));
    }
  }
};

 

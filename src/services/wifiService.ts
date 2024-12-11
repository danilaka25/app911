import firestore from '@react-native-firebase/firestore';
import {store} from '$src/store/store';
import {setNetworks, setNetworksLoading, setNetworksError} from '$src/store';
import {WifiNetwork} from '$src/types/wifi';
import {userService} from '$src/services/userService';
import {logger} from '$src/utils/logger';

const COLLECTION_NAME = 'savedData';

const convertFirestoreData = (doc: any): WifiNetwork => {
  const data = doc.data();
  return {
    ...data,
    BSSID: doc.id,
    updatedAt: data.updatedAt ? data.updatedAt.toMillis() : Date.now(),
  };
};

export const wifiService = {
  unsubscribe: null as (() => void) | null,

  async subscribeToWifiNetworks() {
    store.dispatch(setNetworksLoading(true));

    try {
      const userId = await userService.getUserId();
      logger.info('Starting WiFi scan');

      this.unsubscribe = firestore()
        .collection(COLLECTION_NAME)
        .doc(userId)
        .collection('networks')
        .onSnapshot(
          snapshot => {
            logger.info('Networks found:', {count: snapshot.size});
            const networks: Record<string, WifiNetwork> = {};
            snapshot.forEach(doc => {
              networks[doc.id] = convertFirestoreData(doc);
            });
            logger.info('Processed networks:', Object.keys(networks).length);
            store.dispatch(setNetworks(networks));
            store.dispatch(setNetworksLoading(false));
          },
          error => {
            logger.error('WiFi scan failed:', error);
            store.dispatch(setNetworksError(error.message));
            store.dispatch(setNetworksLoading(false));
          },
        );
    } catch (error) {
      logger.error('Error setting up Firestore subscription:', error);
      store.dispatch(setNetworksError('Failed to connect to database'));
      store.dispatch(setNetworksLoading(false));
    }
  },

  async saveNetworks(networks: WifiNetwork[]) {
    try {
      const userId = await userService.getUserId();
      logger.info('Starting WiFi scan');

      const batch = firestore().batch();
      const userNetworksRef = firestore()
        .collection(COLLECTION_NAME)
        .doc(userId)
        .collection('networks');

      networks.forEach(network => {
        if (!network.BSSID) {
          logger.warn('Network missing BSSID:', network);
          return;
        }

        const networkRef = userNetworksRef.doc(network.BSSID);
        const data = {
          ...network,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        };

        batch.set(networkRef, data, {merge: true});
      });

      logger.info('Committing batch write...');
      await batch.commit();
      logger.info('Networks saved successfully');
    } catch (error) {
      logger.error('Error saving networks:', error);
      store.dispatch(setNetworksError('Failed to save networks'));
      throw error;
    }
  },

  unsubscribeFromWifiNetworks() {
    if (this.unsubscribe) {
      logger.info('Unsubscribing from Firestore');
      this.unsubscribe();
      this.unsubscribe = null;
    }
  },

  async deleteNetwork(bssid: string) {
    try {
      const userId = await userService.getUserId();
      await firestore()
        .collection(COLLECTION_NAME)
        .doc(userId)
        .collection('networks')
        .doc(bssid)
        .delete();
    } catch (error) {
      logger.error('Error deleting network:', error);
      store.dispatch(setNetworksError('Failed to delete network'));
    }
  },

  async deleteAllNetworks() {
    try {
      const userId = await userService.getUserId();
      const snapshot = await firestore()
        .collection(COLLECTION_NAME)
        .doc(userId)
        .collection('networks')
        .get();

      const batch = firestore().batch();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
    } catch (error) {
      logger.error('Error deleting all networks:', error);
      store.dispatch(setNetworksError('Failed to delete all networks'));
    }
  },
};

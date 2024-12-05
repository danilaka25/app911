import firestore from '@react-native-firebase/firestore';
import {store} from '$src/store/store';
import {setCodes, setBarcodeLoading, setBarcodeError} from '$src/store';
import {BarcodeData} from '$src/types';
import {userService} from '$src/services'

const COLLECTION_NAME = 'savedData';

const convertFirestoreData = (doc: any): BarcodeData => {
  const data = doc.data();
  return {
    ...data,
    id: doc.id,
    updatedAt: data.updatedAt ? data.updatedAt.toMillis() : Date.now(),
  };
};

export const barcodeService = {
  unsubscribe: null as (() => void) | null,

  async subscribeToBarcodes() {
    store.dispatch(setBarcodeLoading(true));

    try {
      const userId = await userService.getUserId();
      console.log('Subscribing to barcodes for user:', userId);

      this.unsubscribe = firestore()
        .collection(COLLECTION_NAME)
        .doc(userId)
        .collection('barcodes')
        .onSnapshot(
          snapshot => {
            console.log('Firestore snapshot received:', snapshot.size, 'documents');
            const codes: Record<string, BarcodeData> = {}; 
            snapshot.forEach(doc => {
              codes[doc.id] = convertFirestoreData(doc);
            });
            console.log('Processed barcodes:', Object.keys(codes).length);
            store.dispatch(setCodes(codes));
            store.dispatch(setBarcodeLoading(false));
          },
          error => {
            console.error('Firestore subscription error:', error);
            store.dispatch(setBarcodeError(error.message));
            store.dispatch(setBarcodeLoading(false));
          },
        );
    } catch (error) {
      console.error('Error setting up Firestore subscription:', error);
      store.dispatch(setBarcodeError('Failed to connect to database'));
      store.dispatch(setBarcodeLoading(false));
    }
  },

  async saveBarcodes(codes: BarcodeData[]) {
    try {
      const userId = await userService.getUserId();
      console.log('Saving barcodes for user:', userId);

      const batch = firestore().batch();
      const userBarcodesRef = firestore()
        .collection(COLLECTION_NAME)
        .doc(userId)
        .collection('barcodes');

      codes.forEach(code => {
        if (!code.id) {
          console.warn('Barcode missing ID:', code);
          return;
        }

        const barcodeRef = userBarcodesRef.doc(code.id);
        const data = {
          ...code,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        };

        batch.set(barcodeRef, data, {merge: true});
      });

      console.log('Committing batch write...');
      await batch.commit();
      console.log('Barcodes saved successfully');
    } catch (error) {
      console.error('Error saving barcodes:', error);
      store.dispatch(setBarcodeError('Failed to save barcodes'));
      throw error;
    }
  },

  unsubscribeFromBarcodes() {
    if (this.unsubscribe) {
      console.log('Unsubscribing from Firestore');
      this.unsubscribe();
      this.unsubscribe = null;
    }
  },

  async deleteBarcode(barcodeId: string) {
    try {
      const userId = await userService.getUserId();
      await firestore()
        .collection(COLLECTION_NAME)
        .doc(userId)
        .collection('barcodes')
        .doc(barcodeId)
        .delete();
    } catch (error) {
      console.error('Error deleting barcode:', error);
      store.dispatch(setBarcodeError('Failed to delete barcode'));
    }
  },

  async deleteAllBarcodes() {
    try {
      const userId = await userService.getUserId();
      const snapshot = await firestore()
        .collection(COLLECTION_NAME)
        .doc(userId)
        .collection('barcodes')
        .get();

      const batch = firestore().batch();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
    } catch (error) {
      console.error('Error deleting all barcodes:', error);
      store.dispatch(setBarcodeError('Failed to delete all barcodes'));
    }
  },
};
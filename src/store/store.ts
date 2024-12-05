import {configureStore} from '@reduxjs/toolkit';
import wifiReducer from '$src/store/wifiSlice';
import bluetoothReducer from '$src/store/bluetoothSlice';
import barcodeReducer from '$src/store/barcodeSlice';

export const store = configureStore({
  reducer: {
    wifi: wifiReducer,
    bluetooth: bluetoothReducer,
    barcode: barcodeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

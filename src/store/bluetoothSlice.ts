import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {BluetoothDevice} from '$src/types/bluetooth';

interface BluetoothState {
  devices: Record<string, BluetoothDevice>;
  loading: boolean;
  error: string | null;
}

const initialState: BluetoothState = {
  devices: {},
  loading: false,
  error: null,
};

const bluetoothSlice = createSlice({
  name: 'bluetooth',
  initialState,
  reducers: {
    setDevices: (state, action: PayloadAction<Record<string, BluetoothDevice>>) => {
      state.devices = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {setDevices, setLoading, setError} = bluetoothSlice.actions;
export default bluetoothSlice.reducer;

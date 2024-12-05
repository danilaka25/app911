import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {WifiNetwork} from '$src/types/wifi';

interface WifiState {
  networks: Record<string, WifiNetwork>;
  loading: boolean;
  error: string | null;
}

const initialState: WifiState = {
  networks: {},
  loading: false,
  error: null,
};

const wifiSlice = createSlice({
  name: 'wifi',
  initialState,
  reducers: {
    setNetworks: (state, action: PayloadAction<Record<string, WifiNetwork>>) => {
      state.networks = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {setNetworks, setLoading, setError} = wifiSlice.actions;
export default wifiSlice.reducer;

import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {BarcodeData} from '$src/types/barcode';

interface BarcodeState {
  codes: Record<string, BarcodeData>;
  loading: boolean;
  error: string | null;
}

const initialState: BarcodeState = {
  codes: {},
  loading: false,
  error: null,
};

const barcodeSlice = createSlice({
  name: 'barcode',
  initialState,
  reducers: {
    setCodes: (state, action: PayloadAction<Record<string, BarcodeData>>) => {
      state.codes = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {setCodes, setLoading, setError} = barcodeSlice.actions;
export default barcodeSlice.reducer; 
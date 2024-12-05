import {store} from '$src/store/store';
import {setNetworks, setLoading as setNetworksLoading, setError as setNetworksError} from '$src/store/wifiSlice';
import {setDevices, setLoading as setDevicesLoading, setError as setDevicesError} from '$src/store/bluetoothSlice';
import {setCodes, setLoading as setBarcodeLoading, setError as setBarcodeError} from '$src/store/barcodeSlice';
import type {RootState, AppDispatch} from '$src/store/store';

export {
  store,
  setNetworks,
  setNetworksLoading,
  setNetworksError,
  setDevices,
  setDevicesLoading,
  setDevicesError,
  setCodes,
  setBarcodeLoading,
  setBarcodeError,
};

export type {RootState, AppDispatch};

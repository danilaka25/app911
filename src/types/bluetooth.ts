export interface BluetoothDevice {
  id: string;
  name: string | null;
  rssi: number;
  serviceUUIDs: string[] | null;  
  isConnectable: boolean | null;  
  latitude: number;
  longitude: number;
  updatedAt: number;
}

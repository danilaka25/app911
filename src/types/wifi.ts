export interface RawWifiNetwork {
  SSID: string;
  BSSID: string;
  capabilities: string;
  frequency: number;
  level: number;
  timestamp: number;
}

export interface WifiNetwork extends RawWifiNetwork {
  latitude: number;
  longitude: number;
  updatedAt: number;
}

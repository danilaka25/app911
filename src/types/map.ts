export interface Location {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  type: 'current' | 'wifi' | 'bluetooth';
  icon: string;
  details?: string;
}

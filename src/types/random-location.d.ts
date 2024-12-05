declare module 'random-location' {
    export interface Location {
      latitude: number;
      longitude: number;
    }

    export function randomCirclePoint(
      center: Location,
      radius: number,
    ): Location;

    export function distance(
      location1: Location,
      location2: Location,
    ): number;
}

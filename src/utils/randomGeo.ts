import RandomLocation from 'random-location';

const CENTER_POINT = {
    // Kiev
    latitude: 50.43697235800866,
    longitude: 30.53963517451611,
};

const RADIUS = 15000; // 15 km

export const randomGeo = () => RandomLocation.randomCirclePoint(
    CENTER_POINT,
    RADIUS,
);

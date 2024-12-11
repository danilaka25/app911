import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import {useSelector} from 'react-redux';
import {RootState} from '$src/store';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {AppPermission} from '$src/types/permissions';
import {BlockedPermissionView, LocationItem} from '$src/components';
import {Location} from '$src/types';
import {getCurrentLocation, getLocations} from '$src/utils';
import usePermissions from '$src/hooks/usePermissions';
import {logger} from '$src/utils/logger';

const {width} = Dimensions.get('window');

const MapScreen = () => {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const {granted: hasPermission, requestPermission} = usePermissions(
    AppPermission.LOCATION,
    () => setShowBlockedModal(true),
  );
  const mapRef = useRef<MapView | null>(null);

  const wifiNetworks = useSelector((state: RootState) => state.wifi.networks);
  const bluetoothDevices = useSelector(
    (state: RootState) => state.bluetooth.devices,
  );

  useEffect(() => {
    const checkAndGetLocation = async () => {
      if (hasPermission) {
        handleGetCurrentLocation();
      } else {
        const granted = await requestPermission();
        if (granted) {
          handleGetCurrentLocation();
        }
      }
    };

    checkAndGetLocation();
  }, []);

  const handleGetCurrentLocation = async () => {
    setLoading(true);
    try {
      const location = await getCurrentLocation();
      setCurrentLocation(location);
    } catch (error) {
      logger.error('Failed to get location:', error);
    } finally {
      setLoading(false);
    }
  };

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const locations = getLocations(
      currentLocation,
      wifiNetworks,
      bluetoothDevices,
    );
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    const location = locations[index];

    if (location && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        },
        1000,
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const locations = getLocations(
    currentLocation,
    wifiNetworks,
    bluetoothDevices,
  );

  return (
    <View style={styles.container}>
      {currentLocation && (
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          }}
          showsUserLocation>
          {locations.map(location => (
            <Marker
              key={location.id}
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title={location.title}
              description={location.description}>
              <Icon
                name={location.icon}
                size={24}
                color={
                  location.type === 'wifi'
                    ? '#4CAF50'
                    : location.type === 'bluetooth'
                    ? '#2196F3'
                    : '#007AFF'
                }
              />
            </Marker>
          ))}
        </MapView>
      )}

      <Animated.FlatList
        data={locations}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={width}
        decelerationRate="fast"
        pagingEnabled
        style={styles.locationsList}
        renderItem={({item}) => <LocationItem location={item} />}
        onMomentumScrollEnd={onScrollEnd}
      />
      <BlockedPermissionView
        visible={showBlockedModal}
        permissionType={AppPermission.LOCATION}
        icon="map"
        onClose={() => setShowBlockedModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationsList: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
  },
});

export default MapScreen;

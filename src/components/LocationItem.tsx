import React from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Location} from '$src/types';

const {width} = Dimensions.get('window');

interface LocationItemProps {
  location: Location;
}

const LocationItem: React.FC<LocationItemProps> = ({location}) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Icon name={location.icon} size={24} color="#007AFF" />
        <Text style={styles.cardTitle}>{location.title}</Text>
      </View>
      <Text style={styles.cardDescription}>{location.description}</Text>
      {location.details && (
        <Text style={styles.cardDetails}>{location.details}</Text>
      )}
      <Text style={styles.coordinates}>
        {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: width * 0.8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: width * 0.1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#333',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  cardDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  coordinates: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});

export default LocationItem;

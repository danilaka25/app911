import React from 'react';
import {StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import {RootStackParamList} from '$src/types';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SettingsButton = () => {
  const navigation = useNavigation<NavigationProp>();
  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('Settings')}
      style={styles.icon}>
      <Icon name="settings" size={24} color="#007AFF" />
    </TouchableOpacity>
  );
};

export default SettingsButton;

const styles = StyleSheet.create({
  icon: {
    paddingRight: 16,
  },
});

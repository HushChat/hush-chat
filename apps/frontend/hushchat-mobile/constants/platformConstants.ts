import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const PLATFORM_NAMES = {
  WEB: 'web',
  IOS: 'ios',
  ANDROID: 'android',
  EXPO_GO: 'expo-go',
  EXPO_STANDALONE: 'expo-standalone',
  EXPO_DEV_CLIENT: 'expo-dev-client',
};

export const PLATFORM = {
  IS_WEB: Platform.OS === PLATFORM_NAMES.WEB,
  IS_IOS: Platform.OS === PLATFORM_NAMES.IOS,
  IS_ANDROID: Platform.OS === PLATFORM_NAMES.ANDROID,
  IS_EXPO_GO: Constants.appOwnership === 'expo',
  PLATFORM_NAME: Platform.OS,
};

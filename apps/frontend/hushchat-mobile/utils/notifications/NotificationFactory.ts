import { Platform } from 'react-native';
import { INotificationService } from './INotificationService';
import { ExpoNotificationService } from './ExpoNotificationService';
import { FcmWebNotificationService } from './FcmWebNotificationService';

export const NotificationFactory = {
  getHandler(): INotificationService {
    if (Platform.OS === 'web') {
      return FcmWebNotificationService;
    } else {
      return ExpoNotificationService;
    }
  },
};

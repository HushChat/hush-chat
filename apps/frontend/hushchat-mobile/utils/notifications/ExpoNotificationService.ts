import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { INotificationService } from "./INotificationService";

export const ExpoNotificationService: INotificationService = {
  async registerDevice() {
    if (!Device.isDevice) return null;
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") return null;
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    return token;
  },

  onMessage(callback) {
    Notifications.addNotificationReceivedListener((notification) => {
      callback(notification.request.content);
    });
  },

  showLocalNotification(title, body) {
    Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: null,
    });
  },
};

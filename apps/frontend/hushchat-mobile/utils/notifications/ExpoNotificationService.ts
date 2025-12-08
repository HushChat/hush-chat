import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { INotificationService } from "./INotificationService";
import Constants from "expo-constants";
import { logError } from "@/utils/logger";

export const ExpoNotificationService: INotificationService = {
  async registerDevice() {
    if (!Device.isDevice) return null;
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") return null;
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

    if (!projectId) {
      logError("EAS Project ID is not defined in app config.");
      return null;
    }

    return (
      await Notifications.getExpoPushTokenAsync({
        projectId,
      })
    ).data;
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

import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { INotificationService } from "./INotificationService";
import { router } from "expo-router";
import { CHAT_VIEW_PATH } from "@/constants/routes";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: false,
    shouldShowList: false,
  }),
});

export const ExpoNotificationService: INotificationService = {
  async registerDevice() {
    if (!Device.isDevice) return null;
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") return null;
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      const conversationId = data?.conversationId as string;
      const messageId = data?.messageId as string;

      if (conversationId) {
        router.push({
          pathname: CHAT_VIEW_PATH,
          params: {
            conversationId: conversationId,
            ...(messageId && { messageId: messageId }),
          },
        });
      }
    });
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

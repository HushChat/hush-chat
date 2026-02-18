import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { INotificationService } from "./INotificationService";
import Constants from "expo-constants";
import { logError } from "@/utils/logger";
import { router } from "expo-router";
import { CHAT_VIEW_PATH } from "@/constants/routes";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

let responseListenerRegistered = false;

function registerNotificationResponseListener() {
  if (responseListenerRegistered) return;
  responseListenerRegistered = true;

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
}

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

    registerNotificationResponseListener();

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

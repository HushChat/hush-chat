import { initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported, Messaging, onMessage } from "firebase/messaging";
import { INotificationService } from "./INotificationService";
import { BuildConstantKeys, getBuildConstant } from "@/constants/build-constants";
import { logError } from "@/utils/logger";

let messaging: Messaging | null = null;

const firebaseConfig = {
  apiKey: getBuildConstant(BuildConstantKeys.FIREBASE_API_KEY),
  authDomain: getBuildConstant(BuildConstantKeys.FIREBASE_AUTH_DOMAIN),
  projectId: getBuildConstant(BuildConstantKeys.FIREBASE_PROJECT_ID),
  storageBucket: getBuildConstant(BuildConstantKeys.FIREBASE_STORAGE_BUCKET),
  messagingSenderId: getBuildConstant(BuildConstantKeys.FIREBASE_MESSAGING_SENDER_ID),
  appId: getBuildConstant(BuildConstantKeys.FIREBASE_APP_ID),
  measurementId: getBuildConstant(BuildConstantKeys.FIREBASE_MEASUREMENT_ID),
};

export const FcmWebNotificationService: INotificationService = {
  async registerDevice() {
    const supported = await isSupported();
    if (!supported) {
      logError("[FCM] Firebase messaging not supported in this browser/environment.");
      return null;
    }

    const app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;
    return await getToken(messaging, {
      vapidKey: getBuildConstant(BuildConstantKeys.FIREBASE_VAPID),
    });
  },

  onMessage(callback) {
    if (!messaging) {
      console.warn("[FCM] Messaging not initialized; skipping onMessage listener.");
      return;
    }

    onMessage(messaging, (payload) => {
      console.log("[FCM] Foreground message received:", payload);

      const title = payload.notification?.title || "New Message";
      const body = payload.notification?.body || "";
      const conversationId = payload.data?.conversationId;
      const messageId = payload.data?.messageId;

      if (Notification.permission === "granted") {
        const notification = new Notification(title, {
          body: body,
          icon: "/favicon.png",
          badge: "/favicon.png",
          tag: `conversation-${conversationId}`,
          data: {
            conversationId: conversationId,
            messageId: messageId,
            url: conversationId
              ? `/conversation-threads?conversationId=${conversationId}${messageId ? `&messageId=${messageId}` : ""}`
              : "/",
          },
        });

        notification.onclick = (event) => {
          event.preventDefault();
          const notificationData = (event.target as Notification).data;
          const url = notificationData?.url || "/";
          window.focus();
          window.location.href = url;
          notification.close();
        };
      }

      callback(payload.notification);
    });
  },

  showLocalNotification(title, body) {
    if (Notification.permission === "granted") {
      new Notification(title, { body });
    } else {
      logError("[FCM] Messaging not initialized; skipping onMessage listener.");
    }
  },
};

import { initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported, Messaging, onMessage } from "firebase/messaging";
import { INotificationService } from "./INotificationService";
import { BuildConstantKeys, getBuildConstant } from "@/constants/build-constants";
import { logError, logWarn } from "@/utils/logger";

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
      logWarn("[FCM] Messaging not initialized; skipping onMessage listener.");
      return;
    }

    onMessage(messaging, (payload) => {
      const title = payload.data?.title || "New Message";
      const body = payload.data?.body || "";
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
            url: conversationId ? `/conversations/${conversationId}` : "/",
          },
        });

        notification.onclick = (event) => {
          event.preventDefault();
          const notificationData = (event.target as Notification).data;
          window.location.href = notificationData?.url || "/";
          notification.close();
        };
      }

      callback({ title, body });
    });
  },
};

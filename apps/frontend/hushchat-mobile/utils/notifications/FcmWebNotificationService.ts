/**
 * Copyright (c) 2025, HushChat (https://gethush.chat)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  isSupported,
  Messaging,
  onMessage,
} from "firebase/messaging";
import { INotificationService } from "./INotificationService";
import {
  BuildConstantKeys,
  getBuildConstant,
} from "@/constants/build-constants";

let messaging: Messaging | null = null;

const firebaseConfig = {
  apiKey: getBuildConstant(BuildConstantKeys.FIREBASE_API_KEY),
  authDomain: getBuildConstant(BuildConstantKeys.FIREBASE_AUTH_DOMAIN),
  projectId: getBuildConstant(BuildConstantKeys.FIREBASE_PROJECT_ID),
  storageBucket: getBuildConstant(BuildConstantKeys.FIREBASE_STORAGE_BUCKET),
  messagingSenderId: getBuildConstant(
    BuildConstantKeys.FIREBASE_MESSAGING_SENDER_ID,
  ),
  appId: getBuildConstant(BuildConstantKeys.FIREBASE_APP_ID),
  measurementId: getBuildConstant(BuildConstantKeys.FIREBASE_MEASUREMENT_ID),
};

export const FcmWebNotificationService: INotificationService = {
  async registerDevice() {
    const supported = await isSupported();
    if (!supported) {
      console.warn(
        "[FCM] Firebase messaging not supported in this browser/environment.",
      );
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
      console.warn(
        "[FCM] Messaging not initialized; skipping onMessage listener.",
      );
      return;
    }

    onMessage(messaging, (payload) => {
      callback(payload.notification);
    });
  },

  showLocalNotification(title, body) {
    if (Notification.permission === "granted") {
      new Notification(title, { body });
    } else {
      console.warn(
        "[FCM] Cannot show local notification — permission not granted.",
      );
    }
  },
};

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

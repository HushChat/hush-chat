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

import { Platform } from "react-native";
import Constants from "expo-constants";

export const PLATFORM_NAMES = {
  WEB: "web",
  IOS: "ios",
  ANDROID: "android",
  EXPO_GO: "expo-go",
  EXPO_STANDALONE: "expo-standalone",
  EXPO_DEV_CLIENT: "expo-dev-client",
};

export const PLATFORM = {
  IS_WEB: Platform.OS === PLATFORM_NAMES.WEB,
  IS_IOS: Platform.OS === PLATFORM_NAMES.IOS,
  IS_ANDROID: Platform.OS === PLATFORM_NAMES.ANDROID,
  IS_EXPO_GO: Constants.appOwnership === "expo",
  PLATFORM_NAME: Platform.OS,
};

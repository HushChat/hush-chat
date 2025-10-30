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

export const BuildConstantKeys = {
  API_HOST: "EXPO_PUBLIC_API_HOST",
  API_PORT: "EXPO_PUBLIC_API_PORT",
  API_PROTOCOL: "EXPO_PUBLIC_API_PROTOCOL",
  WS_PROTOCOL: "EXPO_PUBLIC_WS_PROTOCOL",
  TENANT: "EXPO_PUBLIC_TENANT",
  FIREBASE_PROJECT_ID: "EXPO_PUBLIC_FIREBASE_PROJECT_ID",
  FIREBASE_APP_ID: "EXPO_PUBLIC_FIREBASE_APP_ID",
  FIREBASE_AUTH_DOMAIN: "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN",
  FIREBASE_STORAGE_BUCKET: "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET",
  FIREBASE_API_KEY: "EXPO_PUBLIC_FIREBASE_API_KEY",
  FIREBASE_MESSAGING_SENDER_ID: "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  FIREBASE_MEASUREMENT_ID: "EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID",
  FIREBASE_VAPID: "EXPO_PUBLIC_FIREBASE_VAPID",
} as const;

export type BuildConstantKey = keyof typeof BuildConstantKeys;
export type BuildConstantValueKey =
  (typeof BuildConstantKeys)[BuildConstantKey];

const BuildConstant: Record<BuildConstantValueKey, string | undefined> = {
  EXPO_PUBLIC_TENANT: process.env.EXPO_PUBLIC_TENANT,
  EXPO_PUBLIC_API_HOST: process.env.EXPO_PUBLIC_API_HOST,
  EXPO_PUBLIC_API_PORT: process.env.EXPO_PUBLIC_API_PORT,
  EXPO_PUBLIC_API_PROTOCOL: process.env.EXPO_PUBLIC_API_PROTOCOL,
  EXPO_PUBLIC_WS_PROTOCOL: process.env.EXPO_PUBLIC_WS_PROTOCOL,
  EXPO_PUBLIC_FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  EXPO_PUBLIC_FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID:
    process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
  EXPO_PUBLIC_FIREBASE_VAPID: process.env.EXPO_PUBLIC_FIREBASE_VAPID,
};

export function getBuildConstant(constKey: BuildConstantValueKey): string {
  const value = BuildConstant[constKey];
  if (!value) {
    throw new Error(
      `Invalid configuration: the constant '${constKey}' is not set`,
    );
  }
  return value;
}

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

import { StorageProvider } from "./storageProvider";
import { SecureStorageProvider } from "./secureStorageProvider";
import { AsyncStorageProvider } from "./asyncStorageProvider";
import { PLATFORM } from "@/constants/platformConstants";

export enum StorageType {
  SECURE = "secure", // Mobile secure storage
  ASYNC = "async", // Mobile AsyncStorage
}

export class StorageFactory {
  static createStorage(type?: StorageType): StorageProvider {
    if (type) {
      switch (type) {
        case StorageType.SECURE:
          return new SecureStorageProvider();
        case StorageType.ASYNC:
          return new AsyncStorageProvider();
        default:
          throw new Error("Invalid storage type");
      }
    }

    if (PLATFORM.IS_WEB || PLATFORM.IS_EXPO_GO) {
      return new AsyncStorageProvider(); // Web uses localStorage
    }

    return new SecureStorageProvider();
  }
}

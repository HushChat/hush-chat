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

import AsyncStorage from "@react-native-async-storage/async-storage";
import { StorageProvider } from "./storageProvider";

export class AsyncStorageProvider implements StorageProvider {
  async save<T>(key: string, value: T): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  }

  async get<T>(key: string): Promise<T | null> {
    const item = await AsyncStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  }
}

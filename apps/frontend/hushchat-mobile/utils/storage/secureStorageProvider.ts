import * as SecureStore from "expo-secure-store";
import { StorageProvider } from "./storageProvider";

export class SecureStorageProvider implements StorageProvider {
  async save<T>(key: string, value: T): Promise<void> {
    await SecureStore.setItemAsync(key, JSON.stringify(value), {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const item = await SecureStore.getItemAsync(key);
    return item ? JSON.parse(item) : null;
  }

  async remove(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  }
}

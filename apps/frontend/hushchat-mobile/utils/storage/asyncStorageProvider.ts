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

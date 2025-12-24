import { AsyncStorageProvider } from "@/utils/storage/asyncStorageProvider";
import * as Crypto from "expo-crypto";
import { DEVICE_ID_KEY } from "@/constants/constants";

const storageProvider = new AsyncStorageProvider();
let cachedDeviceId: string | null = null;

export const initializeDeviceId = async (): Promise<void> => {
  try {
    const existingId = await storageProvider.get<string>(DEVICE_ID_KEY);

    if (existingId) {
      cachedDeviceId = existingId;
    } else {
      const newDeviceId = Crypto.randomUUID();
      await storageProvider.save(DEVICE_ID_KEY, newDeviceId);
      cachedDeviceId = newDeviceId;
    }
  } catch {
    cachedDeviceId = Crypto.randomUUID();
  }
};

export const getDeviceId = (): string => {
  return cachedDeviceId || Crypto.randomUUID();
};

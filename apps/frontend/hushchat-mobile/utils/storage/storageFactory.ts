import { StorageProvider } from './storageProvider';
import { SecureStorageProvider } from './secureStorageProvider';
import { AsyncStorageProvider } from './asyncStorageProvider';
import { PLATFORM } from '@/constants/platformConstants';

export enum StorageType {
  SECURE = 'secure', // Mobile secure storage
  ASYNC = 'async', // Mobile AsyncStorage
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
          throw new Error('Invalid storage type');
      }
    }

    if (PLATFORM.IS_WEB || PLATFORM.IS_EXPO_GO) {
      return new AsyncStorageProvider(); // Web uses localStorage
    }

    return new SecureStorageProvider();
  }
}

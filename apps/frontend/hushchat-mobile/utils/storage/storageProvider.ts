export interface StorageProvider {
  save<T>(key: string, value: T): Promise<void>;
  get<T>(key: string): Promise<T | null>;
  remove(key: string): Promise<void>;
}

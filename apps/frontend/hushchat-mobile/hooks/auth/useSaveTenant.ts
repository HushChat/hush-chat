import { useCallback } from "react";
import { StorageFactory } from "@/utils/storage/storageFactory";
import { TENANT } from "@/constants/constants";

export function useSaveTenant() {
  const storage = StorageFactory.createStorage();

  const saveTenant = useCallback(
    async (tenant?: string) => {
      const savePromises: Promise<any>[] = [];

      if (tenant) {
        savePromises.push(storage.save(TENANT, tenant));
      }

      if (savePromises.length > 0) {
        await Promise.all(savePromises);
      }
    },
    [storage]
  );

  return { saveTenant };
}

import { useCallback } from "react";
import { StorageFactory } from "@/utils/storage/storageFactory";
import { useAuthStore } from "@/store/auth/authStore";
import { TENANT } from "@/constants/constants";

export function useSaveTenant() {
  const storage = StorageFactory.createStorage();
  const { setWorkspaceSelected } = useAuthStore();

  const saveTenant = useCallback(
    async (tenant?: string) => {
      const savePromises: Promise<any>[] = [];

      if (tenant) {
        savePromises.push(storage.save(TENANT, tenant));
        setWorkspaceSelected(true);
      }

      if (savePromises.length > 0) {
        await Promise.all(savePromises);
      }
    },
    [setWorkspaceSelected, storage]
  );

  return { saveTenant };
}

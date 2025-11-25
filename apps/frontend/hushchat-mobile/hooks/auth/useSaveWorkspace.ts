import { useCallback } from "react";
import { StorageFactory } from "@/utils/storage/storageFactory";
import { WORKSPACE } from "@/constants/constants";

export function useSaveWorkspace() {
  const storage = StorageFactory.createStorage();

  const saveWorkspace = useCallback(
    async (workspace?: string) => {
      if (workspace) {
        await storage.save(WORKSPACE, workspace);
      }
    },
    [storage]
  );

  return { saveWorkspace };
}

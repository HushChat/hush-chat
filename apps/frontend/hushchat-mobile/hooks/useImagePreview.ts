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

import { useCallback, useEffect, useRef, useState } from "react";
import { MAX_FILES, validateFiles } from "@/utils/fileValidation";
import { ToastUtils } from "@/utils/toastUtils";

type Options = {
  maxFiles?: number;
  onError?: (errors: string[]) => void;
};

export function useImagePreview(options: Options = {}) {
  const { maxFiles = MAX_FILES, onError } = options;

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [imageMessage, setImageMessage] = useState("");

  const filesRef = useRef<File[]>([]);
  useEffect(() => {
    filesRef.current = selectedFiles;
  }, [selectedFiles]);

  const reportErrors = useCallback(
    (errs: string[]) => {
      if (!errs.length) return;
      if (onError) onError(errs);
      else ToastUtils.error(errs.join("\n"));
    },
    [onError],
  );

  const open = useCallback(
    (files: File[]) => {
      const { errors, validFiles } = validateFiles(files, 0);
      reportErrors(errors);
      if (validFiles.length > 0) {
        setSelectedFiles(validFiles.slice(0, maxFiles));
        setImageMessage("");
        setShowImagePreview(true);
      }
    },
    [maxFiles, reportErrors],
  );

  const close = useCallback(() => {
    setShowImagePreview(false);
    setSelectedFiles([]);
    setImageMessage("");
  }, []);

  const removeAt = useCallback((index: number) => {
    setSelectedFiles((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0) {
        setShowImagePreview(false);
        setImageMessage("");
      }
      return next;
    });
  }, []);

  const addMore = useCallback(
    (newFiles: File[]) => {
      const currentCount = filesRef.current.length;
      const { errors, validFiles } = validateFiles(newFiles, currentCount);
      reportErrors(errors);
      if (validFiles.length > 0) {
        setSelectedFiles((prev) => {
          const all = [...prev, ...validFiles];
          return all.slice(0, maxFiles);
        });
      }
    },
    [maxFiles, reportErrors],
  );

  return {
    selectedFiles,
    showImagePreview,
    imageMessage,
    setImageMessage,
    open,
    close,
    removeAt,
    addMore,
  };
}

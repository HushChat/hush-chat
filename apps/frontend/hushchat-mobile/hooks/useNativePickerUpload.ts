import { useCallback, useMemo, useRef, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { PLATFORM } from "@/constants/platformConstants";
import { IMessage } from "@/types/chat/types";

export type PickSource = "media" | "document";
export type MediaKind = "image" | "video" | "all";

export type PickAndUploadOptions = {
  source: PickSource;
  mediaKind?: MediaKind; // for source === 'media'
  allowsEditing?: boolean; // square crop etc. (images)
  aspect?: [number, number]; // e.g. [1,1]
  quality?: number; // 0..1 (images/videos)
  multiple?: boolean; // multiple selection if supported
  maxSizeKB?: number; // per-file max size
  allowedMimeTypes?: string[]; // whitelist (e.g. ['image/jpeg','image/png'])
};

export type LocalFile = {
  uri: string;
  name: string;
  type: string; // mime
  size?: number; // bytes (best-effort)
};

export type SignedUrl = {
  originalFileName: string;
  indexedFileName: string;
  url: string;
  messageId?: number;
  rawMessage?: IMessage;
};

export type UploadResult = {
  success: boolean;
  fileName: string;
  error?: string;
  signed?: SignedUrl | null;
  messageId?: number;
  rawMessage?: IMessage;
};

type State = {
  isPicking: boolean;
  isUploading: boolean;
  error: string | null;
  progress: number; // 0..1 across all files
  results: UploadResult[];
};

const defaultOpts: Partial<PickAndUploadOptions> = {
  mediaKind: "all",
  allowsEditing: false,
  aspect: [1, 1],
  quality: 0.9,
  multiple: false,
  maxSizeKB: 1024 * 5, // 5MB default
  allowedMimeTypes: undefined,
};

function guessNameFromUri(uri: string, fallback = "file"): string {
  const last = uri.split("/").pop() ?? "";
  if (!last) return `${fallback}`;
  // iOS sometimes appends query/fragments
  const clean = last.split("?")[0].split("#")[0];
  return clean || fallback;
}

async function readAsBlob(uri: string): Promise<Blob> {
  const res = await fetch(uri);
  return await res.blob();
}

async function ensureLocalFile(meta: {
  uri: string;
  mime?: string;
  name?: string;
  size?: number;
}): Promise<LocalFile> {
  const blob = await readAsBlob(meta.uri);
  const type = meta.mime || blob.type || "application/octet-stream";
  const name = meta.name || guessNameFromUri(meta.uri);
  const size = typeof meta.size === "number" ? meta.size : (blob as any).size;
  return { uri: meta.uri, name, type, size };
}

function passesFilters(
  file: LocalFile,
  maxSizeKB?: number,
  allow?: string[]
): { ok: boolean; reason?: string } {
  if (typeof maxSizeKB === "number" && file.size && file.size / 1024 > maxSizeKB) {
    return { ok: false, reason: `File too large (> ${maxSizeKB} KB)` };
  }
  if (allow && allow.length > 0) {
    if (allow.includes("*/*") || allow.includes("*")) {
      return { ok: true };
    }

    const ok = allow.some((m) => {
      if (m.endsWith("/*")) {
        const prefix = m.slice(0, -1);
        return file.type.startsWith(prefix);
      }
      return file.type === m;
    });

    if (!ok) return { ok: false, reason: `Blocked MIME type: ${file.type}` };
  }
  return { ok: true };
}

async function putToSignedUrl(file: LocalFile, signedUrl: string): Promise<void> {
  const blob = await readAsBlob(file.uri);
  await fetch(signedUrl, {
    method: "PUT",
    body: blob,
    headers: {
      "Content-Type": file.type || blob.type || "application/octet-stream",
    },
  });
}

/**
 * Reusable picker+uploader for native.
 * You inject how to get signed URLs (per your endpoint), we handle the rest.
 */
export function useNativePickerUpload(
  getSignedUrls: (files: LocalFile[], messageText?: string) => Promise<SignedUrl[] | null>,
  onUploadSuccess?: (messageIds: number[]) => Promise<void>
) {
  const [state, setState] = useState<State>({
    isPicking: false,
    isUploading: false,
    error: null,
    progress: 0,
    results: [],
  });

  const abortRef = useRef<boolean>(false);

  const reset = useCallback(() => {
    setState({
      isPicking: false,
      isUploading: false,
      error: null,
      progress: 0,
      results: [],
    });
    abortRef.current = false;
  }, []);

  const cancel = useCallback(() => {
    abortRef.current = true;
  }, []);

  const pick = useCallback(
    async (opts?: Partial<PickAndUploadOptions>): Promise<LocalFile[] | null> => {
      const o: PickAndUploadOptions = {
        ...defaultOpts,
        source: "media",
        ...opts,
      } as PickAndUploadOptions;
      setState((s) => ({ ...s, isPicking: true, error: null }));

      try {
        if (o.source === "media") {
          const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!perm.granted) {
            throw new Error("Permission to access media library is required.");
          }

          const mediaTypes: ImagePicker.MediaType | ImagePicker.MediaType[] =
            o.mediaKind === "image"
              ? "images"
              : o.mediaKind === "video"
                ? "videos"
                : ["images", "videos"];

          const supportsMultiple = Boolean(o.multiple && (PLATFORM.IS_IOS || PLATFORM.IS_ANDROID));
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes,
            allowsEditing: o.allowsEditing,
            aspect: o.aspect,
            quality: o.quality,
            allowsMultipleSelection: supportsMultiple,
            selectionLimit: supportsMultiple ? 0 : 1, // 0 => unlimited (iOS)
          });

          if (result.canceled) return null;

          const assets = result.assets ?? [];
          const locals: LocalFile[] = [];
          for (const a of assets) {
            const file = await ensureLocalFile({
              uri: a.uri,
              mime: a.mimeType || (a.type === "video" ? "video/mp4" : "image/jpeg"),
              name: a.fileName || guessNameFromUri(a.uri, a.type === "video" ? "video" : "image"),
              size: a.fileSize,
            });
            const check = passesFilters(file, o.maxSizeKB, o.allowedMimeTypes);
            if (!check.ok) throw new Error(`${file.name}: ${check.reason}`);
            locals.push(file);
          }
          return locals;
        } else {
          const result = await DocumentPicker.getDocumentAsync({
            multiple: Boolean(o.multiple),
            copyToCacheDirectory: true,
            type: o.allowedMimeTypes ?? "*/*",
          });
          if (result.canceled) return null;

          const files: LocalFile[] = [];
          for (const a of result.assets ?? []) {
            const file = await ensureLocalFile({
              uri: a.uri,
              mime: a.mimeType ?? "application/octet-stream",
              name: a.name ?? guessNameFromUri(a.uri, "document"),
              size: a.size,
            });
            const check = passesFilters(file, o.maxSizeKB, o.allowedMimeTypes);
            if (!check.ok) throw new Error(`${file.name}: ${check.reason}`);
            files.push(file);
          }
          return files;
        }
      } catch (err: any) {
        setState((s) => ({
          ...s,
          error: err?.message ?? "Failed to pick files",
        }));
        return null;
      } finally {
        setState((s) => ({ ...s, isPicking: false }));
      }
    },
    []
  );

  const upload = useCallback(
    async (files: LocalFile[], messageText: string = ""): Promise<UploadResult[]> => {
      if (!files || files.length === 0) return [];

      setState((s) => ({
        ...s,
        isUploading: true,
        error: null,
        progress: 0,
        results: [],
      }));
      try {
        const signed = await getSignedUrls(files, messageText);
        if (!signed || signed.length === 0) throw new Error("No signed URLs returned from server");

        const results: UploadResult[] = [];
        const successfulMessageIds: number[] = [];

        for (let i = 0; i < files.length; i++) {
          if (abortRef.current) throw new Error("Upload cancelled");
          const f = files[i];
          const s = signed.find((x) => x.originalFileName === f.name);
          if (!s) {
            results.push({
              success: false,
              fileName: f.name,
              error: "Missing signed URL for file",
              signed: null,
            });
          } else {
            try {
              await putToSignedUrl(f, s.url);
              results.push({
                success: true,
                fileName: f.name,
                signed: s,
                messageId: s.messageId,
                rawMessage: s.rawMessage,
              });

              if (s.messageId) {
                successfulMessageIds.push(s.messageId);
              }
            } catch (e: any) {
              results.push({
                success: false,
                fileName: f.name,
                error: e?.message ?? "PUT failed",
                signed: s,
              });
            }
          }
          setState((prev) => ({
            ...prev,
            progress: (i + 1) / files.length,
            results: [...results],
          }));
          // tiny yield to keep UI snappy
          await new Promise((r) => setTimeout(r, 8));
        }
        if (successfulMessageIds.length > 0 && onUploadSuccess) {
          await onUploadSuccess(successfulMessageIds);
        }

        return results;
      } catch (err: any) {
        const msg = err?.message ?? "Upload failed";
        setState((s) => ({ ...s, error: msg }));
        return files.map((f) => ({
          success: false,
          fileName: f.name,
          error: msg,
        }));
      } finally {
        setState((s) => ({ ...s, isUploading: false }));
      }
    },
    [getSignedUrls]
  );

  const pickAndUpload = useCallback(
    async (
      opts?: Partial<PickAndUploadOptions>,
      messageText: string = "",
      onPickSuccess?: (files: LocalFile[]) => Promise<void> | void
    ) => {
      const picked = await pick(opts);
      if (!picked || picked.length === 0) return [];

      if (onPickSuccess) {
        await onPickSuccess(picked);
      }

      return await upload(picked, messageText);
    },
    [pick, upload]
  );

  return useMemo(
    () => ({
      ...state,
      reset,
      cancel,
      pick,
      upload,
      pickAndUpload,
    }),
    [state, reset, cancel, pick, upload, pickAndUpload]
  );
}

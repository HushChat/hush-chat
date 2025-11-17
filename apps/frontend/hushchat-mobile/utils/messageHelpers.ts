import { IMessageAttachment } from "@/types/chat/types";

export const isImageAttachment = (att: IMessageAttachment) => {
  const name = (att.originalFileName || att.indexedFileName || "").toLowerCase();
  const byExt = /\.(jpe?g|png|gif|webp|svg)$/.test(name);
  const byMime = att?.mimeType?.startsWith?.("image/");
  return Boolean(byExt || byMime);
};

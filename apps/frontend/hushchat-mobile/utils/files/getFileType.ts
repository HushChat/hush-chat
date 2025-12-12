export const getFileType = (
  fileName: string | undefined | null
): "image" | "video" | "pdf" | "word" | "excel" | "unknown" => {
  if (!fileName) return "unknown";

  const ext = fileName.toLowerCase().split(".").pop() || "";

  if (["jpg", "jpeg", "png", "svg", "gif", "webp"].includes(ext)) return "image";
  if (["mp4", "mov", "webm", "avi", "mkv"].includes(ext)) return "video";
  if (ext === "pdf") return "pdf";
  if (["doc", "docx"].includes(ext)) return "word";
  if (["xls", "xlsx"].includes(ext)) return "excel";

  return "unknown";
};

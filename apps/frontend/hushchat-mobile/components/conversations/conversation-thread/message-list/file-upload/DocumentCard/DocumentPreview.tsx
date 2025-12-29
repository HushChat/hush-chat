import React, { useEffect, useRef, useState } from "react";
import { Modal, View, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/AppText";
import { IMessageAttachment } from "@/types/chat/types";
import { downloadFileWeb, openFileNative } from "@/utils/messageUtils";
import { PLATFORM } from "@/constants/platformConstants";
import { ToastUtils } from "@/utils/toastUtils";

// Conditional imports for Web
let docxPreview: any;
let XLSX: any;
if (PLATFORM.IS_WEB) {
  docxPreview = require("docx-preview");
  XLSX = require("xlsx");
}

interface IDocumentPreviewProps {
  visible: boolean;
  attachment: IMessageAttachment | null;
  onClose: () => void;
}

export const DocumentPreview = ({ visible, attachment, onClose }: IDocumentPreviewProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Store the raw file data here
  const [fileBlob, setFileBlob] = useState<Blob | null>(null);
  const [excelHTML, setExcelHTML] = useState<string | null>(null);

  const docContainerRef = useRef<HTMLDivElement>(null);

  const fileName = attachment?.originalFileName || attachment?.indexedFileName || "Document";
  const fileUrl = attachment?.fileUrl;
  const fileExt = fileName.split(".").pop()?.toLowerCase() || "";

  const isPdfOrText = ["pdf", "txt", "json", "png", "jpg", "jpeg"].includes(fileExt);
  const isWord = ["docx"].includes(fileExt);
  const isExcel = ["xlsx", "xls", "csv"].includes(fileExt);

  // 1. Reset state when attachment opens
  useEffect(() => {
    if (visible && attachment) {
      setLoading(true);
      setError(null);
      setFileBlob(null);
      setExcelHTML(null);
      fetchDocument();
    }
  }, [visible, attachment]);

  // 2. Fetch the data FIRST
  const fetchDocument = async () => {
    if (!fileUrl || !PLATFORM.IS_WEB) return;

    // If it's PDF/Image, we don't need to fetch blob, iframe handles it
    if (isPdfOrText) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();

      if (isWord) {
        setFileBlob(blob); // Save blob, this triggers re-render showing the div
      } else if (isExcel) {
        const arrayBuffer = await blob.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const html = XLSX.utils.sheet_to_html(workbook.Sheets[sheetName], { id: "excel-table" });
        setExcelHTML(html);
      }
    } catch (err) {
      console.error("Fetch failed", err);
      setError("Failed to load file.");
    } finally {
      setLoading(false); // Stop loading, allow components to mount
    }
  };

  // 3. Render WORD document ONLY after the div is definitely on screen
  useEffect(() => {
    if (!loading && fileBlob && isWord && docContainerRef.current) {
      // Clear container first
      docContainerRef.current.innerHTML = "";

      docxPreview
        .renderAsync(fileBlob, docContainerRef.current, docContainerRef.current, {
          className: "docx-viewer",
          inWrapper: true,
          ignoreWidth: false,
          experimental: true,
        })
        .catch((e: any) => {
          console.error("Docx render failed", e);
          setError("Preview failed. Please download.");
        });
    }
  }, [loading, fileBlob, isWord]); // Runs when loading finishes and blob exists

  const handleDownload = async () => {
    if (!fileUrl) return;
    try {
      if (PLATFORM.IS_WEB) await downloadFileWeb(fileUrl, fileName);
      else await openFileNative(fileUrl);
    } catch {
      ToastUtils.error("Download failed");
    }
  };

  const handleMobileOpen = async () => {
    if (fileUrl) await openFileNative(fileUrl);
  };

  // --- RENDER CONTENT ---
  const renderContent = () => {
    if (loading) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <AppText className="mt-4 text-gray-500">Loading Preview...</AppText>
        </View>
      );
    }

    if (error) return renderFallbackUI(true);

    // PDF / IMAGE (Iframe)
    if (isPdfOrText) {
      return (
        <iframe
          src={fileUrl}
          style={{ width: "100%", height: "100%", border: "none" }}
          title={fileName}
        />
      );
    }

    // WORD (Div Container)
    // IMPORTANT: This div must exist for docxPreview to work.
    if (isWord && fileBlob) {
      return (
        <div
          className="web-scroll-container"
          style={{ width: "100%", height: "100%", overflowY: "auto", background: "#f3f4f6" }}
        >
          {/* This ref is populated by the useEffect above */}
          <div ref={docContainerRef} style={{ padding: "24px", minHeight: "100%" }} />
        </div>
      );
    }

    // EXCEL (HTML Table)
    if (isExcel && excelHTML) {
      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            overflow: "auto",
            background: "white",
            padding: "20px",
          }}
        >
          <div dangerouslySetInnerHTML={{ __html: excelHTML }} className="excel-viewer" />
          <style>{`
            .excel-viewer table { border-collapse: collapse; width: 100%; font-family: Calibri, sans-serif; font-size: 14px; }
            .excel-viewer td, .excel-viewer th { border: 1px solid #e5e7eb; padding: 4px 8px; white-space: nowrap; }
            .excel-viewer tr:first-child { background-color: #f3f4f6; font-weight: bold; text-align: center; }
          `}</style>
        </div>
      );
    }

    return renderFallbackUI();
  };

  const renderFallbackUI = (isError = false) => (
    <View className="items-center justify-center p-6 w-full max-w-sm m-auto">
      <View className="w-24 h-24 bg-blue-50 rounded-3xl items-center justify-center mb-6">
        <Ionicons name="document-text" size={48} color={isError ? "#EF4444" : "#3B82F6"} />
      </View>
      <AppText className="text-lg text-center font-medium mb-2">
        {isError ? "Preview Error" : "Preview Unavailable"}
      </AppText>
      <AppText className="text-sm text-center text-gray-500 mb-6">
        {PLATFORM.IS_WEB ? "Please download to view." : "Open in device viewer."}
      </AppText>
      {!PLATFORM.IS_WEB ? (
        <Pressable onPress={handleMobileOpen} className="bg-blue-500 px-6 py-3 rounded-full">
          <AppText className="text-white font-semibold">Open Viewer</AppText>
        </Pressable>
      ) : (
        <Pressable onPress={handleDownload} className="bg-gray-900 px-6 py-3 rounded-full">
          <AppText className="text-white font-semibold">Download File</AppText>
        </Pressable>
      )}
    </View>
  );

  if (!visible || !attachment) return null;

  return (
    <Modal visible={visible} transparent={false} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-white dark:bg-[#111827]">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 z-10">
          <View className="flex-1 mr-4">
            <AppText
              className="text-lg font-semibold text-gray-900 dark:text-white"
              numberOfLines={1}
            >
              {fileName}
            </AppText>
          </View>
          <View className="flex-row gap-2">
            <Pressable
              onPress={handleDownload}
              className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
            >
              <Ionicons name="download-outline" size={24} color="#3B82F6" />
            </Pressable>
            <Pressable onPress={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
              <Ionicons name="close" size={24} color="#6B7280" />
            </Pressable>
          </View>
        </View>

        {/* Content */}
        <View className="flex-1  w-full h-full relative">
          {PLATFORM.IS_WEB ? renderContent() : renderFallbackUI()}
        </View>
      </View>
    </Modal>
  );
};

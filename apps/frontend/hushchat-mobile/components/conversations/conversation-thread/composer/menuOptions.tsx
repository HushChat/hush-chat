import React from "react";
import { MaterialIcons } from "@expo/vector-icons";
import type { IOption } from "@/types/chat/types";

/**
 * Menu options for the ConversationInputBar
 * Keep UI config separate from the input component logic.
 */
export const getConversationMenuOptions = (
  fileInputRef: React.RefObject<HTMLInputElement | null>,
  documentInputRef: React.RefObject<HTMLInputElement | null>
): IOption[] => [
  {
    id: 1,
    name: "Upload Images",
    iconComponent: (props: { size: number }) => (
      <MaterialIcons name="photo-library" size={props.size} color="#3B82F6" />
    ),
    action: () => {
      fileInputRef.current?.click();
    },
  },
  {
    id: 2,
    name: "Upload Documents",
    iconComponent: (props: { size: number }) => (
      <MaterialIcons name="insert-drive-file" size={props.size} color="#3B82F6" />
    ),
    action: () => {
      documentInputRef.current?.click();
    },
  },
];

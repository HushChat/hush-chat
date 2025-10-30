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

import React from "react";
import { ScrollView, View } from "react-native";
import { FilePreviewItem } from "@/components/conversations/conversation-thread/message-list/file-upload/FilePreviewItem";

type TFileListProps = {
  files: File[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onRemoveFile: (index: number) => void;
};

const FileList = ({
  files,
  selectedIndex,
  onSelect,
  onRemoveFile,
}: TFileListProps) => (
  <View className="w-64 bg-secondary-light/50 dark:bg-background-dark items-center border-r border-gray-200 dark:border-gray-800 custom-scrollbar">
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator
      contentContainerStyle={{ paddingVertical: 8, paddingBottom: 12 }}
    >
      {files.map((file, index) => (
        <View key={`${file.name}-${file.lastModified}`} className="mx-2">
          <FilePreviewItem
            file={file}
            index={index}
            isSelected={index === selectedIndex}
            onSelect={() => onSelect(index)}
            onRemove={onRemoveFile}
          />
        </View>
      ))}
    </ScrollView>
  </View>
);

export default FileList;

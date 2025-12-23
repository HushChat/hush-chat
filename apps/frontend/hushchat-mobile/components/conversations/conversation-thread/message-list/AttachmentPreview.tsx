import { IMessageAttachment, MessageAttachmentTypeEnum } from "@/types/chat/types";
import { Image, View } from "react-native";
import { AppText } from "@/components/AppText";

interface AttachmentPreviewProps {
  attachment?: IMessageAttachment;
}

export const AttachmentPreview = ({ attachment }: AttachmentPreviewProps) => {
  if (!attachment || !attachment.fileUrl) return null;

  const isDocument = attachment?.type === MessageAttachmentTypeEnum.DOCS;
  const isGif = attachment.type === MessageAttachmentTypeEnum.GIF;
  const imageUri = isGif ? attachment.indexedFileName : attachment.fileUrl;

  if (isDocument) {
    const extension = attachment.originalFileName?.split(".").pop() || "DOC";

    return (
      <View className="w-12 h-12 rounded-md bg-white items-center justify-center border border-gray-200 shadow-sm">
        <AppText className="text-[10px] font-bold text-gray-500 text-center uppercase">
          {extension}
        </AppText>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: imageUri }}
      className="w-12 h-12 rounded-md bg-gray-200 dark:bg-gray-700"
      resizeMode="cover"
    />
  );
};

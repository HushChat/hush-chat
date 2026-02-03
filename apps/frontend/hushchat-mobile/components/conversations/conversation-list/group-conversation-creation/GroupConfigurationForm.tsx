import React, { useCallback, useMemo, useState } from "react";
import { View, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { IConversation, IGroupConversation } from "@/types/chat/types";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";
import { PLATFORM } from "@/constants/platformConstants";
import { router } from "expo-router";
import { CHAT_VIEW_PATH } from "@/constants/routes";
import {
  getImagePickerAsset,
  uploadImage,
  uploadImageToSignedUrl,
  UploadType,
} from "@/apis/photo-upload-service/photo-upload-service";
import InitialsAvatar from "@/components/InitialsAvatar";
import { ImagePickerResult } from "expo-image-picker/src/ImagePicker.types";
import { useCreateGroupConversationMutation } from "@/query/post/queries";
import { useUserStore } from "@/store/user/useUserStore";
import { useConversationStore } from "@/store/conversation/useConversationStore";
import { ToastUtils } from "@/utils/toastUtils";
import { getCriteria } from "@/utils/conversationUtils";
import { AppText, AppTextInput } from "@/components/AppText";
import { useIsMobileLayout } from "@/hooks/useIsMobileLayout";

export interface IGroupConfigurationFormProps {
  participantUserIds: number[];
  onSuccess?: (conversationId: number) => void;
  initialName?: string;
  submitLabel?: string;
  setSelectedConversation?: (conversation: IConversation) => void;
}

const GroupConfigurationForm = ({
  participantUserIds,
  onSuccess,
  setSelectedConversation,
  initialName = "",
  submitLabel = "Create Group",
}: IGroupConfigurationFormProps) => {
  const [groupName, setGroupName] = useState(initialName);
  const [uploading, setUploading] = useState(false);
  const [imagePickerResult, setImagePickerResult] = useState<ImagePickerResult | undefined>();
  const [groupDescription, setGroupDescription] = useState("");
  const [imageAssetData, setImageAssetData] = useState(null);

  const hasImage = imagePickerResult?.assets && imagePickerResult.assets.length > 0;

  const isValid = useMemo(
    () => groupName.trim().length > 0 && participantUserIds.length > 0,
    [groupName, participantUserIds]
  );

  const {
    user: { id: userId },
  } = useUserStore();
  const { selectedConversationType } = useConversationStore();
  const criteria = getCriteria(selectedConversationType);
  const isMobileInBrowser = useIsMobileLayout();

  const { mutate: createGroup, isPending: submitting } = useCreateGroupConversationMutation(
    {
      userId: Number(userId),
      criteria,
    },
    (conversation) => {
      onSuccess?.(conversation.id);

      if (conversation.signedImageUrl && imageAssetData !== null) {
        void uploadImageToSignedUrl(imageAssetData?.fileUri, conversation?.signedImageUrl);
      }

      if (!PLATFORM.IS_WEB || isMobileInBrowser) {
        router.push({
          pathname: CHAT_VIEW_PATH,
          params: {
            conversationId: conversation.id,
            conversationName: conversation.name,
          },
        });
      } else {
        setSelectedConversation(conversation);
      }
    },
    () => {
      ToastUtils.error("Failed to create group!");
    }
  );

  const onCreate = useCallback(() => {
    const imageAssetData = getImagePickerAsset(imagePickerResult, UploadType.GROUP);
    setImageAssetData(imageAssetData);

    if (!isValid || submitting) return;
    const groupInfo: IGroupConversation = {
      name: groupName.trim(),
      participantUserIds,
      imageFileName: imageAssetData ? imageAssetData.fileName : null,
      description: groupDescription,
    };
    createGroup(groupInfo);
  }, [
    imagePickerResult,
    isValid,
    submitting,
    groupName,
    participantUserIds,
    groupDescription,
    createGroup,
  ]);

  const uploadImageResult = async () => {
    setUploading(true);
    const pickerResult = await uploadImage();
    setImagePickerResult(pickerResult);
    setUploading(false);
  };

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark px-5 py-6">
      <View className="items-center mb-8">
        <TouchableOpacity
          onPress={uploadImageResult}
          disabled={uploading}
          activeOpacity={DEFAULT_ACTIVE_OPACITY}
        >
          <View className="relative">
            {uploading ? (
              <View className="w-40 h-40 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center">
                <ActivityIndicator size="small" color="#9CA3AF" />
              </View>
            ) : (
              <InitialsAvatar
                name={groupName || "G"}
                size="lg"
                imageUrl={hasImage ? imagePickerResult?.assets[0].uri : null}
              />
            )}
            <View className="absolute bottom-3 right-0 bg-primary-light dark:bg-primary-dark rounded-full p-1.5 border-2 border-white dark:border-background-dark">
              <Ionicons name="camera" size={18} color="#fff" />
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <View className="mb-5">
        <AppText className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-2">
          Group name
        </AppText>
        <View className="h-12 rounded-xl bg-gray-100 dark:bg-gray-800 px-4 justify-center">
          <AppTextInput
            value={groupName}
            onChangeText={setGroupName}
            placeholder="Enter group name"
            placeholderTextColor="#9CA3AF"
            className="text-text-primary-light dark:text-text-primary-dark outline-none"
            returnKeyType="next"
          />
        </View>
      </View>

      <View className="mb-5">
        <AppText className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-2">
          Description{" "}
          <AppText className="text-text-secondary-light/60 dark:text-text-secondary-dark/60">
            (optional)
          </AppText>
        </AppText>
        <View className="rounded-xl bg-gray-100 dark:bg-gray-800 px-4 py-3 min-h-[88px]">
          <AppTextInput
            value={groupDescription}
            onChangeText={setGroupDescription}
            placeholder="What's this group about?"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            className="text-text-primary-light dark:text-text-primary-dark outline-none"
          />
        </View>
      </View>

      <View className="flex-row items-center mb-8">
        <Ionicons name="people-outline" size={18} color="#9CA3AF" />
        <AppText className="ml-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">
          {participantUserIds.length} participant{participantUserIds.length !== 1 ? "s" : ""}{" "}
          selected
        </AppText>
      </View>

      <TouchableOpacity
        onPress={onCreate}
        disabled={!isValid || submitting}
        activeOpacity={DEFAULT_ACTIVE_OPACITY}
        className={`h-12 rounded-xl items-center justify-center ${
          !isValid || submitting
            ? "bg-primary-light/60 dark:bg-primary-dark/60"
            : "bg-primary-light dark:bg-primary-dark"
        }`}
      >
        {submitting ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <AppText className="text-white font-semibold">{submitLabel}</AppText>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default GroupConfigurationForm;

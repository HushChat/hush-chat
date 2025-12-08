import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { IConversation, IGroupConversation } from "@/types/chat/types";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";
import {
  getImagePickerAsset,
  uploadImage,
  uploadImageToSignedUrl,
  UploadType,
} from "@/apis/photo-upload-service/photo-upload-service";
import InitialsAvatar from "@/components/InitialsAvatar";
import { ImagePickerResult } from "expo-image-picker/src/ImagePicker.types";
import UploadIndicator from "@/components/UploadIndicator";
import { useCreateGroupConversationMutation } from "@/query/post/queries";
import { useUserStore } from "@/store/user/useUserStore";
import { useConversationStore } from "@/store/conversation/useConversationStore";
import { ToastUtils } from "@/utils/toastUtils";
import { getCriteria } from "@/utils/conversationUtils";

const COLORS = {
  primaryBlue: "#3b82f6",
  white: "#ffffff",
};

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
  initialName = "",
  submitLabel = "Create group",
}: IGroupConfigurationFormProps) => {
  const [groupName, setGroupName] = useState(initialName);
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imagePickerResult, setImagePickerResult] = useState<ImagePickerResult | undefined>();
  const [groupDescription, setGroupDescription] = useState("");
  const [imageAssetData, setImageAssetData] = useState(null);
  const isValid = useMemo(
    () => groupName.trim().length > 0 && participantUserIds.length > 0,
    [groupName, participantUserIds]
  );

  const {
    user: { id: userId },
  } = useUserStore();
  const { selectedConversationType } = useConversationStore();
  const criteria = getCriteria(selectedConversationType);
  const { mutate: createGroup, isPending: submitting } = useCreateGroupConversationMutation(
    {
      userId: Number(userId),
      criteria,
    },
    (conversation) => {
      onSuccess?.(conversation.id);

      if (conversation.signedImageUrl && imageAssetData !== null) {
        uploadImageToSignedUrl(imageAssetData?.fileUri, conversation?.signedImageUrl);
      }

      ToastUtils.success(
        "Group created successfully! It will become available once approved by the admin."
      );
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
    <View className="px-4 pt-5 dark:bg-background-dark">
      <View className="items-center py-10 rounded-3xl max-w-3xl w-full mx-auto bg-background-light dark:bg-background-dark">
        <TouchableOpacity
          onPress={uploadImageResult}
          disabled={uploading}
          activeOpacity={DEFAULT_ACTIVE_OPACITY}
        >
          <View style={styles.avatarContainer}>
            {imagePickerResult?.assets && imagePickerResult.assets.length > 0 && !imageError ? (
              <View className="w-160 h-160 rounded-full bg-white dark:bg-gray-800 items-center justify-center overflow-hidden">
                <Image
                  source={{ uri: imagePickerResult?.assets[0].uri }}
                  style={styles.avatarImage}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  onError={() => setImageError(true)}
                />
                <UploadIndicator isUploading={uploading} />
              </View>
            ) : (
              <View className="w-160 h-160 rounded-full bg-white dark:bg-gray-800 items-center justify-center overflow-hidden">
                <InitialsAvatar name={"u"} size="lg" />
                <UploadIndicator isUploading={uploading} />
              </View>
            )}
            <View style={styles.cameraIconContainer}>
              <Ionicons name="camera" size={18} color="#fff" />
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <Text className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-2">
        Group name
      </Text>

      <View className="flex-row items-center rounded-lg px-3 h-12">
        <Ionicons name="people" size={18} color="#9CA3AF" />
        <TextInput
          value={groupName}
          onChangeText={setGroupName}
          placeholder="e.g. Weekend Plans"
          placeholderTextColor="#9CA3AF"
          className="flex-1 ml-2 text-text-primary-light dark:text-text-primary-dark outline-none"
          returnKeyType="done"
        />
      </View>

      <Text className="mt-4 text-sm text-text-secondary-light dark:text-text-secondary-dark">
        Participants selected: {participantUserIds.length}
      </Text>

      <Text className="mt-4 text-sm text-text-secondary-light dark:text-text-secondary-dark mb-2">
        Group description
      </Text>

      <View className="rounded-lg px-3 py-2 min-h-20 border border-gray-300 dark:border-gray-600">
        <TextInput
          value={groupDescription}
          onChangeText={setGroupDescription}
          placeholder="e.g. Trip planning, group work, etc."
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          className="flex-1 ml-2 text-text-primary-light dark:text-text-primary-dark outline-none"
        />
      </View>

      <TouchableOpacity
        onPress={onCreate}
        disabled={!isValid || submitting}
        activeOpacity={DEFAULT_ACTIVE_OPACITY}
        className={`mt-6 h-12 rounded-lg items-center justify-center ${
          !isValid || submitting
            ? "bg-primary-light/60 dark:bg-primary-dark/60"
            : "bg-primary-light dark:bg-primary-dark"
        }`}
      >
        {submitting ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text className="text-white font-medium cursor-pointer">{submitLabel}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default GroupConfigurationForm;

const styles = StyleSheet.create({
  avatarContainer: {
    position: "relative",
  },
  avatarImage: {
    width: 160,
    height: 160,
    borderRadius: 80,
  },

  cameraIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primaryBlue,
    borderRadius: 16,
    padding: 4,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
});

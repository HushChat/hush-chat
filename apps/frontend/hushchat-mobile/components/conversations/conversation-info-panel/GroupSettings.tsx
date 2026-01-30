import { Image, TouchableOpacity, View, Dimensions, StyleSheet } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { DEFAULT_ACTIVE_OPACITY, DEFAULT_HIT_SLOP } from "@/constants/ui";
import { Ionicons } from "@expo/vector-icons";
import { IConversation } from "@/types/chat/types";
import { useConversationByIdQuery } from "@/query/useConversationByIdQuery";
import InitialsAvatar from "@/components/InitialsAvatar";
import { pickAndUploadImage, UploadType } from "@/apis/photo-upload-service/photo-upload-service";
import UploadIndicator from "@/components/UploadIndicator";
import { useUserStore } from "@/store/user/useUserStore";
import { usePatchConversationQuery } from "@/query/post/queries";
import { ImagePickerResult } from "expo-image-picker/src/ImagePicker.types";
import { AppText, AppTextInput } from "@/components/AppText";
import useWebPanelManager from "@/hooks/useWebPanelManager";
import { PanelType } from "@/types/web-panel/types";
import GroupPermissions from "./GroupPermissions";
import ActionItem from "./common/ActionItem";
import { MotionView } from "@/motion/MotionView";
import { useConversationsQuery } from "@/query/useConversationsQuery";

interface IGroupSettingsProps {
  conversation: IConversation;
  onClose: () => void;
  visible: boolean;
}

export default function GroupSettings({ conversation, onClose, visible }: IGroupSettingsProps) {
  const { user } = useUserStore();

  const screenWidth = Dimensions.get("window").width;

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>(conversation.name ?? "");
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [description, setDescription] = useState(conversation.description ?? "");
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [signedImageUrl, setSignedImageUrl] = useState<string | null>(conversation.signedImageUrl);
  const [imagePickerResult, setImagePickerResult] = useState<ImagePickerResult | undefined>();
  const isInitialMount = useRef(true);
  const { activePanel, isPanelContentReady, openPanel, closePanel } =
    useWebPanelManager(screenWidth);

  const { refetchConversation, conversationAPILoading } = useConversationByIdQuery(
    conversation?.id
  );

  const { refetch: refetchConversationList } = useConversationsQuery();

  const updateConversation = usePatchConversationQuery(
    { userId: Number(user.id), conversationId: Number(conversation?.id) },
    () => {
      setIsEditing(false);
      setIsEditingDescription(false);
    }
  );

  const handlePickImage = async () => {
    if (!conversation.id) return;
    const imageResponse = await pickAndUploadImage(
      conversation.id.toString(),
      refetchConversation,
      setUploading,
      UploadType.GROUP
    );

    refetchConversationList();

    if (imageResponse) {
      setImagePickerResult(imageResponse?.pickerResult);
      setSignedImageUrl(imageResponse?.uploadedImageUrl);
      setImageError(false);
    }
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      onClose();
    }
  }, [conversation.id, onClose]);

  const handleSave = async () => {
    if (!newTitle?.trim()) return;
    updateConversation.mutate({
      conversationId: conversation.id,
      name: newTitle,
      description,
    });
  };

  const handleGroupPermissions = () => {
    openPanel(PanelType.GROUP_PERMISSIONS);
  };

  return (
    <MotionView
      visible={visible}
      from={{ opacity: 0, translateX: screenWidth }}
      to={{ opacity: 1, translateX: 0 }}
      duration={{ enter: 240, exit: 200 }}
      easing={{ enter: "decelerate", exit: "accelerate" }}
      delay={40}
      pointerEvents={visible ? "auto" : "none"}
      style={styles.absoluteFill}
      className="bg-background-light dark:bg-background-dark"
    >
      <View className="flex-row justify-between items-center px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-background-light dark:bg-background-dark">
        <AppText className="text-xl font-semibold text-gray-900 dark:text-white">
          Group Settings
        </AppText>
        <TouchableOpacity onPress={onClose} className="p-2">
          <Ionicons name="close-outline" size={22} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <View className="py-10 rounded-3xl max-w-3xl w-full mx-auto bg-background-light dark:bg-background-dark">
        <TouchableOpacity
          onPress={handlePickImage}
          disabled={uploading}
          activeOpacity={DEFAULT_ACTIVE_OPACITY}
        >
          <View style={styles.imageRowCenter}>
            {imagePickerResult?.assets?.[0]?.uri ? (
              <Image source={{ uri: imagePickerResult.assets[0].uri }} style={styles.avatarImg} />
            ) : signedImageUrl && !imageError ? (
              <Image source={{ uri: signedImageUrl }} style={styles.avatarImg} />
            ) : (
              <InitialsAvatar name={`${conversation.name ?? ""}`} size="lg" />
            )}

            <UploadIndicator isUploading={uploading} />
            <View className="absolute bottom-5 ml-32 bg-blue-500 rounded-2xl p-1 border-2 border-white">
              <Ionicons name="camera" size={18} color="#fff" />
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <View className="px-6">
        <View className="flex-row items-center justify-between">
          {isEditing ? (
            <View className="flex-row items-center flex-1 gap-3">
              <AppTextInput
                value={newTitle}
                onChangeText={setNewTitle}
                className="text-xl text-text-primary-light dark:text-text-primary-dark bg-gray-200 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl flex-1 px-4 py-3 max-w-[280px] outline-none"
                placeholder="Enter new title"
                autoFocus
                onSubmitEditing={handleSave}
                editable={!conversationAPILoading}
                returnKeyType="done"
                maxLength={100}
                submitBehavior="blurAndSubmit"
              />
              <TouchableOpacity
                onPress={handleSave}
                disabled={
                  conversationAPILoading || newTitle.trim() === (conversation.name ?? "").trim()
                }
                className={`p-3 rounded-xl ${
                  newTitle.trim() !== (conversation.name ?? "").trim()
                    ? "bg-[#583fc6] dark:bg-[#322082] active:bg-[#4731a8] dark:active:bg-[#23165c]"
                    : "bg-gray-300 dark:bg-gray-800 opacity-40"
                }`}
              >
                <Ionicons name="checkmark" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View className="flex-1 mr-4">
                <AppText className="text-xl font-bold text-gray-900 dark:text-white">
                  {newTitle}
                </AppText>
              </View>
              <TouchableOpacity
                onPress={() => setIsEditing(true)}
                hitSlop={DEFAULT_HIT_SLOP}
                activeOpacity={DEFAULT_ACTIVE_OPACITY}
                className="p-2 rounded-full active:bg-gray-100 dark:active:bg-gray-800"
              >
                <Ionicons name="pencil-outline" size={20} color="#6B7280" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <View className="mt-6 px-6">
        {isEditingDescription ? (
          <View className="flex-row items-start gap-3">
            <AppTextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Enter group description"
              multiline
              autoFocus
              className="text-base text-text-primary-light dark:text-text-primary-dark bg-gray-200 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-3 flex-1 min-h-[200px] max-w-[280px] outline-none"
              textAlignVertical="top"
              editable={!conversationAPILoading}
            />
            <TouchableOpacity
              onPress={handleSave}
              disabled={
                conversationAPILoading ||
                description.trim() === (conversation.description ?? "").trim()
              }
              className={`p-3 rounded-xl mt-1 ${
                description.trim() !== (conversation.description ?? "").trim()
                  ? "bg-[#583fc6] dark:bg-[#322082] active:bg-[#4731a8] dark:active:bg-[#23165c]"
                  : "bg-gray-300 dark:bg-gray-800 opacity-40"
              }`}
            >
              <Ionicons name="checkmark" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-row items-start justify-between">
            <AppText
              className="text-base text-gray-500 dark:text-gray-400 flex-1 mr-4"
              numberOfLines={4}
              ellipsizeMode="tail"
            >
              {description || "No description set"}
            </AppText>
            <TouchableOpacity
              onPress={() => setIsEditingDescription(true)}
              activeOpacity={DEFAULT_ACTIVE_OPACITY}
              className="p-2 rounded-full active:bg-gray-100 dark:active:bg-gray-800"
            >
              <Ionicons name="pencil-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View className="mt-12 px-4">
        <ActionItem
          icon="shield-checkmark-outline"
          label="Group Permissions"
          onPress={handleGroupPermissions}
        />
      </View>

      {isPanelContentReady && activePanel === PanelType.GROUP_PERMISSIONS && (
        <View className="absolute inset-0 bg-background-light dark:bg-background-dark">
          <GroupPermissions
            conversation={conversation}
            onClose={closePanel}
            visible={activePanel === PanelType.GROUP_PERMISSIONS}
          />
        </View>
      )}
    </MotionView>
  );
}

const styles = StyleSheet.create({
  absoluteFill: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  imageRowCenter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImg: {
    width: 160,
    height: 160,
    borderRadius: 80,
  },
});

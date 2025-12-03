import { Image, TouchableOpacity, View, Dimensions, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  withTiming,
  withDelay,
  useAnimatedStyle,
  Easing,
} from "react-native-reanimated";
import ChatInfoNameBar from "@/components/conversations/conversation-info-panel/common/ChatInfoNameBar";
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

interface IGroupSettingsProps {
  conversation: IConversation;
  onClose: () => void;
  visible: boolean;
}

export default function GroupSettings({ conversation, onClose, visible }: IGroupSettingsProps) {
  const { user } = useUserStore();

  const screenWidth = Dimensions.get("window").width;
  const translateX = useSharedValue(screenWidth);
  const opacity = useSharedValue(0);

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

  useEffect(() => {
    if (visible) {
      translateX.value = withTiming(0, {
        duration: 240,
        easing: Easing.out(Easing.cubic),
      });
      opacity.value = withDelay(
        40,
        withTiming(1, { duration: 160, easing: Easing.out(Easing.quad) })
      );
    } else {
      translateX.value = withTiming(screenWidth, {
        duration: 200,
        easing: Easing.in(Easing.cubic),
      });
      opacity.value = withTiming(0, {
        duration: 120,
        easing: Easing.in(Easing.quad),
      });
    }
  }, [visible, screenWidth, translateX, opacity]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      pointerEvents={visible ? "auto" : "none"}
      style={[styles.absoluteFill, containerStyle]}
      className="bg-background-light dark:bg-background-dark"
    >
      <View className="flex-row justify-between items-center px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-background-light dark:bg-background-dark">
        <AppText className="text-xl font-semibold text-gray-900 dark:text-white">
          All Participants
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

      <View className="items-center">
        <View className="flex-row items-center">
          {isEditing ? (
            <>
              <AppTextInput
                value={newTitle}
                onChangeText={setNewTitle}
                className="text-xl text-text-primary-light dark:text-text-primary-dark border-b border-gray-300 min-w-[150px]"
                placeholder="Enter new title"
                autoFocus
                onSubmitEditing={handleSave}
                editable={!conversationAPILoading}
                returnKeyType="done"
                maxLength={100}
                submitBehavior="blurAndSubmit"
              />
              {newTitle.trim() !== (conversation.name ?? "").trim() && (
                <TouchableOpacity onPress={handleSave} disabled={conversationAPILoading}>
                  <Ionicons name="checkmark" size={24} color="#10B981" />
                </TouchableOpacity>
              )}
            </>
          ) : (
            <>
              <ChatInfoNameBar title={newTitle} />
              <TouchableOpacity
                onPress={() => setIsEditing(true)}
                hitSlop={DEFAULT_HIT_SLOP}
                activeOpacity={DEFAULT_ACTIVE_OPACITY}
              >
                <Ionicons name="pencil-outline" size={20} color="#ccc" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <View className="dark:bg-background-dark mt-4 w-full px-4">
        {isEditingDescription ? (
          <View>
            <View className="flex-row items-start mt-2 px-4 w-full">
              <AppTextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Enter group description"
                multiline
                autoFocus
                className="text-base text-black bg-white rounded-md px-4 py-2 flex-1"
                editable={!conversationAPILoading}
              />

              {description.trim() !== (conversation.description ?? "").trim() && (
                <TouchableOpacity onPress={handleSave} disabled={conversationAPILoading}>
                  <Ionicons name="checkmark" size={24} color="#10B981" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => setIsEditingDescription(true)}
            activeOpacity={DEFAULT_ACTIVE_OPACITY}
          >
            <AppText
              className="text-base italic text-gray-400 text-left"
              numberOfLines={3}
              ellipsizeMode="tail"
            >
              {description ? description : "Add group description"}
            </AppText>
          </TouchableOpacity>
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
            conversationId={conversation.id}
            onClose={closePanel}
            visible={activePanel === PanelType.GROUP_PERMISSIONS}
          />
        </View>
      )}
    </Animated.View>
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

import {
  TouchableOpacity,
  View,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  Share,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { IConversation } from "@/types/chat/types";
import { AppText } from "@/components/AppText";
import ActionItem from "./common/ActionItem";
import { MotionView } from "@/motion/MotionView";
import * as Clipboard from "expo-clipboard";
import { ToastUtils } from "@/utils/toastUtils";

interface IGroupInviteProps {
  conversation: IConversation;
  onClose: () => void;
  visible: boolean;
}

export default function GroupInvite({ conversation, onClose, visible }: IGroupInviteProps) {
  const screenWidth = Dimensions.get("window").width;
  const isInitialMount = useRef(true);

  const [inviteLink, setInviteLink] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  async function getInviteLink(conversationId: number): Promise<string> {
    return "https://example.com/invite/ksdgaskhfAKSJH1234" + conversationId;
  }

  useEffect(() => {
    const fetchInviteLink = async () => {
      if (!visible) return;

      setLoading(true);
      setError("");

      try {
        const link = await getInviteLink(conversation.id);
        setInviteLink(link);
      } catch {
        setError("Failed to load invite link");
      } finally {
        setLoading(false);
      }
    };

    fetchInviteLink();
  }, [visible, conversation.id]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      onClose();
    }
  }, [conversation.id, onClose]);

  const handleCopyLink = async () => {
    if (!inviteLink) {
      return;
    }
    try {
      await Clipboard.setStringAsync(inviteLink);
      ToastUtils.success("Success", "Invite link copied to clipboard");
    } catch {
      ToastUtils.error("Error", "Failed to copy link");
    }
  };

  const handleShareLink = async () => {
    if (!inviteLink) {
      return;
    }
    try {
      await Share.share({
        message: `Join our group! ${inviteLink}`,
        url: inviteLink,
        title: "Group Invite Link",
      });
    } catch {
      ToastUtils.error("Error", "Failed to share link");
    }
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
          Group Link
        </AppText>
        <TouchableOpacity onPress={onClose} className="p-2">
          <Ionicons name="close-outline" size={22} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <View className="mx-4 mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <AppText className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
          {conversation.name}
        </AppText>

        {loading ? (
          <View className="flex-row items-center py-2">
            <ActivityIndicator size="small" color="#6B7280" />
            <AppText className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              Loading link...
            </AppText>
          </View>
        ) : error ? (
          <View className="flex-row items-center py-2">
            <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />
            <AppText className="ml-2 text-sm text-red-500">{error}</AppText>
          </View>
        ) : (
          <View className="bg-white dark:bg-gray-900 rounded px-3 py-2.5">
            <View className="flex-row items-start">
              <Ionicons name="link-outline" size={18} color="#6B7280" style={styles.marginTop2} />
              <View className="flex-1 ml-2">
                <AppText
                  className="text-sm text-gray-900 dark:text-white flex-wrap"
                  numberOfLines={3}
                  ellipsizeMode="tail"
                >
                  {inviteLink || "No link available"}
                </AppText>
              </View>
            </View>
          </View>
        )}
      </View>

      <View className="mt-5 px-4">
        <ActionItem icon="link-outline" label="Copy Link" onPress={handleCopyLink} />
        <ActionItem icon="share-social-outline" label="Share Link" onPress={handleShareLink} />
        <ActionItem icon="refresh-outline" label="Reset Link" critical={true} onPress={() => {}} />
      </View>
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
  marginTop2: {
    marginTop: 2,
  },
});

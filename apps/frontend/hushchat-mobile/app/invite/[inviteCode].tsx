import React, { useState } from "react";
import { View, ActivityIndicator, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { joinConversationByInvite } from "@/apis/conversation";
import { ToastUtils } from "@/utils/toastUtils";
import { logInfo } from "@/utils/logger";
import { useAuthThemeColors } from "@/hooks/useAuthThemeColors";
import { AppText } from "@/components/AppText";

export default function InviteScreen() {
  const { inviteCode } = useLocalSearchParams<{ inviteCode: string }>();
  const router = useRouter();
  const { colors, isDark } = useAuthThemeColors();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationName, setConversationName] = useState<string>("");
  const [showJoinButton, setShowJoinButton] = useState(true);

  const handleInvite = async () => {
    setShowJoinButton(false);
    setLoading(true);
    setError(null);

    try {
      const response = await joinConversationByInvite(inviteCode as string);

      if (!response.error) {
        setConversationName(response.data.name);
        ToastUtils.success("Successfully joined the conversation: " + response.data.name);
        setLoading(false);

        setTimeout(() => {
          router.replace({
            pathname: "/conversations",
            params: { id: String(response.data.id) },
          });
        }, 2000);
      } else {
        setError(response.error.message || "Invalid or expired invite code.");
        setLoading(false);

        setTimeout(() => {
          router.replace("/conversations");
        }, 3000);
      }
    } catch (err) {
      logInfo("Error handling invite:", err);
      setError("Failed to process invite. Please try again.");
      setLoading(false);
    }
  };

  const errorColor = isDark ? "#ef4444" : "#dc2626";

  return (
    <View
      className="flex-1 justify-center items-center p-5 web:min-h-screen"
      style={{ backgroundColor: colors.background }}
    >
      <View className="items-center w-full max-w-md">
        {showJoinButton ? (
          <>
            <AppText className="text-5xl mb-6">💬</AppText>
            <AppText
              className="text-2xl font-bold text-center mb-2"
              style={{ color: colors.textPrimary }}
            >
              Join Conversation
            </AppText>
            <AppText className="text-base text-center mb-8" style={{ color: colors.textSecondary }}>
              You&#39;ve been invited to join a conversation
            </AppText>
            <TouchableOpacity
              onPress={handleInvite}
              className="w-full py-4 px-6 rounded-lg"
              style={{ backgroundColor: colors.primary }}
              activeOpacity={0.8}
            >
              <AppText className="text-center text-base font-semibold text-white">Join Now</AppText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.replace("/conversations")}
              className="mt-4"
              activeOpacity={0.7}
            >
              <AppText className="text-sm" style={{ color: colors.textSecondary }}>
                Cancel
              </AppText>
            </TouchableOpacity>
          </>
        ) : loading ? (
          <>
            <ActivityIndicator size="large" color={colors.primary} />
            <AppText
              className="text-xl font-semibold mt-6 text-center"
              style={{ color: colors.textPrimary }}
            >
              Processing Invite
            </AppText>
            <AppText className="text-base text-center mt-2" style={{ color: colors.textSecondary }}>
              Please wait while we add you to the conversation...
            </AppText>
          </>
        ) : error ? (
          <>
            <AppText className="text-5xl mb-4">✕</AppText>
            <AppText
              className="text-xl font-semibold text-center"
              style={{ color: colors.textPrimary }}
            >
              Unable to Join
            </AppText>
            <AppText className="text-base text-center mt-2" style={{ color: errorColor }}>
              {error}
            </AppText>
            <AppText className="text-sm mt-4" style={{ color: colors.textSecondary }}>
              Redirecting to conversations...
            </AppText>
          </>
        ) : (
          <>
            <AppText className="text-5xl mb-4">✓</AppText>
            <AppText
              className="text-xl font-semibold text-center"
              style={{ color: colors.textPrimary }}
            >
              Success!
            </AppText>
            <AppText className="text-base text-center mt-2" style={{ color: colors.textSecondary }}>
              You&#39;ve joined{" "}
              <AppText className="font-semibold" style={{ color: colors.primary }}>
                {conversationName}
              </AppText>
            </AppText>
            <AppText className="text-sm mt-4" style={{ color: colors.textSecondary }}>
              Redirecting...
            </AppText>
          </>
        )}
      </View>
    </View>
  );
}

import {
  ActivityIndicator,
  Keyboard,
  TouchableOpacity,
  View,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PLATFORM } from "@/constants/platformConstants";
import BackButton from "@/components/BackButton";
import { router } from "expo-router";
import { AppText, AppTextInput } from "@/components/AppText";
import React, { useState } from "react";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";
import { useMutation } from "@tanstack/react-query";
import { sendInviteToWorkspace } from "@/apis/conversation";
import { ToastUtils } from "@/utils/toastUtils";
import { inviteSchema } from "@/schema/invite";

export default function Invite() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const inviteMutation = useMutation({
    mutationFn: sendInviteToWorkspace,
    onSuccess: (response) => {
      ToastUtils.success(response.data || "Invite sent successfully!");
      setEmail("");
      setEmailError("");
    },
    onError: (error: any) => {
      ToastUtils.error(error.response?.data?.error || error.message);
    },
  });

  const handleInvite = async () => {
    try {
      await inviteSchema.validate({ email }, { abortEarly: false });
      setEmailError("");
      inviteMutation.mutate(email);
      Keyboard.dismiss();
    } catch (error: any) {
      setEmailError(error.errors[0]);
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1" behavior="padding">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        className="bg-background-light dark:bg-background-dark"
      >
        <View className="flex-1 px-4" style={{ paddingTop: insets.top + 12 }}>
          <View className="flex-row items-center mb-6">
            {!PLATFORM.IS_WEB && <BackButton onPress={() => router.back()} />}
            <AppText className="text-2xl font-bold text-gray-900 dark:text-white leading-none ml-2">
              Invite to Workspace
            </AppText>
          </View>

          {/* Content */}
          <View className="flex-1">
            <AppText className="text-base text-gray-500 dark:text-gray-400 mb-6">
              Enter the email address of the person you would like to invite to collaborate.
            </AppText>

            <View className="mb-6">
              <AppText className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </AppText>

              <AppTextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter email"
                placeholderTextColor="#9ca3af"
                autoCapitalize="none"
                keyboardType="email-address"
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white"
              />
              {emailError && <AppText className="text-red-500 text-sm mt-1">{emailError}</AppText>}
            </View>

            <TouchableOpacity
              onPress={handleInvite}
              activeOpacity={DEFAULT_ACTIVE_OPACITY}
              disabled={!email}
              className={`rounded-lg py-4 items-center mt-5 ${
                !email ? "bg-gray-300 dark:bg-gray-700" : "bg-primary-light dark:bg-primary-dark"
              }`}
            >
              {inviteMutation.isPending ? (
                <ActivityIndicator color="#ffffff" size={20} />
              ) : (
                <AppText className="text-white font-semibold text-base">Send Invitation</AppText>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

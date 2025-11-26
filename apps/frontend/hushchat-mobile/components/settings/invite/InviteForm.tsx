import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { PLATFORM } from "@/constants/platformConstants";
import BackButton from "@/components/BackButton";
import { router } from "expo-router";
import { AppText } from "@/components/AppText";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import InviteFormFields from "@/components/settings/invite/InviteFormFields";
import { useInviteForm } from "@/hooks/useInviteForm";
import { IInvite } from "@/schema/invite";

export default function InviteForm() {
  const insets = useSafeAreaInsets();

  const { inviteForm, inviteMutation } = useInviteForm({ email: "" });

  const handleInvite = async () => {
    const validateInviteData = await inviteForm.validateAll();
    if (!validateInviteData) {
      return;
    }

    inviteMutation.mutate(validateInviteData.email);
    Keyboard.dismiss();
  };

  const onChangeField = (field: keyof IInvite, value: any) => {
    inviteForm.setFieldValue(field, value);
  };

  return (
    <KeyboardAvoidingView className="flex-1" behavior="padding">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        className="bg-background-light dark:bg-background-dark"
      >
        <View className="flex-1 px-4" style={{ paddingTop: insets.top + 12 }}>
          <View className="flex-row items-center mb-6 mt-3">
            {!PLATFORM.IS_WEB && <BackButton onPress={() => router.back()} />}
            <AppText className="text-2xl font-bold text-gray-900 dark:text-white leading-none ml-2">
              Invite to Workspace
            </AppText>
          </View>

          <View className="flex-1">
            <AppText className="text-base text-gray-500 dark:text-gray-400 mb-6">
              Enter the email address of the person you would like to invite to collaborate.
            </AppText>

            <InviteFormFields
              data={inviteForm.values}
              onChangeField={onChangeField}
              onError={inviteForm.errors}
            />

            <TouchableOpacity
              onPress={handleInvite}
              activeOpacity={DEFAULT_ACTIVE_OPACITY}
              disabled={!inviteForm.values.email}
              className={`rounded-lg py-4 items-center mt-5 ${
                !inviteForm.values
                  ? "bg-gray-300 dark:bg-gray-700"
                  : "bg-primary-light dark:bg-primary-dark"
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

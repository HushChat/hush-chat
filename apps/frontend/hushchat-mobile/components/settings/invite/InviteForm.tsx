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
import { ToastUtils } from "@/utils/toastUtils";

export default function InviteForm() {
  const insets = useSafeAreaInsets();
  const { inviteForm, inviteMutation } = useInviteForm();

  const handleInvite = async () => {
    const validateInviteData = await inviteForm.validateAll();

    const emails = inviteForm.values.invites?.map((i) => i.email.toLowerCase()) ?? [];
    const hasDuplicates = emails.some((email, index) => emails.indexOf(email) !== index);

    if (!validateInviteData?.invites || hasDuplicates) {
      return;
    }

    inviteMutation.mutate(validateInviteData.invites);
    Keyboard.dismiss();
  };

  const addInviteField = () => {
    const currentInvites = [...(inviteForm.values.invites ?? [])];

    if (currentInvites.length >= 100) {
      ToastUtils.error("Maximum invites are 100");
      return;
    }

    inviteForm.setFieldValue("invites", [...currentInvites, { email: "" }]);
  };

  const removeInviteField = (index: number) => {
    const currentInvites = [...(inviteForm.values.invites ?? [])];

    if (index >= 0 && index < currentInvites.length) {
      currentInvites.splice(index, 1);
      inviteForm.setFieldValue("invites", currentInvites);
    }
  };

  const onChangeEmail = (index: number, value: string) => {
    const currentInvites = [...(inviteForm.values.invites ?? [])];

    if (currentInvites[index]) {
      currentInvites[index] = { ...currentInvites[index], email: value };
      inviteForm.setFieldValue("invites", currentInvites);
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
          {/* Header */}
          <View className="flex-row items-center mb-6 mt-3">
            {!PLATFORM.IS_WEB && <BackButton onPress={() => router.back()} />}
            <AppText className="text-2xl font-bold text-gray-900 dark:text-white ml-2">
              Invite to Workspace
            </AppText>
          </View>

          <View className="flex-1">
            <AppText className="text-base text-gray-500 dark:text-gray-400 mb-6">
              Invite multiple colleagues by adding their email addresses below.
            </AppText>

            {inviteForm?.values?.invites?.map((invite, index) => (
              <InviteFormFields
                key={`invite-${index}`}
                index={index}
                email={invite.email}
                onChangeEmail={onChangeEmail}
                onRemove={removeInviteField}
                error={inviteForm.errors[`invites[${index}].email`]}
              />
            ))}

            <TouchableOpacity onPress={addInviteField} className="flex-row items-center py-2">
              <AppText className="text-primary-light dark:text-primary-dark font-medium">
                + Add another email
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleInvite}
              activeOpacity={DEFAULT_ACTIVE_OPACITY}
              disabled={inviteMutation.isPending}
              className={`rounded-lg py-4 items-center mt-10 bg-primary-light dark:bg-primary-dark ${
                inviteMutation.isPending ? "opacity-70" : ""
              }`}
            >
              {inviteMutation.isPending ? (
                <ActivityIndicator color="#ffffff" size={20} />
              ) : (
                <AppText className="text-white font-semibold text-base">
                  Send {inviteForm.values.invites?.length} Invitation(s)
                </AppText>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

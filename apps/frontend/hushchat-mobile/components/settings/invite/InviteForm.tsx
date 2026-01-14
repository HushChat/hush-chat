import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
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
import { useInviteForm } from "@/hooks/useInviteForm";
import TokenizedEmailInput from "@/components/settings/invite/TokenizedEmailInput";
import { ToastUtils } from "@/utils/toastUtils";
import classNames from "classnames";

export default function InviteForm() {
  const insets = useSafeAreaInsets();
  const { inviteForm, inviteMutation } = useInviteForm();

  const handleInvite = async () => {
    const emails = inviteForm.values.emails ?? [];

    if (emails.length === 0) {
      ToastUtils.error("Please add at least one email");
      return;
    }

    if (emails.length > 100) {
      ToastUtils.error("Maximum 100 invites allowed");
      return;
    }

    inviteMutation.mutate(emails);
    Keyboard.dismiss();
  };

  return (
    <KeyboardAvoidingView className="flex-1 w-[700px]" behavior="padding">
      <View className="flex-1 px-4" style={{ paddingTop: insets.top + 12 }}>
        <View className="flex-row items-center mb-6 mt-3">
          {!PLATFORM.IS_WEB && <BackButton onPress={() => router.back()} />}
          <AppText className="text-2xl font-bold text-gray-900 dark:text-white ml-2">
            Invite to Workspace
          </AppText>
        </View>

        <View className="flex-1">
          <AppText className="text-base text-gray-500 dark:text-gray-400 mb-6">
            Invite colleagues by entering their email addresses below. Separate with commas, spaces,
            or press Enter.
          </AppText>

          <TokenizedEmailInput
            value={inviteForm.values.emails ?? []}
            onChange={(emails) => inviteForm.setFieldValue("emails", emails)}
            error={inviteForm.errors.emails as string | undefined}
            max={100}
          />

          <TouchableOpacity
            onPress={handleInvite}
            activeOpacity={DEFAULT_ACTIVE_OPACITY}
            disabled={inviteMutation.isPending || (inviteForm.values.emails?.length ?? 0) === 0}
            className={classNames(
              "rounded-lg py-4 items-center mt-10 bg-primary-light dark:bg-primary-dark",
              {
                "opacity-60":
                  inviteMutation.isPending || (inviteForm.values.emails?.length ?? 0) === 0,
              }
            )}
          >
            {inviteMutation.isPending ? (
              <ActivityIndicator color="#ffffff" size={20} />
            ) : (
              <AppText className="text-white font-semibold text-base">
                Send {inviteForm.values.emails?.length ?? 0} Invite
                {(inviteForm.values.emails?.length ?? 0) !== 1 ? "s" : ""}
              </AppText>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

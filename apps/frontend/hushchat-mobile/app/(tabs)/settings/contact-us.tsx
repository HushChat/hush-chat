import React from "react";
import { View, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { AppText } from "@/components/AppText";
import { useUserStore } from "@/store/user/useUserStore";
import { ContactUsForm } from "@/components/ContactUsForm";
import { SafeAreaView } from "react-native-safe-area-context";
import { PLATFORM } from "@/constants/platformConstants";
import BackButton from "@/components/BackButton";
import { router } from "expo-router";

const Container = ({ children }: { children: React.ReactNode }) => {
  if (!PLATFORM.IS_WEB) {
    return (
      <KeyboardAvoidingView
        behavior={PLATFORM.IS_IOS ? "padding" : "height"}
        className="flex-1 bg-background-light dark:bg-background-dark"
      >
        {children}
      </KeyboardAvoidingView>
    );
  }

  return <View className="flex-1 bg-background-light dark:bg-background-dark">{children}</View>;
};

export default function ContactUsPage() {
  const { user } = useUserStore();

  const initialName = user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "";
  const initialEmail = user?.email || "";

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <Container>
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: PLATFORM.IS_WEB ? 48 : 10,
            paddingBottom: 40,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="w-full mx-auto max-w-[900px]">
            <View className="mb-6">
              <View className="flex-row items-center mb-2">
                {!PLATFORM.IS_WEB && <BackButton onPress={() => router.back()} />}
                <AppText className="text-xl font-bold text-gray-900 dark:text-white">
                  Contact Us
                </AppText>
              </View>
              <View>
                <AppText className="text-gray-600 dark:text-gray-400 max-w-[600px]">
                  Have a question or feedback? We would love to hear from you.
                </AppText>
              </View>
            </View>

            <View className={`w-full ${PLATFORM.IS_WEB ? "max-w-[600px] mx-auto" : "max-w-full"}`}>
              <ContactUsForm initialName={initialName} initialEmail={initialEmail} />
            </View>
          </View>
        </ScrollView>
      </Container>
    </SafeAreaView>
  );
}

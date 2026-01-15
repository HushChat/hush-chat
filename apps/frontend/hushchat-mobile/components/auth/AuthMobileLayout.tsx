import React, { ReactNode } from "react";
import {
  View,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PLATFORM } from "@/constants/platformConstants";
import { Images } from "@/assets/images";

type TAuthMobileLayoutProps = {
  colors: {
    textPrimary: string;
    formBackground: string;
  };
  children: ReactNode;
  isDark?: boolean;
  onBack?: () => void;
};

const KEYBOARD_OFFSET = PLATFORM.IS_IOS ? 60 : 0;

export default function AuthMobileLayout({
  colors,
  children,
  isDark = false,
  onBack,
}: TAuthMobileLayoutProps) {
  const bgImage = isDark ? Images.AuthBgDark : Images.AuthBgLight;
  const logoImage = isDark ? Images.LogoMobileDark : Images.LogoMobileLight;

  return (
    <View style={[style.container, { backgroundColor: colors.formBackground }]}>
      {onBack ? (
        <TouchableOpacity onPress={onBack} style={style.backButton}>
          <Ionicons name="chevron-back-outline" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      ) : null}
      <View style={style.header}>
        <Image source={bgImage} style={style.headerBg} resizeMode="cover" />
        <View style={style.logoContainer}>
          <Image source={logoImage} style={style.logoImage} resizeMode="contain" />
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={PLATFORM.IS_IOS ? "padding" : "height"}
        keyboardVerticalOffset={KEYBOARD_OFFSET}
        style={style.kav}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={style.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ flex: 1 }}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const style = StyleSheet.create({
  container: { flex: 1 },
  backButton: {
    position: "absolute",
    top: PLATFORM.IS_IOS ? 50 : 40,
    left: 20,
    zIndex: 1000,
    padding: 10,
    borderRadius: 25,
  },
  header: {
    height: 180,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  headerBg: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  logoContainer: {
    zIndex: 1,
  },
  logoImage: {
    height: 36,
    width: 160,
    marginTop: 50,
  },
  kav: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
});

import React, { ReactNode } from "react";
import { View, Image, StyleSheet, KeyboardAvoidingView, ScrollView } from "react-native";
import { PLATFORM } from "@/constants/platformConstants";
import { Images } from "@/assets/images";

type TAuthMobileLayoutProps = {
  colors: {
    formBackground: string;
  };
  children: ReactNode;
  isDark?: boolean;
};

const KEYBOARD_OFFSET = PLATFORM.IS_IOS ? 60 : 0;

export default function AuthMobileLayout({
  colors,
  children,
  isDark = false,
}: TAuthMobileLayoutProps) {
  // Choose background and logo based on theme
  const bgImage = isDark ? Images.AuthBgDark : Images.AuthBgLight;
  const logoImage = isDark ? Images.LogoMobileDark : Images.LogoMobileLight; 

  return (
    <View style={[style.container, { backgroundColor: colors.formBackground }]}>
      {/* Header with gradient background image */}
      <View style={style.header}>
        {/* Background image with gradient pattern */}
        <Image source={bgImage} style={style.headerBg} resizeMode="cover" />
        {/* Logo */}
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
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const style = StyleSheet.create({
  container: { flex: 1 },
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
  },
  kav: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
});

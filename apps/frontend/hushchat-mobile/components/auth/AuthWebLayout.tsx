import React, { ReactNode } from "react";
import { View, Image, useWindowDimensions, StyleSheet, ScrollView } from "react-native";
import { AppText } from "../AppText";
import { Ionicons } from "@expo/vector-icons";
import { Images } from "@/assets/images";

export type TAuthFeature = {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
};

type TAuthWebLayoutProps = {
  colors: {
    background: string;
    primary: string;
    textPrimary: string;
    textSecondary: string;
    formBackground: string;
    heroText: string;
    featureText: string;
  };
  children: ReactNode;
  isDark?: boolean;
  heroTitle?: string;
  heroSubtitle?: string;
  features?: TAuthFeature[];
};

const DEFAULT_FEATURES: TAuthFeature[] = [
  { icon: "shield-checkmark-outline", text: "Seamless across all devices" },
  { icon: "people-outline", text: "Group conversations made easy" },
  { icon: "chatbubbles-outline", text: "Real-time messaging" },
];

export default function AuthWebLayout({
  colors,
  children,
  isDark = false,
  heroTitle = "Your conversations,\nyour rules.",
  heroSubtitle = "Pick up right where you left off. Your team is waiting, and your messages are secure as always.",
  features = DEFAULT_FEATURES,
}: TAuthWebLayoutProps) {
  const { width } = useWindowDimensions();
  const isWide = width >= 1024;

  if (!isWide) {
    const mobileBg = isDark ? Images.AuthBgDark : Images.AuthBgLight;
    const mobileLogo = isDark ? Images.LogoMobileDark : Images.LogoMobileLight;

    return (
      <View style={[s.container, { backgroundColor: colors.formBackground }]}>
        <View style={s.mobileHeader}>
          <Image source={mobileBg} style={s.mobileHeaderBg} resizeMode="cover" />
          <View style={s.logoContainer}>
            <Image source={mobileLogo} style={s.logoImage} resizeMode="contain" />
          </View>
        </View>
        <ScrollView
          contentContainerStyle={s.mobileScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ flex: 1 }}>{children}</View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.shell}>
        <View style={s.left}>
          <Image source={Images.AuthBgDesktop} style={s.leftBgImage} resizeMode="cover" />
          <View style={s.leftContent}>
            <View style={s.leftContentTop}>
              <View style={s.logoContainer}>
                <Image source={Images.LogoDesktop} style={s.logoImage} resizeMode="contain" />
              </View>

              <View style={s.heroBlock}>
                <AppText style={[s.heroTitle, { color: colors.heroText }]}>{heroTitle}</AppText>
                <AppText style={[s.heroSubtitle, { color: colors.featureText }]}>
                  {heroSubtitle}
                </AppText>
              </View>
            </View>

            {features && features.length > 0 && (
              <View style={s.featuresContainer}>
                {features.map((feature, index) => (
                  <View key={index} style={s.featureRow}>
                    <Ionicons name={feature.icon} size={20} color={colors.featureText} />
                    <AppText style={[s.featureText, { color: colors.featureText }]}>
                      {feature.text}
                    </AppText>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={[s.right, { backgroundColor: colors.formBackground }]}>{children}</View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  shell: {
    flex: 1,
    flexDirection: "row",
  },
  // Left panel
  left: {
    width: "60%",
    justifyContent: "flex-start",
    position: "relative",
    overflow: "hidden",
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  leftBgImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  leftContent: {
    flex: 1,
    paddingHorizontal: 60,
    paddingVertical: 60,
    justifyContent: "space-between",
    zIndex: 1,
  },
  leftContentTop: {
    gap: 45,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoImage: {
    height: 40,
    width: 180,
    marginTop: 50,
  },
  heroBlock: {
    maxWidth: 550,
  },
  heroTitle: {
    fontSize: 44,
    fontFamily: "Poppins-SemiBold",
    fontWeight: "600",
    lineHeight: 54,
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 16,
    lineHeight: 26,
    opacity: 0.9,
  },
  featuresContainer: {
    gap: 14,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureText: {
    fontSize: 15,
  },
  // Right panel
  right: {
    width: "40%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 48,
  },
  mobileHeader: {
    height: 160,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  mobileHeaderBg: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  mobileScrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    flexGrow: 1,
  },
});

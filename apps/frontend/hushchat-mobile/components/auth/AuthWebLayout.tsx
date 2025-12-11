import React, { ReactNode } from "react";
import {
  View,
  Image,
  useWindowDimensions,
  ImageSourcePropType,
  StyleSheet,
  ScrollView,
} from "react-native";
import { AppText } from "../AppText";

type TAuthWebLayoutProps = {
  colors: {
    background: string;
    primary: string;
    textPrimary: string;
    textSecondary: string;
  };
  title: string;
  subtitle?: string;
  image: ImageSourcePropType;
  children: ReactNode;
};

export default function AuthWebLayout({
  colors,
  title,
  subtitle,
  image,
  children,
}: TAuthWebLayoutProps) {
  const { width } = useWindowDimensions();
  const isWide = width >= 1024;

  if (!isWide) {
    return (
      <View style={[s.container, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={s.mobileHeader}>
            <AppText style={[s.title, { color: colors.primary }]} numberOfLines={2}>
              {title}
            </AppText>
            {subtitle ? (
              <AppText style={[s.subtitle, { color: colors.textSecondary }]}>{subtitle}</AppText>
            ) : null}
          </View>
          <View>{children}</View>
          <View style={s.mobileImageWrap}>
            <Image source={image} style={s.mobileImage} resizeMode="contain" />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      <View style={s.shell}>
        <View style={s.left}>
          <View style={s.leftInner}>
            <View style={s.headerBlock}>
              <AppText style={[s.title, { color: colors.primary }]} numberOfLines={2}>
                {title}
              </AppText>
              {subtitle ? (
                <AppText style={[s.subtitle, { color: colors.textSecondary }]}>{subtitle}</AppText>
              ) : null}
            </View>
            <View style={s.imageWrap}>
              <Image source={image} style={s.image} />
            </View>
          </View>
        </View>
        <View style={s.right}>{children}</View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  mobileHeader: {
    marginBottom: 32,
  },
  mobileImageWrap: {
    alignItems: "center",
    width: "100%",
    marginTop: 32,
  },
  mobileImage: {
    width: "100%",
    height: 300,
  },
  shell: {
    flex: 1,
    flexDirection: "row",
    alignItems: "stretch",
    paddingHorizontal: 48,
    paddingVertical: 42,
    gap: 8,
  },
  left: {
    width: "60%",
    justifyContent: "center",
  },
  leftInner: {
    flex: 1,
    justifyContent: "space-between",
    minHeight: 0,
  },
  headerBlock: {
    paddingRight: 24,
    maxWidth: 700,
  },
  title: {
    fontSize: 44,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 18,
    lineHeight: 28,
    maxWidth: 520,
  },
  imageWrap: {
    flex: 1,
    justifyContent: "center",
    paddingTop: 16,
  },
  image: {
    width: "100%",
    maxWidth: 900,
    height: 700,
    resizeMode: "contain",
  },
  right: {
    width: "40%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 48,
  },
});

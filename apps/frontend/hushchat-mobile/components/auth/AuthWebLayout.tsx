import React, { ReactNode } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  useWindowDimensions,
  ImageSourcePropType,
} from "react-native";

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

  return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      <View style={[s.shell, { flexDirection: isWide ? "row" : "column" }]}>
        <View style={[s.left, { width: isWide ? "60%" : "100%" }]}>
          <View style={s.leftInner}>
            <View style={s.headerBlock}>
              <Text style={[s.title, { color: colors.primary }]} numberOfLines={2}>
                {title}
              </Text>
              {subtitle ? (
                <Text style={[s.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
              ) : null}
            </View>

            <View style={s.imageWrap}>
              <Image source={image} style={s.image} />
            </View>
          </View>
        </View>

        <View style={[s.right, { width: isWide ? "40%" : "100%" }]}>{children}</View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  backButton: {
    position: "absolute",
    top: 24,
    left: 20,
    zIndex: 1000,
    padding: 8,
  },

  shell: {
    flex: 1,
    alignItems: "stretch",
    paddingHorizontal: 48,
    paddingVertical: 42,
    gap: 24,
  },

  left: { justifyContent: "center" },
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
    lineHeight: 26,
    maxWidth: 520,
  },

  imageWrap: {
    flex: 1,
    justifyContent: "center",
    paddingTop: 16,
  },
  image: {
    width: "100%",
    aspectRatio: 2,
    resizeMode: "contain",
  },

  right: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 48,
  },
});

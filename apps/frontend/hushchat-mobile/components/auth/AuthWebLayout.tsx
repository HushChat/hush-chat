import React, { ReactNode, useMemo } from "react";
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

  const shellStyle = useMemo(
    () => [
      s.shell,
      {
        flexDirection: isWide ? ("row" as const) : ("column" as const),
      },
    ],
    [isWide]
  );

  const leftStyle = useMemo(
    () => [
      s.left,
      {
        width: isWide ? ("60%" as const) : ("100%" as const),
      },
    ],
    [isWide]
  );

  const rightStyle = useMemo(
    () => [
      s.right,
      {
        width: isWide ? ("40%" as const) : ("100%" as const),
      },
    ],
    [isWide]
  );

  return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      <View style={shellStyle}>
        <View style={leftStyle}>
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
        <View style={rightStyle}>{children}</View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
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

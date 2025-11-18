import React, { ReactNode, useMemo } from "react";
import {
  View,
  Text,
  Image,
  useWindowDimensions,
  ImageSourcePropType,
  StyleSheet,
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

  const styles = useMemo(() => {
    const isWide = width >= 1024;

    return {
      shell: [
        s.shell,
        {
          flexDirection: isWide ? ("row" as const) : ("column" as const),
        },
      ],
      left: [
        s.left,
        {
          width: isWide ? ("60%" as const) : ("100%" as const),
        },
      ],
      right: [
        s.right,
        {
          width: isWide ? ("40%" as const) : ("100%" as const),
        },
      ],
    };
  }, [width]);

  return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      <View style={styles.shell}>
        <View style={styles.left}>
          <View style={s.leftInner}>
            <View style={s.headerBlock}>
              <Text style={[s.title, { color: colors.primary }]} numberOfLines={2}>
                {title}
              </Text>
              {subtitle ? (
                <Text
                  className="mt-2.5 text-lg leading-7 max-w-[520px]"
                  style={{ color: colors.textSecondary }}
                >
                  {subtitle}
                </Text>
              ) : null}
            </View>
            <View style={s.imageWrap}>
              <Image source={image} style={s.image} />
            </View>
          </View>
        </View>
        <View style={styles.right}>{children}</View>
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

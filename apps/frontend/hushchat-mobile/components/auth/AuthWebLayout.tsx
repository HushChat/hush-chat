import React, { ReactNode } from "react";
import {
  View,
  Text,
  Image,
  useWindowDimensions,
  ImageSourcePropType,
  ScrollView,
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

  if (!isWide) {
    return (
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        <ScrollView
          contentContainerClassName="px-6 pt-10 pb-10"
          showsVerticalScrollIndicator={false}
        >
          <View className="mb-8">
            <Text
              className="text-5xl font-extrabold tracking-wide"
              style={{ color: colors.primary }}
              numberOfLines={2}
            >
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

          <View>{children}</View>

          <View className="items-center w-full">
            <Image source={image} className="w-[200px] max-h-[250px]" resizeMode="contain" />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <View className="flex-1 flex-row items-stretch px-12 py-10 gap-2">
        <View className="w-[60%] justify-center">
          <View className="flex-1 justify-between min-h-0">
            <View className="pr-6 max-w-[700px]">
              <Text
                className="text-5xl font-extrabold tracking-wide"
                style={{ color: colors.primary }}
                numberOfLines={2}
              >
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

            <View className="flex-1 justify-center pt-4">
              <Image
                source={image}
                className="w-full max-w-[900px] h-[700px]"
                resizeMode="contain"
              />
            </View>
          </View>
        </View>

        <View className="w-[40%] justify-center items-center px-12">{children}</View>
      </View>
    </View>
  );
}

import { useState } from "react";
import { Image, View } from "react-native";
import { AppText } from "@/components/AppText";

export const MarkdownImage = ({ src }: { src: string }) => {
  const [error, setError] = useState<boolean>(false);

  if (error) {
    return (
      <View className="my-2 h-[150px] w-full items-center justify-center rounded-lg border border-[#e0e0e0] bg-[#f5f5f5]">
        <AppText className="text-sm text-[#888]">Failed to load image</AppText>
      </View>
    );
  }

  return (
    <View className="my-2 w-full">
      <Image
        source={{ uri: src }}
        onError={() => setError(true)}
        className="aspect-square w-full rounded-lg bg-transparent"
        resizeMode="contain"
      />
    </View>
  );
};

import React, { useState } from "react";
import { PLATFORM } from "@/constants/platformConstants";
import { Image, View } from "react-native";

export const MarkdownImage = ({ src, alt }: { src: string; alt: string }) => {
  const [aspectRatio, setAspectRatio] = useState(1);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    if (PLATFORM.IS_WEB) return;

    Image.getSize(
      src,
      (width, height) => {
        setAspectRatio(width / height);
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );
  }, [src]);

  if (PLATFORM.IS_WEB) {
    return (
      <img
        src={src}
        alt={alt}
        style={{
          width: "100%",
          height: "auto",
          borderRadius: 8,
          marginTop: 8,
          marginBottom: 8,
          display: "block",
        }}
      />
    );
  }

  return (
    <View style={{ marginTop: 8, marginBottom: 8, width: "100%" }}>
      <Image
        source={{ uri: src }}
        style={{
          width: "100%",
          aspectRatio: aspectRatio,
          borderRadius: 8,
          backgroundColor: loading ? "rgba(0,0,0,0.05)" : "transparent",
        }}
        resizeMode="contain"
        accessibilityLabel={alt}
      />
    </View>
  );
};

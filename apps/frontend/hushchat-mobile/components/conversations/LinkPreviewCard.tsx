import React from "react";
import { View, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import FormattedText from "@/components/FormattedText";
import classNames from "classnames";
import { TMessageUrlMetadata } from "@/types/chat/types";

interface LinkPreviewCardProps {
  messageText: string;
  messageUrlMetadata: TMessageUrlMetadata;
  isCurrentUser: boolean;
  isLoading: boolean;
}

export default function LinkPreviewCard({
  messageText,
  messageUrlMetadata,
  isCurrentUser,
  isLoading,
}: LinkPreviewCardProps) {
  return (
    <TouchableOpacity activeOpacity={0.9} className=" rounded-md">
      {isLoading ? (
        <View className="items-center justify-center p-16">
          <ActivityIndicator size="small" color="#6B7280" />
        </View>
      ) : (
        <>
          {messageUrlMetadata?.imageUrl && messageUrlMetadata.imageUrl && (
            <View className="w-full h-40 bg-gray-200 dark:bg-gray-700">
              <Image
                source={{ uri: messageUrlMetadata.imageUrl }}
                className="w-full h-40"
                resizeMode="stretch"
              />
            </View>
          )}

          <View
            className={classNames("flex-col p-2 rounded-b-md", {
              "bg-[#593EDB]": isCurrentUser,
              "bg-[#E5E7EB] dark:bg-[#151B30]": !isCurrentUser,
            })}
          >
            {messageUrlMetadata.title && (
              <FormattedText text={messageUrlMetadata.title} isCurrentUser={isCurrentUser} />
            )}
            {messageUrlMetadata.description && (
              <FormattedText text={messageUrlMetadata.description} isCurrentUser={isCurrentUser} />
            )}

            {messageUrlMetadata.domain && (
              <FormattedText text={messageUrlMetadata.domain} isCurrentUser={isCurrentUser} />
            )}
          </View>
        </>
      )}

      <FormattedText text={messageText} isCurrentUser={isCurrentUser} />
    </TouchableOpacity>
  );
}

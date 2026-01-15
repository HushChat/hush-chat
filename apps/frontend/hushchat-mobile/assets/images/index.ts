import { getAssetUrl } from "@/constants/assetConstants";

export const Images = {
  NoChatSelected: require("./start-conversation.webp"),
  NoConversationFound: require("./no-conversation.webp"),
  chatBackground: require("./chat-background.png"),
  userProfile: require("./user-profile.png"),
  CallLogPlaceholder: require("./callLogPlaceholder.webp"),
  LogoDesktop: { uri: getAssetUrl("logo-desktop.png") },
  LogoMobileLight: { uri: getAssetUrl("logo-mobile-light.png") },
  LogoMobileDark: { uri: getAssetUrl("logo-mobile-dark.png") },
  AuthBgLight: { uri: getAssetUrl("auth-bg-light.png") },
  AuthBgDark: { uri: getAssetUrl("auth-bg-dark.png") },
  AuthBgDesktop: { uri: getAssetUrl("auth-bg-desktop.png") },
};

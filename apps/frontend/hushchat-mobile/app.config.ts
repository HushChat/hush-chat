import "dotenv/config";

export default () => ({
  expo: {
    name: "HushChat",
    slug: "chat",
    displayName: "HushChat",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "gethush",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    owner: process.env.EAS_PROJECT_OWNER,
    ios: {
      supportsTablet: true,
      associatedDomains: ["applinks:app.gethush.chat"],
      infoPlist: {
        NSCameraUsageDescription: "HushChat needs camera access for video calls.",
        NSMicrophoneUsageDescription: "HushChat needs microphone access for voice and video calls.",
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "https",
              host: "app.gethush.chat",
              pathPrefix: "/invite",
            },
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],
      permissions: [
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO",
        "android.permission.MODIFY_AUDIO_SETTINGS",
      ],
      package: "com.hush.chat",
      versionCode: 2,
      useNextNotificationsApi: true,
      googleServicesFile: "./google-services.json",
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
      build: {
        minify: true,
        hashAssetFiles: true,
      },
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
      [
        "expo-media-library",
        {
          photosPermission: "Allow $(PRODUCT_NAME) to access your photos.",
          savePhotosPermission: "Allow $(PRODUCT_NAME) to save photos.",
          isAccessMediaLocationEnabled: true,
          granularPermissions: ["audio", "photo"],
        },
      ],
      "expo-notifications",
    ],
    experiments: {
      typedRoutes: true,
      router: {
        server: false,
      },
    },
    extra: {
      eas: {
        projectId: process.env.EAS_PROJECT_ID,
      },
    },
  },
});

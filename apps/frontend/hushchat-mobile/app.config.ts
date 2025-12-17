import "dotenv/config";

export default () => ({
  expo: {
    name: "HushChat",
    slug: "chat",
    displayName: "HushChat",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "chat",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    owner: process.env.EAS_PROJECT_OWNER,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.hush.chat",
      associatedDomains: [`applinks:${process.env.EXPO_PUBLIC_WEB_DOMAIN}`],
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      package: "com.hush.chat",
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "https",
              host: process.env.EXPO_PUBLIC_WEB_DOMAIN,
              pathPrefix: "/conversations",
            },
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],
      // versionCode: 2,
      // useNextNotificationsApi: true,
      // googleServicesFile: path.resolve(__dirname, 'google-services.json'),
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
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      eas: {
        projectId: process.env.EAS_PROJECT_ID,
      },
    },
  },
});

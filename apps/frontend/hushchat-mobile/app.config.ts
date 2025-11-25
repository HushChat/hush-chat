import "dotenv/config";

export default () => ({
  expo: {
    name: "chat",
    slug: "chat",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "chat",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    owner: "skynetdevelopers",
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      package: "com.hush.chat",
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
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      eas: {
        projectId: "effe362a-5435-41e0-99a4-bbe22780981a",
      },
    },
  },
});

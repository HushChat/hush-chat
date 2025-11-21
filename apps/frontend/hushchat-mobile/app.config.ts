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
    owner: "hushchat",
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      package: "com.hushchat.chat",
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
      meta: {
        themeColor: "#5A31F4",
        appleMobileWebAppCapable: "yes",
        appleMobileWebAppStatusBarStyle: "black-translucent",
        viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
        tags: [
          {
            tag: "link",
            rel: "manifest",
            href: "/manifest.json",
          },
        ],
      },
      serviceWorker: {
        register: true,
        scope: "/",
        src: "service-worker.js",
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
        projectId: "5f708cde-5505-47a1-b187-4444651e1ead",
      },
    },
  },
});

import { GestureHandlerRootView } from "react-native-gesture-handler";
import React, { useCallback, useEffect } from "react";
import { ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { SplashScreen, Stack, Redirect, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-worklets";
import "@/global.css";
import { setAPIDefaults, setupAuthorizationHeader } from "@/utils/apiUtils";
import { useAuthStore } from "@/store/auth/authStore";
import { useUserStore } from "@/store/user/useUserStore";
import { setupGlobalErrorHandling } from "@/utils/apiErrorUtils";
import Toast from "react-native-toast-message";
import { PLATFORM } from "@/constants/platformConstants";
import { toastConfig } from "@/utils/config/toastConfig";
import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "@/query/config/queryClientConfig";
import { getNavigationTheme } from "@/utils/commonUtils";
import { ModalProvider } from "@/context/modal-context";
import { useAppTheme } from "@/hooks/useAppTheme";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AUTH_LOGIN_PATH, CHATS_PATH } from "@/constants/routes";
import { isTokenExpiringSoon, refreshIdToken } from "@/utils/authUtils";
import { NotificationFactory } from "@/utils/notifications/NotificationFactory";
import { sendTokenToBackend } from "@/apis/user";

const TOAST_OFFSET_IOS = 60;
const TOAST_OFFSET_ANDROID = 40;

export default function RootLayout() {
  const { colorScheme } = useAppTheme();
  const { isAuthenticated } = useAuthStore();
  const { fetchUserData, loading } = useUserStore();
  const [fontsLoaded] = useFonts({
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
  });
  const queryClient = createQueryClient();

  useEffect(() => {
    setAPIDefaults();
    setupAuthorizationHeader();
    setupGlobalErrorHandling();

    const initNotifications = async () => {
      const handler = NotificationFactory.getHandler();
      const token = await handler.registerDevice();

      if (token) {
        const platform = PLATFORM.IS_WEB ? "WEB" : "MOBILE";
        const response = await sendTokenToBackend({ token, platform });
        if (response.error) {
          console.error("Token sending failed!", response.error);
          return;
        }
      }

      // handler.onMessage?.((data) => {
      //   console.log('📩 Foreground notification:', data);
      // });
    };

    initNotifications();
  }, []);

  const initializeUserData = useCallback(async () => {
    if (isAuthenticated) {
      await fetchUserData();
    }
  }, [isAuthenticated, fetchUserData]);

  useEffect(() => {
    if (!fontsLoaded) return;

    if (isAuthenticated) {
      initializeUserData();
    }
  }, [fontsLoaded, isAuthenticated, initializeUserData]);

  // Hide splash screen only when everything is loaded
  useEffect(() => {
    const hideSplash = async () => {
      if (fontsLoaded && (!isAuthenticated || (isAuthenticated && !loading))) {
        await SplashScreen.hideAsync();
      }
    };

    hideSplash();
  }, [fontsLoaded, isAuthenticated, loading]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    const refreshInterval = setInterval(async () => {
      if (cancelled) return;
      const expiringSoon = await isTokenExpiringSoon();
      if (expiringSoon) {
        await refreshIdToken();
      }
    }, 90000); // every 1 minute and 30 seconds

    return () => {
      cancelled = true;
      clearInterval(refreshInterval);
    };
  }, [isAuthenticated]);

  return (
    <GestureHandlerRootView>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider value={getNavigationTheme(colorScheme)}>
            <ModalProvider>
              <Gate
                ready={!loading && fontsLoaded}
                isAuthenticated={isAuthenticated}
              />
              <Toast
                config={toastConfig}
                topOffset={
                  PLATFORM.IS_IOS ? TOAST_OFFSET_IOS : TOAST_OFFSET_ANDROID
                }
              />
              <StatusBar style="auto" />
            </ModalProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/** Central guard: decides where the user can go before screens mount */
function Gate({
  ready,
  isAuthenticated,
}: {
  ready: boolean;
  isAuthenticated: boolean;
}) {
  const segments = useSegments();
  const inAuthGroup = segments[0] === "(auth)";

  return (
    <>
      {ready && !isAuthenticated && !inAuthGroup && (
        <Redirect href={AUTH_LOGIN_PATH} />
      )}
      {ready && isAuthenticated && inAuthGroup && (
        <Redirect href={CHATS_PATH} />
      )}

      <Stack initialRouteName="index" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="conversations/conversation-info/[id]/index" />
        <Stack.Screen name="conversations/conversation-info/[id]/group-settings" />
        <Stack.Screen name="conversations/forward-panel" />
        <Stack.Screen name="conversation-threads" />
        <Stack.Screen name="search-view" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="+not-found" />
        <Stack.Screen name="group-conversation/select-participants" />
        <Stack.Screen name="group-conversation/configure" />
      </Stack>
    </>
  );
}

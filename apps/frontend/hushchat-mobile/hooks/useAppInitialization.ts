import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth/authStore";
import { useUserStore } from "@/store/user/useUserStore";
import { setAPIDefaults, setupAuthorizationHeader } from "@/utils/apiUtils";
import { setupGlobalErrorHandling } from "@/utils/apiErrorUtils";
import { NotificationFactory } from "@/utils/notifications/NotificationFactory";
import { sendTokenToBackend } from "@/apis/user";
import { refreshIdToken, isTokenExpiringSoon } from "@/utils/authUtils";
import { PLATFORM } from "@/constants/platformConstants";
import { SplashScreen } from "expo-router";
import { initDatabase } from "@/db";

export function useAppInitialization(fontsLoaded: boolean) {
  const { isAuthenticated, isWorkspaceSelected } = useAuthStore();
  const { fetchUserData, loading } = useUserStore();
  const [appReady, setAppReady] = useState(false);

  /** Initial setup: API defaults + global error handler */
  useEffect(() => {
    setAPIDefaults();
    setupAuthorizationHeader();
    setupGlobalErrorHandling();
    initDatabase();
  }, []);

  /** Load user data when authenticated */
  useEffect(() => {
    if (fontsLoaded && isAuthenticated && isWorkspaceSelected) {
      fetchUserData();
      initNotifications();
    }
  }, [fontsLoaded, isAuthenticated, isWorkspaceSelected]);

  /** Hide splash when ready */
  useEffect(() => {
    if (fontsLoaded && !loading) {
      setAppReady(true);
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, loading]);

  /** Token refresh loop */
  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    const interval = setInterval(async () => {
      if (cancelled) return;
      if (await isTokenExpiringSoon()) {
        await refreshIdToken();
      }
    }, 90000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  return { isAuthenticated, appReady };
}

async function initNotifications() {
  const handler = NotificationFactory.getHandler();
  const token = await handler.registerDevice();
  if (!token) return;

  const platform = PLATFORM.IS_WEB ? "WEB" : "MOBILE";
  await sendTokenToBackend({ token, platform });
}

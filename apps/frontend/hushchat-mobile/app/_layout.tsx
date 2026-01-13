import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, Redirect, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-worklets";
import "@/global.css";
import Toast from "react-native-toast-message";
import { PLATFORM } from "@/constants/platformConstants";
import { toastConfig } from "@/utils/config/toastConfig";
import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "@/query/config/queryClientConfig";
import { getNavigationTheme } from "@/utils/commonUtils";
import { ModalProvider } from "@/context/modal-context";
import { useAppTheme } from "@/hooks/useAppTheme";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ConversationNotificationsProvider } from "@/contexts/ConversationNotificationsContext";
import { WebSocketProvider } from "@/contexts/WebSocketContext";

import { AUTH_LOGIN_PATH } from "@/constants/routes";
import { useAppInitialization } from "@/hooks/useAppInitialization";
import { useRefreshOnAppStateChange } from "@/hooks/useRefreshOnAppStateChange";

const TOAST_OFFSET_IOS = 60;
const TOAST_OFFSET_ANDROID = 40;

export default function RootLayout() {
  const { colorScheme } = useAppTheme();

  const [fontsLoaded] = useFonts({
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
  });
  const queryClient = createQueryClient();
  const { isAuthenticated, appReady } = useAppInitialization(fontsLoaded);

  return (
    <GestureHandlerRootView>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider value={getNavigationTheme(colorScheme)}>
            <WebSocketProvider>
              <AppLifecycleManager />
              <ConversationNotificationsProvider>
                <ModalProvider>
                  <Gate ready={appReady} isAuthenticated={isAuthenticated} />
                  <Toast
                    config={toastConfig}
                    topOffset={PLATFORM.IS_IOS ? TOAST_OFFSET_IOS : TOAST_OFFSET_ANDROID}
                  />
                  <StatusBar style="auto" />
                </ModalProvider>
              </ConversationNotificationsProvider>
            </WebSocketProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/** Central guard: decides where the user can go before screens mount */
function Gate({ ready, isAuthenticated }: { ready: boolean; isAuthenticated: boolean }) {
  const segments = useSegments();
  const inAuthGroup = segments[0] === "(auth)";

  return (
    <>
      {ready && !isAuthenticated && !inAuthGroup && <Redirect href={AUTH_LOGIN_PATH} />}

      <Stack initialRouteName="index" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="conversations/conversation-info/[id]/index" />
        <Stack.Screen name="conversations/conversation-info/[id]/group-settings" />
        <Stack.Screen name="conversations/forward-panel" />
        <Stack.Screen name="conversations/[conversationId]/messages/[messageId]/read-by" />
        <Stack.Screen name="conversation-threads" />
        <Stack.Screen name="search-view" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="+not-found" />
        <Stack.Screen name="invite/[inviteCode]" options={{ title: "Processing Invite" }} />
        <Stack.Screen name="group-conversation/select-participants" />
        <Stack.Screen name="group-conversation/configure" />
        <Stack.Screen name="settings/contact" />
        <Stack.Screen name="settings/invite" />
        <Stack.Screen name="settings/change-workspace" />
        <Stack.Screen name="mentioned-messages-view" />
      </Stack>
    </>
  );
}

function AppLifecycleManager() {
  useRefreshOnAppStateChange();
  return null;
}

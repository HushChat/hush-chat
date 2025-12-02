import { AUTH_LOGIN_PATH, AUTH_WORKSPACE_FORM_PATH, CHATS_PATH } from "@/constants/routes";
import { useAuthStore } from "@/store/auth/authStore";
import { Redirect } from "expo-router";
import { View, ActivityIndicator, StyleSheet } from "react-native";

export default function Index() {
  const { isAuthenticated, hasHydrated, isWorkspaceSelected } = useAuthStore();

  if (!hasHydrated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isAuthenticated && isWorkspaceSelected) {
    return <Redirect href={CHATS_PATH} />;
  } else if (!isWorkspaceSelected) {
    return <Redirect href={AUTH_WORKSPACE_FORM_PATH} />;
  }

  return <Redirect href={AUTH_LOGIN_PATH} />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

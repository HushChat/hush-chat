import { AUTH_WORKSPACE_FORM_PATH, CHATS_PATH } from '@/constants/routes';
import { useAuthStore } from '@/store/auth/authStore';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { isAuthenticated, hasHydrated } = useAuthStore();

  if (!hasHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href={CHATS_PATH} />;
  }

  return <Redirect href={AUTH_WORKSPACE_FORM_PATH} />;
}

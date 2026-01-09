import { Stack } from "expo-router";

export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="contact" />
      <Stack.Screen name="invite" />
      <Stack.Screen name="users" />
      <Stack.Screen name="change-workspace" />
    </Stack>
  );
}
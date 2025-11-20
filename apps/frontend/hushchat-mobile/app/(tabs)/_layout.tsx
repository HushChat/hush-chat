import React from "react";
import { Platform } from "react-native";
import { INavigationItem } from "@/types/navigation/types";
import getTabLayoutByPlatform from "@/components/tab-layouts/TabLayoutFactory";
import { useAuthStore } from "@/store/auth/authStore";
import { Redirect } from "expo-router";
import { AUTH_WORKSPACE_FORM_PATH } from "@/constants/routes";

const navigationItems: INavigationItem[] = [
  {
    key: 1,
    name: "conversations",
    route: "/conversations" as const,
    title: "Conversations",
    icon: "chatbox-ellipses",
  },
  {
    key: 3,
    name: "call-history",
    route: "/call-history" as const,
    title: "Calls",
    icon: "call",
  },
  {
    key: 2,
    name: "profile",
    route: "/profile" as const,
    title: "Profile",
    icon: "person-circle",
  },
];

export default function TabLayout() {
  const { isWorkspaceSelected } = useAuthStore();

  if (!isWorkspaceSelected) {
    return <Redirect href={AUTH_WORKSPACE_FORM_PATH} />;
  }

  const TabLayout = getTabLayoutByPlatform(Platform.OS);

  return <TabLayout navigationItems={navigationItems} />;
}

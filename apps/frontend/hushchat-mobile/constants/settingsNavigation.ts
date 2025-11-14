
import type { INavigationItem } from "@/types/navigation/types"
import type { Href } from "expo-router"

export const MENU_ITEMS: INavigationItem[] = [
  {
    key: 1,
    name: "contact-us",
    title: "Contact Us",
    icon: "person-circle-outline",
    route: "/settings/contact-us" as Href,
  },
];

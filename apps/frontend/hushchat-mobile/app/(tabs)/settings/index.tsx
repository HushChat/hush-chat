import React from "react";
import { PLATFORM } from "@/constants/platformConstants";
import SettingsMenuMobile from "@/components/SettingsMenu";
import SettingsPlaceholderWeb from "@/components/SettingsPlaceholderWeb";

export default function SettingsEntry() {
  if (PLATFORM.IS_WEB) {
    return <SettingsPlaceholderWeb />;
  }

  return <SettingsMenuMobile />;
}

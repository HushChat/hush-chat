import { View } from "react-native";
import { AppText } from "@/components/AppText";
import { KEYBOARD_SHORTCUTS, ShortcutDefinition } from "@/constants/keyboardShortcuts";

function groupByCategory(shortcuts: ShortcutDefinition[]): Record<string, ShortcutDefinition[]> {
  return shortcuts.reduce(
    (acc, shortcut) => {
      const cat = shortcut.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(shortcut);
      return acc;
    },
    {} as Record<string, ShortcutDefinition[]>
  );
}

function formatKeybinding(shortcut: ShortcutDefinition): string {
  const isMac =
    typeof navigator !== "undefined" && navigator.platform?.toUpperCase().includes("MAC");
  const parts: string[] = [];

  if (shortcut.metaOrCtrl) parts.push(isMac ? "\u2318" : "Ctrl");
  if (shortcut.shift) parts.push(isMac ? "\u21E7" : "Shift");
  if (shortcut.alt) parts.push(isMac ? "\u2325" : "Alt");
  parts.push(shortcut.key === "Escape" ? "Esc" : shortcut.key.toUpperCase());

  return parts.join(isMac ? " " : " + ");
}

export default function KeyboardShortcutsHelp() {
  const categories = groupByCategory(KEYBOARD_SHORTCUTS);

  return (
    <View className="gap-4">
      {Object.entries(categories).map(([category, shortcuts]) => (
        <View key={category}>
          <AppText className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
            {category}
          </AppText>
          {shortcuts.map((shortcut) => (
            <View key={shortcut.action} className="flex-row justify-between items-center py-1.5">
              <AppText className="text-sm text-gray-800 dark:text-gray-200">
                {shortcut.label}
              </AppText>
              <View className="flex-row gap-1">
                {formatKeybinding(shortcut)
                  .split(" + ")
                  .map((part, i) => (
                    <View key={i} className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">
                      <AppText className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                        {part}
                      </AppText>
                    </View>
                  ))}
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

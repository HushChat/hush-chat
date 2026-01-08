/**
 * Normalizes a keyboard event into a consistent string format.
 * Examples: "mod+k", "mod+shift+k", "esc", "enter"
 */
export function normalizeKeyCombo(event: KeyboardEvent): string {
  const parts: string[] = [];

  if (event.ctrlKey || event.metaKey) {
    parts.push("mod");
  }
  if (event.shiftKey) {
    parts.push("shift");
  }
  if (event.altKey) {
    parts.push("alt");
  }

  let key = event.key.toLowerCase();

  const keyMap: Record<string, string> = {
    escape: "esc",
    " ": "space",
    arrowup: "up",
    arrowdown: "down",
    arrowleft: "left",
    arrowright: "right",
  };

  key = keyMap[key] || key;

  if (!["control", "meta", "shift", "alt"].includes(key)) {
    parts.push(key);
  }

  return parts.join("+");
}

/**
 * Checks if the event target is an input element.
 */
export function isInputElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;

  const tagName = target.tagName.toLowerCase();
  return (
    tagName === "input" ||
    tagName === "textarea" ||
    target.isContentEditable
  );
}

/**
 * Normalizes a hotkey definition string.
 * Accepts: "ctrl+k", "cmd+k", "Ctrl+K", "mod+k"
 * Returns: "mod+k"
 */
export function normalizeHotkeyDefinition(hotkey: string): string {
  return hotkey
    .toLowerCase()
    .replace("ctrl", "mod")
    .replace("cmd", "mod")
    .split("+")
    .sort((a, b) => {
      const order = ["mod", "shift", "alt"];
      const aIndex = order.indexOf(a);
      const bIndex = order.indexOf(b);
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    })
    .join("+");
}
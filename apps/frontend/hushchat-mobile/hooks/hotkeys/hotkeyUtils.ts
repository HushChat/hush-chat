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

  const key = event.key.toLowerCase();

  if (!["control", "meta", "shift", "alt"].includes(key)) {
    parts.push(key);
  }

  return parts.join("+");
}

export function isInputElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;

  const tagName = target.tagName.toLowerCase();
  return (
    tagName === "input" ||
    tagName === "textarea" ||
    target.isContentEditable
  );
}

export function normalizeHotkeyDefinition(hotkey: string): string {
  return hotkey
    .toLowerCase()
    .replace("ctrl", "mod")
    .replace("cmd", "mod")
}
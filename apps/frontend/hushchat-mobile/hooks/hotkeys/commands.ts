export const Commands = {
  OPEN_SEARCH: "OPEN_SEARCH",
} as const;

export type CommandId = (typeof Commands)[keyof typeof Commands];

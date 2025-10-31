import { useTapGesture } from "./useTapGesture";

export function useDoubleTapGesture(
  args: Omit<Parameters<typeof useTapGesture>[0], "numberOfTaps">
) {
  return useTapGesture({ ...args, numberOfTaps: 2 });
}

import { Easing } from 'react-native-reanimated';
import { PLATFORM } from '@/constants/platformConstants';

export const DEBOUNCE_DELAY = 500;
export const RESIZE_ANIM_MS = 180;
export const RESET_ANIM_MS = 220;
export const ANIM_EASING = Easing.out(Easing.quad);

export const WEB_MIN_CONTAINER_PX = 48;
export const WEB_MAX_CONTAINER_PX = 120;

export const SEND_ICON_SIZE = PLATFORM.IS_WEB ? 24 : 22;
export const SEND_ICON_GAP = PLATFORM.IS_WEB ? 10 : 8;
export const ICON_RIGHT_WEB_PX = 12;
export const ICON_RIGHT_NATIVE_PX = 10;

export const INPUT_FONT_SIZE = 16;
export const INPUT_PADDING_RIGHT_PX = 12;
export const WEB_LINE_HEIGHT_ADJUST = 2;
export const DROPDOWN_OFFSET_PX = 8;

export const COLOR_PLACEHOLDER = '#9CA3AF';
export const COLOR_ACTIVITY = '#9CA3AF';

export const SCROLLBAR_GUTTER = 'stable';
export const RIGHT_ICON_GUTTER =
  (PLATFORM.IS_WEB ? ICON_RIGHT_WEB_PX : ICON_RIGHT_NATIVE_PX) + SEND_ICON_GAP + SEND_ICON_SIZE;

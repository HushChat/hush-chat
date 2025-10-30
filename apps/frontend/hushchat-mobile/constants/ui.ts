/**
 * Copyright (c) 2025, HushChat (https://gethush.chat)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { PLATFORM } from "@/constants/platformConstants";

const DEFAULT_MOBILE_ACTIVE_OPACITY = 0.7;
const DEFAULT_DESKTOP_ACTIVE_OPACITY = 1;

export const DEFAULT_ACTIVE_OPACITY = PLATFORM.IS_WEB
  ? DEFAULT_DESKTOP_ACTIVE_OPACITY
  : DEFAULT_MOBILE_ACTIVE_OPACITY;
export const DEFAULT_HIT_SLOP = 10;

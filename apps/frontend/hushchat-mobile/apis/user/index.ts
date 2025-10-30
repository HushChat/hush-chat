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

import { USER_API_ENDPOINTS } from "@/constants/apiConstants";
import axios from "axios";
import { getAPIErrorMsg } from "@/utils/commonUtils";
import { DeviceToken } from "@/types/user/types";

export const getUserInfo = async () => {
  try {
    const response = await axios.get(USER_API_ENDPOINTS.WHO_AM_I);
    return { data: response.data };
  } catch (error: unknown) {
    return { error: getAPIErrorMsg(error) };
  }
};

export const blockUser = async (blockedUserId: number) => {
  try {
    const response = await axios.post(
      USER_API_ENDPOINTS.BLOCK_USER(blockedUserId),
    );
    return { data: response.data };
  } catch (error: unknown) {
    return { error: getAPIErrorMsg(error) };
  }
};

export const unblockUser = async (blockedUserId: number) => {
  try {
    const response = await axios.delete(
      USER_API_ENDPOINTS.UNBLOCK_USER(blockedUserId),
    );
    return { data: response.data };
  } catch (error: unknown) {
    return { error: getAPIErrorMsg(error) };
  }
};

export const updateUser = async (user: {
  id: string;
  firstName: string;
  lastName: string;
  imageFileName: string | null;
}) => {
  try {
    const response = await axios.put(USER_API_ENDPOINTS.UPDATE, {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      imageIndexedName: user.imageFileName,
    });
    return { data: response.data };
  } catch (error: unknown) {
    return { error: getAPIErrorMsg(error) };
  }
};

export const getAllUsers = async (
  keyword: string = "",
  excludeUsersInConversationId?: number,
  page: number = 0,
  size: number = 20,
) => {
  try {
    const response = await axios.get(USER_API_ENDPOINTS.GET, {
      params: { keyword, excludeUsersInConversationId, page, size },
    });
    return { data: response.data };
  } catch (error: unknown) {
    return { error: getAPIErrorMsg(error) };
  }
};

export const sendTokenToBackend = async (device: DeviceToken) => {
  try {
    const response = await axios.post(USER_API_ENDPOINTS.SAVE_TOKEN, device);
    return { data: response.data };
  } catch (error: unknown) {
    return { error: getAPIErrorMsg(error) };
  }
};

import { USER_API_ENDPOINTS, WORKSPACE_ENDPOINTS } from "@/constants/apiConstants";
import axios, { AxiosError } from "axios";
import { getAPIErrorMsg } from "@/utils/commonUtils";
import { DeviceToken } from "@/types/user/types";
import { getAllTokens } from "@/utils/authUtils";
import { chatUserStatus } from "@/types/chat/types";
import { ErrorResponse } from "@/utils/apiErrorUtils";

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
    const response = await axios.post(USER_API_ENDPOINTS.BLOCK_USER(blockedUserId));
    return { data: response.data };
  } catch (error: unknown) {
    return { error: getAPIErrorMsg(error) };
  }
};

export const unblockUser = async (blockedUserId: number) => {
  try {
    const response = await axios.delete(USER_API_ENDPOINTS.UNBLOCK_USER(blockedUserId));
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
  size: number = 20
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

export const changePassword = async (oldPassword: string, newPassword: string) => {
  try {
    const { accessToken } = await getAllTokens();
    const response = await axios.post(USER_API_ENDPOINTS.CHANGE_PASSWORD, {
      oldPassword,
      newPassword,
      accessToken,
    });
    return { data: response.data };
  } catch (error: unknown) {
    return { error: getAPIErrorMsg(error) };
  }
};

export const getUserWorkspaces = async () => {
  try {
    const response = await axios.get(WORKSPACE_ENDPOINTS.GET);
    return response.data;
  } catch (error: unknown) {
    return { error: getAPIErrorMsg(error) };
  }
};

export const updateUserAvailabilityStatus = async (status: chatUserStatus) => {
  try {
    const response = await axios.patch(
      USER_API_ENDPOINTS.CHANGE_AVAILABILITY_STATUS,
      {},
      {
        params: { status },
      }
    );
    return { data: response.data };
  } catch (error: unknown) {
    return { error: getAPIErrorMsg(error) };
  }
};

export const getUserProfileImage = async (userId: number) => {
  try {
    const response = await axios.get(USER_API_ENDPOINTS.GET_USER_PROFILE_IMAGE(userId));
    return { data: { signedImageUrl: response.data.url } };
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return { error: axiosError?.response?.data?.error || axiosError?.message };
  }
};

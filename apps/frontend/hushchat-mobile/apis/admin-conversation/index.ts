import { ADMIN_CONVERSATION_ENDPOINTS } from "@/constants/apiConstants";
import axios from "axios";
import { getAPIErrorMsg } from "@/utils/commonUtils";

export interface AdminGroupListItem {
  id: number;
  name: string;
  signedImageUrl: string | null;
  disabled: boolean;
}

export const getAdminGroups = async (keyword: string = "", page: number = 0, size: number = 20) => {
  try {
    const response = await axios.get(ADMIN_CONVERSATION_ENDPOINTS.GROUPS, {
      params: { keyword, page, size },
    });
    return { data: response.data };
  } catch (error: unknown) {
    return { error: getAPIErrorMsg(error) };
  }
};

export const toggleGroupDisabled = async (conversationId: number, disabled: boolean) => {
  try {
    const response = await axios.patch(
      ADMIN_CONVERSATION_ENDPOINTS.TOGGLE_GROUP_DISABLED(conversationId),
      { disabled }
    );
    return { data: response.data };
  } catch (error: unknown) {
    return { error: getAPIErrorMsg(error) };
  }
};

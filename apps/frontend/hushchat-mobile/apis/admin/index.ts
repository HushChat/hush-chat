import { WORKSPACE_ADMIN_ENDPOINTS } from "@/constants/apiConstants";
import axios from "axios";
import { getAPIErrorMsg } from "@/utils/commonUtils";

export const getAllWorkspaceUsers = async (
  keyword: string = "",
  page: number = 0,
  size: number = 20
) => {
  try {
    const response = await axios.get(WORKSPACE_ADMIN_ENDPOINTS.GET_ALL_USERS, {
      params: { keyword, page, size },
    });
    return { data: response.data };
  } catch (error: unknown) {
    return { error: getAPIErrorMsg(error) };
  }
};

import axios from "axios";
import { VERSION_CHECK } from "@/constants/apiConstants";
import { getAPIErrorMsg } from "@/utils/commonUtils";
import { BuildConstantKeys, getBuildConstant } from "@/constants/build-constants";

export async function checkBackendVersion() {
  try {
    const response = await axios.get(VERSION_CHECK, {
      params: {
        secretKey: getBuildConstant(BuildConstantKeys.HEALTH_CHECK_API_KEY),
      },
    });

    const latestCommit = response.data.commitId;

    return { latestCommit };
  } catch (error: unknown) {
    return {
      error: getAPIErrorMsg(error),
    };
  }
}

import Constants from "expo-constants";
import { Linking, Platform } from "react-native";
import { ToastUtils } from "@/utils/toastUtils";
import { checkBackendVersion } from "@/apis/version";
import { BuildConstantKeys, getBuildConstant } from "@/constants/build-constants";

export async function checkCommitVersion() {
  try {
    // @ts-expect-error Expo commit ID is injected at build time
    const currentCommit = Constants.expoConfig.extra.commitId;

    const response = await checkBackendVersion();
    if (response.error) {
      return { status: "error" };
    }

    const { latestCommit } = response.latestCommit();

    if (currentCommit !== latestCommit) {
      return { status: "update_needed", latestCommit };
    }
    return { status: "up_to_date" };
  } catch {
    return { status: "error" };
  }
}

function redirectToStore() {
  if (Platform.OS === "ios") {
    const appStoreId = getBuildConstant(BuildConstantKeys.APP_STORE_ID);
    const url = `https://apps.apple.com/app/id${appStoreId}`;
    Linking.openURL(url);
  } else if (Platform.OS === "android") {
    const packageName = getBuildConstant(BuildConstantKeys.PLAY_STORE_PACKAGE_NAME);
    const url = `https://play.google.com/store/apps/details?id=${packageName}`;
    Linking.openURL(url);
  }
}

export async function mobileBuildCommitCheck() {
  if (!__DEV__ && (Platform.OS === "ios" || Platform.OS === "android")) {
    const result = await checkCommitVersion();

    if (result.status === "update_needed") {
      ToastUtils.warn("A new version of the app is available. Please update to continue.");
      setTimeout(() => {
        redirectToStore();
      }, 3000);
    }
  }
}

import { PLATFORM } from "@/constants/platformConstants";
import { logInfo } from "@/utils/logger";

export async function requestCallPermissions(isVideo: boolean): Promise<boolean> {
  if (PLATFORM.IS_WEB) {
    return requestWebPermissions(isVideo);
  }
  return requestNativePermissions(isVideo);
}

async function requestWebPermissions(isVideo: boolean): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: isVideo,
    });
    // Stop the test stream immediately
    stream.getTracks().forEach((track) => track.stop());
    return true;
  } catch {
    logInfo("Web media permissions denied");
    return false;
  }
}

async function requestNativePermissions(isVideo: boolean): Promise<boolean> {
  try {
    const { Camera } = require("expo-camera");

    const { Audio } = require("expo-av");

    const audioResult = await Audio.requestPermissionsAsync();
    if (!audioResult.granted) {
      logInfo("Audio permission denied");
      return false;
    }

    if (isVideo) {
      const cameraResult = await Camera.requestCameraPermissionsAsync();
      if (!cameraResult.granted) {
        logInfo("Camera permission denied");
        return false;
      }
    }

    return true;
  } catch {
    logInfo("Error requesting native permissions");
    return false;
  }
}

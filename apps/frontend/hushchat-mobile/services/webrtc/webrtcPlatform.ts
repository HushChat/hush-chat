import { PLATFORM } from "@/constants/platformConstants";

export type WebRTCApis = {
  RTCPeerConnection: typeof RTCPeerConnection;
  RTCSessionDescription: typeof RTCSessionDescription;
  RTCIceCandidate: typeof RTCIceCandidate;
  mediaDevices: MediaDevices;
};

let webrtcApis: WebRTCApis | null = null;

export function getWebRTCApis(): WebRTCApis {
  if (webrtcApis) return webrtcApis;

  if (PLATFORM.IS_WEB) {
    webrtcApis = {
      RTCPeerConnection: window.RTCPeerConnection,
      RTCSessionDescription: window.RTCSessionDescription,
      RTCIceCandidate: window.RTCIceCandidate,
      mediaDevices: navigator.mediaDevices,
    };
  } else {
    const rnWebRTC = require("react-native-webrtc");
    webrtcApis = {
      RTCPeerConnection: rnWebRTC.RTCPeerConnection,
      RTCSessionDescription: rnWebRTC.RTCSessionDescription,
      RTCIceCandidate: rnWebRTC.RTCIceCandidate,
      mediaDevices: rnWebRTC.mediaDevices,
    };
  }

  return webrtcApis;
}

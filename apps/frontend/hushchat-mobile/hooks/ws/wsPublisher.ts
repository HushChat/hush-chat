import { TypingIndicatorWSData, UserActivityWSSubscriptionData } from "@/types/ws/types";
import { CallSignalPayload } from "@/types/call/callSignaling";
import { logInfo } from "@/utils/logger";
import { getDeviceId } from "@/utils/deviceIdUtils";
import { WS_DESTINATIONS } from "@/constants/apiConstants";
import {
  DEVICE_ID_KEY,
  HEADER_CONTENT_LENGTH,
  HEADER_CONTENT_TYPE,
  HEADER_DESTINATION,
  HEADER_DEVICE_TYPE,
  TITLES,
} from "@/constants/constants";
import { DeviceType } from "@/types/chat/types";

const encoder = new TextEncoder();

const canPublish = (ws: WebSocket | null, action: string): boolean => {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    logInfo(`WebSocket not connected, cannot publish ${action}`);
    return false;
  }
  return true;
};

// Build STOMP SEND frame
export const buildStompSendFrame = (
  destination: string,
  body: string,
  deviceType: string,
  deviceId: string
): Uint8Array => {
  const sendFrameBytes = [
    ...Array.from(encoder.encode("SEND\n")),
    ...Array.from(encoder.encode(`${HEADER_DESTINATION}:${destination}\n`)),
    ...Array.from(encoder.encode(`${DEVICE_ID_KEY}:${deviceId}\n`)),
    ...Array.from(encoder.encode(`${HEADER_DEVICE_TYPE}:${deviceType}\n`)),
    ...Array.from(encoder.encode(`${HEADER_CONTENT_LENGTH}:${body.length}\n`)),
    ...Array.from(encoder.encode(`${HEADER_CONTENT_TYPE}:application/json\n`)),
    0x0a,
    ...Array.from(encoder.encode(body)),
    0x00,
  ];

  return new Uint8Array(sendFrameBytes);
};

// Generic publish function
const publishToWebSocket = (
  ws: WebSocket | null,
  destination: string,
  data: UserActivityWSSubscriptionData | TypingIndicatorWSData | CallSignalPayload,
  action: string
): boolean => {
  if (!canPublish(ws, action)) {
    logInfo(`[CALL DEBUG] canPublish returned false for ${action}`);
    return false;
  }

  try {
    const body = JSON.stringify(data);
    const deviceType = (data as any).deviceType ?? DeviceType.UNKNOWN;
    const deviceId = (data as any).deviceId ?? getDeviceId();
    logInfo(`[CALL DEBUG] publishToWebSocket: sending ${action} to ${destination}`, {
      bodyLength: body.length,
      deviceType,
      deviceIdType: typeof deviceId,
    });
    ws!.send(buildStompSendFrame(destination, body, deviceType, deviceId).buffer);
    logInfo(`[CALL DEBUG] ws.send completed for ${action}`);
    return true;
  } catch (error) {
    logInfo(`Error publishing ${action}:`, error);
    return false;
  }
};

export const publishUserActivity = (
  ws: WebSocket | null,
  data: UserActivityWSSubscriptionData
): boolean => {
  return publishToWebSocket(
    ws,
    WS_DESTINATIONS.SUBSCRIBED_CONVERSATIONS,
    data,
    TITLES.USER_ACTIVITY
  );
};

export const publishTypingStatus = (ws: WebSocket | null, data: TypingIndicatorWSData): boolean => {
  return publishToWebSocket(ws, WS_DESTINATIONS.TYPING, data, TITLES.TYPING_ACTIVITY);
};

export const publishCallSignal = (ws: WebSocket | null, data: CallSignalPayload): boolean => {
  return publishToWebSocket(ws, WS_DESTINATIONS.CALL_SIGNAL, data, "call signal");
};

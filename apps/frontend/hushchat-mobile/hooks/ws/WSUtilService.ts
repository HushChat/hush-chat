import { logDebug, logInfo } from "@/utils/logger";
import { decodeJWTToken } from "@/utils/authUtils";
import { INVALID_ACCESS_TOKEN_ERROR } from "@/constants/wsConstants";
import { DeviceType } from "@/types/chat/types";

interface DecodedJWTPayload {
  sub: string;
  email: string;
  exp: number;
  iat: number;
  custom_user_type?: string;
  custom_tenant?: string;

  [key: string]: any;
}
export const subscribeToTopic = (
  ws: WebSocket,
  destination: string,
  subscriptionId: string,
  deviceType: DeviceType
) => {
  const fullDestination = `/user${destination}`;

  const subscribeFrameBytes = [
    ...Array.from(new TextEncoder().encode("SUBSCRIBE\n")),
    ...Array.from(new TextEncoder().encode(`destination:${fullDestination}\n`)),
    ...Array.from(new TextEncoder().encode(`id:${subscriptionId}\n`)),
    ...Array.from(new TextEncoder().encode(`Device-Type:${deviceType}\n`)),
    0x0a, // empty line
    0x00, // null terminator
  ];

  const subscribeArray = new Uint8Array(subscribeFrameBytes);
  ws.send(subscribeArray.buffer);
  logDebug(`Subscribed to topic: ${fullDestination}`);
};

export const extractTopicFromMessage = (messageData: string): string | null => {
  const lines = messageData.split("\n");
  const destinationLine = lines.find((line) => line.startsWith("destination:"));

  if (destinationLine) {
    return destinationLine.replace("destination:", "").trim();
  }

  return null;
};

const decodeAndValidateToken = (
  tokenToDecode: string
): {
  isValid: boolean;
  decodedToken?: DecodedJWTPayload;
  error?: string;
} => {
  try {
    const decoded = decodeJWTToken(tokenToDecode);
    const currentTime = new Date();
    const expiryTime = new Date(decoded.exp * 1000);

    return {
      isValid: expiryTime.getTime() > currentTime.getTime(),
    };
  } catch {
    return {
      isValid: false,
      error: INVALID_ACCESS_TOKEN_ERROR,
    };
  }
};

export const validateToken = (token: string): boolean => {
  const { isValid, error } = decodeAndValidateToken(token);

  if (!isValid && error) {
    logInfo("Token validation failed:", error);
  }

  return isValid;
};

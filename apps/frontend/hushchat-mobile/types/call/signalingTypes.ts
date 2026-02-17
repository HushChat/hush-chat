export interface CallSignalingPayload {
  conversationId: number;
  callLogId: number;
  callerId: number;
  calleeId: number;
  type: "offer" | "answer" | "ice-candidate" | "end" | "rejected" | "busy";
  sdp?: string;
  candidate?: string;
  isVideo?: boolean;
  callerName?: string;
  callerEmail?: string;
  reason?: string;
}

export enum CallStatus {
  IDLE = "IDLE",
  OUTGOING_RINGING = "OUTGOING_RINGING",
  INCOMING_RINGING = "INCOMING_RINGING",
  CONNECTING = "CONNECTING",
  CONNECTED = "CONNECTED",
  ENDED = "ENDED",
}

export interface ActiveCallState {
  status: CallStatus;
  callLogId: number | null;
  conversationId: number | null;
  remoteUserId: number | null;
  remoteUserName: string | null;
  isVideo: boolean;
  isInitiator: boolean;
  callStartedAt: number | null;
  isMuted: boolean;
  isSpeakerOn: boolean;
  remoteSdp: string | null;
}

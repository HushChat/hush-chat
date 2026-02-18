export const CallSignalType = {
  OFFER_CALL: "OFFER_CALL",
  INCOMING_CALL: "INCOMING_CALL",
  CALL_ACCEPTED: "CALL_ACCEPTED",
  CALL_REJECTED: "CALL_REJECTED",
  CALL_CANCELLED: "CALL_CANCELLED",
  CALL_ENDED: "CALL_ENDED",
  CALL_TIMEOUT: "CALL_TIMEOUT",
  SDP_OFFER: "SDP_OFFER",
  SDP_ANSWER: "SDP_ANSWER",
  ICE_CANDIDATE: "ICE_CANDIDATE",
  TOGGLE_VIDEO: "TOGGLE_VIDEO",
  TOGGLE_AUDIO: "TOGGLE_AUDIO",
} as const;

export type CallSignalType = (typeof CallSignalType)[keyof typeof CallSignalType];

export interface CallSignalPayload {
  callId: string;
  type: CallSignalType;
  conversationId: number;
  isVideo?: boolean;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  enabled?: boolean;
  // Enriched by backend on INCOMING_CALL
  callerName?: string;
  callerUserId?: number;
  callerImageUrl?: string;
}

export const CallState = {
  IDLE: "IDLE",
  OUTGOING_RINGING: "OUTGOING_RINGING",
  INCOMING_RINGING: "INCOMING_RINGING",
  CONNECTING: "CONNECTING",
  CONNECTED: "CONNECTED",
  ENDED: "ENDED",
} as const;

export type CallState = (typeof CallState)[keyof typeof CallState];

export interface ActiveCallState {
  callId: string;
  conversationId: number;
  callState: CallState;
  isVideo: boolean;
  isLocalAudioEnabled: boolean;
  isLocalVideoEnabled: boolean;
  isRemoteAudioEnabled: boolean;
  isRemoteVideoEnabled: boolean;
  callerName?: string;
  callerUserId?: number;
  callerImageUrl?: string;
  calleeName?: string;
  calleeUserId?: number;
  calleeImageUrl?: string;
  startedAt?: number;
  connectedAt?: number;
}

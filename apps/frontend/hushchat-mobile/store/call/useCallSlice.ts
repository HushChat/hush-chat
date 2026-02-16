import { StateCreator } from "zustand";
import { ActiveCallState, CallStatus } from "@/types/call/signalingTypes";

export interface CallState extends ActiveCallState {
  startOutgoingCall: (params: {
    callLogId: number;
    conversationId: number;
    remoteUserId: number;
    remoteUserName: string;
    isVideo: boolean;
  }) => void;
  receiveIncomingCall: (params: {
    callLogId: number;
    conversationId: number;
    remoteUserId: number;
    remoteUserName: string;
    isVideo: boolean;
    remoteSdp: string;
  }) => void;
  setConnecting: () => void;
  setConnected: () => void;
  toggleMute: () => void;
  toggleSpeaker: () => void;
  endCall: () => void;
  resetCallState: () => void;
}

const initialState: ActiveCallState = {
  status: CallStatus.IDLE,
  callLogId: null,
  conversationId: null,
  remoteUserId: null,
  remoteUserName: null,
  isVideo: false,
  isInitiator: false,
  callStartedAt: null,
  isMuted: false,
  isSpeakerOn: false,
  remoteSdp: null,
};

export const createCallSlice: StateCreator<CallState> = (set): CallState => ({
  ...initialState,

  startOutgoingCall: (params) =>
    set({
      status: CallStatus.OUTGOING_RINGING,
      callLogId: params.callLogId,
      conversationId: params.conversationId,
      remoteUserId: params.remoteUserId,
      remoteUserName: params.remoteUserName,
      isVideo: params.isVideo,
      isInitiator: true,
      callStartedAt: null,
      isMuted: false,
      isSpeakerOn: false,
      remoteSdp: null,
    }),

  receiveIncomingCall: (params) =>
    set({
      status: CallStatus.INCOMING_RINGING,
      callLogId: params.callLogId,
      conversationId: params.conversationId,
      remoteUserId: params.remoteUserId,
      remoteUserName: params.remoteUserName,
      isVideo: params.isVideo,
      isInitiator: false,
      callStartedAt: null,
      isMuted: false,
      isSpeakerOn: false,
      remoteSdp: params.remoteSdp,
    }),

  setConnecting: () =>
    set({
      status: CallStatus.CONNECTING,
    }),

  setConnected: () =>
    set({
      status: CallStatus.CONNECTED,
      callStartedAt: Date.now(),
    }),

  toggleMute: () =>
    set((state) => ({
      isMuted: !state.isMuted,
    })),

  toggleSpeaker: () =>
    set((state) => ({
      isSpeakerOn: !state.isSpeakerOn,
    })),

  endCall: () =>
    set({
      status: CallStatus.ENDED,
    }),

  resetCallState: () => set(initialState),
});

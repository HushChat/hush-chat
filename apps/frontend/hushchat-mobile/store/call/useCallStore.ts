import { create } from "zustand";
import { ActiveCallState, CallState } from "@/types/call/callSignaling";

interface CallStoreState {
  activeCall: ActiveCallState | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
}

interface CallStoreActions {
  initiateCall: (params: {
    callId: string;
    conversationId: number;
    isVideo: boolean;
    calleeName?: string;
    calleeUserId?: number;
    calleeImageUrl?: string;
  }) => void;
  receiveIncomingCall: (params: {
    callId: string;
    conversationId: number;
    isVideo: boolean;
    callerName?: string;
    callerUserId?: number;
    callerImageUrl?: string;
  }) => void;
  setCallState: (callState: CallState) => void;
  handleCallAccepted: () => void;
  handleCallTimeout: () => void;
  toggleLocalAudio: (enabled: boolean) => void;
  toggleLocalVideo: (enabled: boolean) => void;
  toggleRemoteAudio: (enabled: boolean) => void;
  toggleRemoteVideo: (enabled: boolean) => void;
  setLocalStream: (stream: MediaStream | null) => void;
  setRemoteStream: (stream: MediaStream | null) => void;
  resetCallState: () => void;
}

type CallStore = CallStoreState & CallStoreActions;

const initialState: CallStoreState = {
  activeCall: null,
  localStream: null,
  remoteStream: null,
};

export const useCallStore = create<CallStore>()((set) => ({
  ...initialState,

  initiateCall: ({ callId, conversationId, isVideo, calleeName, calleeUserId, calleeImageUrl }) =>
    set({
      activeCall: {
        callId,
        conversationId,
        callState: CallState.OUTGOING_RINGING,
        isVideo,
        isLocalAudioEnabled: true,
        isLocalVideoEnabled: isVideo,
        isRemoteAudioEnabled: true,
        isRemoteVideoEnabled: isVideo,
        calleeName,
        calleeUserId,
        calleeImageUrl,
        startedAt: Date.now(),
      },
    }),

  receiveIncomingCall: ({
    callId,
    conversationId,
    isVideo,
    callerName,
    callerUserId,
    callerImageUrl,
  }) =>
    set({
      activeCall: {
        callId,
        conversationId,
        callState: CallState.INCOMING_RINGING,
        isVideo,
        isLocalAudioEnabled: true,
        isLocalVideoEnabled: isVideo,
        isRemoteAudioEnabled: true,
        isRemoteVideoEnabled: isVideo,
        callerName,
        callerUserId,
        callerImageUrl,
        startedAt: Date.now(),
      },
    }),

  setCallState: (callState) =>
    set((state) => {
      if (!state.activeCall) return state;
      return {
        activeCall: {
          ...state.activeCall,
          callState,
          ...(callState === CallState.CONNECTED ? { connectedAt: Date.now() } : {}),
        },
      };
    }),

  handleCallAccepted: () =>
    set((state) => {
      if (!state.activeCall) return state;
      return {
        activeCall: {
          ...state.activeCall,
          callState: CallState.CONNECTING,
        },
      };
    }),

  handleCallTimeout: () =>
    set((state) => {
      if (!state.activeCall) return state;
      return {
        activeCall: {
          ...state.activeCall,
          callState: CallState.ENDED,
        },
      };
    }),

  toggleLocalAudio: (enabled) =>
    set((state) => {
      if (!state.activeCall) return state;
      return {
        activeCall: { ...state.activeCall, isLocalAudioEnabled: enabled },
      };
    }),

  toggleLocalVideo: (enabled) =>
    set((state) => {
      if (!state.activeCall) return state;
      return {
        activeCall: { ...state.activeCall, isLocalVideoEnabled: enabled },
      };
    }),

  toggleRemoteAudio: (enabled) =>
    set((state) => {
      if (!state.activeCall) return state;
      return {
        activeCall: { ...state.activeCall, isRemoteAudioEnabled: enabled },
      };
    }),

  toggleRemoteVideo: (enabled) =>
    set((state) => {
      if (!state.activeCall) return state;
      return {
        activeCall: { ...state.activeCall, isRemoteVideoEnabled: enabled },
      };
    }),

  setLocalStream: (stream) => set({ localStream: stream }),
  setRemoteStream: (stream) => set({ remoteStream: stream }),

  resetCallState: () => set(initialState),
}));

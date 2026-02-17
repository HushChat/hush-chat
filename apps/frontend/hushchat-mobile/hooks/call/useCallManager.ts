import { useCallback, useEffect, useRef } from "react";
import { useCallStore } from "@/store/call/useCallStore";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { WebRTCService } from "@/services/webrtc/WebRTCService";
import { publishCallSignal } from "@/hooks/ws/wsPublisher";
import { WS_DESTINATIONS } from "@/constants/apiConstants";
import { eventBus } from "@/services/eventBus";
import { CALL_EVENTS } from "@/constants/ws/webSocketEventKeys";
import { CallSignalingPayload, CallStatus } from "@/types/call/signalingTypes";
import { logInfo, logError } from "@/utils/logger";
import { ToastUtils } from "@/utils/toastUtils";
import { useUserStore } from "@/store/user/useUserStore";

const CALL_TIMEOUT_MS = 60000;
const WEBRTC_CONNECT_TIMEOUT_MS = 30000;

export function useCallManager() {
  const { getWebSocket } = useWebSocket();
  const webrtcRef = useRef<WebRTCService | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callLogIdRef = useRef<number>(0);
  const pendingIceCandidatesRef = useRef<string[]>([]);

  const {
    status,
    callLogId,
    conversationId,
    remoteUserId,
    remoteUserName,
    isVideo,
    isInitiator,
    isMuted,
    isSpeakerOn,
    remoteSdp,
    startOutgoingCall,
    receiveIncomingCall,
    setConnecting,
    setConnected,
    toggleMute: toggleMuteStore,
    toggleSpeaker: toggleSpeakerStore,
    endCall: endCallStore,
    resetCallState,
  } = useCallStore();

  const { user } = useUserStore();

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (connectTimeoutRef.current) {
      clearTimeout(connectTimeoutRef.current);
      connectTimeoutRef.current = null;
    }
  }, []);

  const cleanupCall = useCallback(() => {
    clearTimers();
    pendingIceCandidatesRef.current = [];
    if (webrtcRef.current) {
      webrtcRef.current.cleanup();
      webrtcRef.current = null;
    }
    resetCallState();
  }, [clearTimers, resetCallState]);

  const handleEndCall = useCallback(() => {
    const state = useCallStore.getState();
    logInfo("handleEndCall called, current status:", state.status);
    if (state.callLogId && state.callLogId !== 0) {
      const ws = getWebSocket();
      publishCallSignal(ws, WS_DESTINATIONS.CALL_END, {
        callLogId: state.callLogId,
      });
    }

    endCallStore();
    clearTimers();
    if (webrtcRef.current) {
      webrtcRef.current.cleanup();
      webrtcRef.current = null;
    }
    // Reset after a brief delay so the ENDED status can be shown
    setTimeout(() => {
      resetCallState();
    }, 1000);
  }, [getWebSocket, endCallStore, clearTimers, resetCallState]);

  const flushPendingIceCandidates = useCallback(
    async (assignedCallLogId: number) => {
      const pending = [...pendingIceCandidatesRef.current];
      pendingIceCandidatesRef.current = [];
      if (pending.length === 0) return;

      logInfo(`Flushing ${pending.length} buffered ICE candidates`);
      const ws = getWebSocket();
      for (const candidate of pending) {
        await publishCallSignal(ws, WS_DESTINATIONS.CALL_ICE_CANDIDATE, {
          callLogId: assignedCallLogId,
          candidate,
        });
      }
    },
    [getWebSocket]
  );

  const startConnectTimeout = useCallback(() => {
    if (connectTimeoutRef.current) {
      clearTimeout(connectTimeoutRef.current);
    }
    connectTimeoutRef.current = setTimeout(() => {
      const currentStatus = useCallStore.getState().status;
      if (currentStatus === CallStatus.CONNECTING) {
        logInfo("WebRTC connection timeout - failed to connect");
        ToastUtils.error("Connection failed");
        handleEndCall();
      }
    }, WEBRTC_CONNECT_TIMEOUT_MS);
  }, [handleEndCall]);

  const createWebRTCCallbacks = useCallback(
    () => ({
      onIceCandidate: (candidate: string) => {
        const currentId = callLogIdRef.current || useCallStore.getState().callLogId;
        if (!currentId) {
          // Buffer candidates until callLogId is assigned (caller side)
          pendingIceCandidatesRef.current.push(candidate);
          logInfo("ICE candidate buffered, waiting for callLogId");
          return;
        }
        const ws = getWebSocket();
        publishCallSignal(ws, WS_DESTINATIONS.CALL_ICE_CANDIDATE, {
          callLogId: currentId,
          candidate,
        });
      },
      onConnectionStateChange: (state: RTCPeerConnectionState) => {
        logInfo("WebRTC connection state:", state);
        if (state === "connected") {
          // Clear the connect timeout since we're connected
          if (connectTimeoutRef.current) {
            clearTimeout(connectTimeoutRef.current);
            connectTimeoutRef.current = null;
          }
          setConnected();
        } else if (state === "disconnected") {
          reconnectTimerRef.current = setTimeout(() => {
            const currentStatus = useCallStore.getState().status;
            if (currentStatus === CallStatus.CONNECTED) {
              logInfo("WebRTC disconnected for too long, ending call");
              handleEndCall();
            }
          }, 10000);
        } else if (state === "failed") {
          logInfo("WebRTC connection failed, ending call");
          handleEndCall();
        }
      },
      onRemoteStream: (_stream: MediaStream) => {
        logInfo("Remote audio stream received");
        // Audio plays automatically via the peer connection
      },
    }),
    [getWebSocket, setConnected, handleEndCall]
  );

  const initiateCall = useCallback(
    async (targetConversationId: number, remoteUserDisplayName: string, remoteUserIdParam: number) => {
      const currentStatus = useCallStore.getState().status;
      if (currentStatus !== CallStatus.IDLE) {
        ToastUtils.error("You are already in a call");
        return;
      }

      try {
        logInfo("Initiating call to conversation:", targetConversationId);
        const webrtc = new WebRTCService();
        webrtcRef.current = webrtc;

        callLogIdRef.current = 0;

        await webrtc.initialize(createWebRTCCallbacks());
        const sdpOffer = await webrtc.createOffer();
        logInfo("SDP offer created, length:", sdpOffer.length);

        const ws = getWebSocket();
        const sent = await publishCallSignal(ws, WS_DESTINATIONS.CALL_INITIATE, {
          conversationId: targetConversationId,
          sdp: sdpOffer,
          isVideo: false,
        });

        if (!sent) {
          throw new Error("Failed to send call initiation signal");
        }

        startOutgoingCall({
          callLogId: 0,
          conversationId: targetConversationId,
          remoteUserId: remoteUserIdParam,
          remoteUserName: remoteUserDisplayName,
          isVideo: false,
        });

        // Start timeout timer
        timeoutRef.current = setTimeout(() => {
          const state = useCallStore.getState();
          if (
            state.status === CallStatus.OUTGOING_RINGING ||
            state.status === CallStatus.CONNECTING
          ) {
            logInfo("Call timeout - no answer");
            handleEndCall();
            ToastUtils.info("No answer");
          }
        }, CALL_TIMEOUT_MS);
      } catch (error) {
        logError("Failed to initiate call:", error);
        ToastUtils.error("Failed to start call. Check microphone permissions.");
        cleanupCall();
      }
    },
    [getWebSocket, startOutgoingCall, createWebRTCCallbacks, cleanupCall, handleEndCall]
  );

  const acceptCall = useCallback(async () => {
    const state = useCallStore.getState();
    logInfo("acceptCall called, status:", state.status, "callLogId:", state.callLogId, "hasSdp:", !!state.remoteSdp);
    if (state.status !== CallStatus.INCOMING_RINGING || !state.remoteSdp || !state.callLogId) {
      logInfo("acceptCall: preconditions not met, returning");
      return;
    }

    try {
      setConnecting();

      const webrtc = new WebRTCService();
      webrtcRef.current = webrtc;
      callLogIdRef.current = state.callLogId;

      await webrtc.initialize(createWebRTCCallbacks());
      logInfo("WebRTC initialized for callee, processing offer...");
      const sdpAnswer = await webrtc.handleOffer(state.remoteSdp);
      logInfo("SDP answer created, length:", sdpAnswer.length);

      const ws = getWebSocket();
      const sent = await publishCallSignal(ws, WS_DESTINATIONS.CALL_ANSWER, {
        callLogId: state.callLogId,
        sdp: sdpAnswer,
      });

      if (!sent) {
        throw new Error("Failed to send call answer signal");
      }

      logInfo("Call accepted, answer sent for callLogId:", state.callLogId);

      // Start a timeout for the WebRTC connection phase
      startConnectTimeout();
    } catch (error) {
      logError("Failed to accept call:", error);
      ToastUtils.error("Failed to accept call. Check microphone permissions.");
      cleanupCall();
    }
  }, [getWebSocket, setConnecting, createWebRTCCallbacks, cleanupCall, startConnectTimeout]);

  const rejectCall = useCallback(() => {
    const state = useCallStore.getState();
    if (!state.callLogId) return;

    const ws = getWebSocket();
    publishCallSignal(ws, WS_DESTINATIONS.CALL_REJECT, {
      callLogId: state.callLogId,
    });

    cleanupCall();
  }, [getWebSocket, cleanupCall]);

  const toggleMute = useCallback(() => {
    if (webrtcRef.current) {
      webrtcRef.current.toggleMute();
    }
    toggleMuteStore();
  }, [toggleMuteStore]);

  const toggleSpeaker = useCallback(() => {
    toggleSpeakerStore();
    // Speaker routing is handled by the OS on native.
    // On web, this is typically not controllable.
  }, [toggleSpeakerStore]);

  // Listen for call events from the eventBus
  useEffect(() => {
    const handleIncoming = (data: CallSignalingPayload) => {
      const currentStatus = useCallStore.getState().status;
      logInfo("Incoming call signal received, current status:", currentStatus);
      if (currentStatus !== CallStatus.IDLE) {
        // Already in a call - this will be handled by the server as busy
        return;
      }

      receiveIncomingCall({
        callLogId: data.callLogId,
        conversationId: data.conversationId,
        remoteUserId: data.callerId,
        remoteUserName: data.callerName || "Unknown",
        isVideo: data.isVideo || false,
        remoteSdp: data.sdp || "",
      });
    };

    const handleAnswer = async (data: CallSignalingPayload) => {
      const state = useCallStore.getState();
      logInfo("Answer signal received, current status:", state.status, "callLogId:", data.callLogId);
      if (state.status !== CallStatus.OUTGOING_RINGING) return;

      // Update callLogId from server response
      callLogIdRef.current = data.callLogId;
      useCallStore.setState({ callLogId: data.callLogId });

      if (webrtcRef.current) {
        try {
          setConnecting();
          logInfo("Processing answer SDP, length:", data.sdp?.length || 0);
          await webrtcRef.current.handleAnswer(data.sdp || "");
          clearTimers();

          // Start a timeout for the WebRTC connection phase
          startConnectTimeout();

          // Flush any ICE candidates that were buffered before callLogId was assigned
          await flushPendingIceCandidates(data.callLogId);
          logInfo("Answer processed and ICE candidates flushed");
        } catch (error) {
          logError("Failed to handle answer:", error);
          handleEndCall();
        }
      }
    };

    const handleIceCandidate = async (data: CallSignalingPayload) => {
      if (webrtcRef.current && data.candidate) {
        await webrtcRef.current.addIceCandidate(data.candidate);
      }
    };

    const handleEnded = (data: CallSignalingPayload) => {
      const state = useCallStore.getState();
      logInfo("Call ended signal received, status:", state.status, "reason:", data.reason);
      if (state.status === CallStatus.IDLE) return;

      // Handle "answered_elsewhere" - another device answered
      if (data.reason === "answered_elsewhere") {
        if (state.status === CallStatus.INCOMING_RINGING) {
          // We didn't answer - dismiss the incoming call UI
          cleanupCall();
        }
        // If we're CONNECTING/CONNECTED, we ARE the answering device - ignore
        return;
      }

      endCallStore();
      clearTimers();
      if (webrtcRef.current) {
        webrtcRef.current.cleanup();
        webrtcRef.current = null;
      }

      if (data.reason === "timeout") {
        ToastUtils.info("Call was not answered");
      }

      setTimeout(() => {
        resetCallState();
      }, 1000);
    };

    const handleRejected = (_data: CallSignalingPayload) => {
      const state = useCallStore.getState();
      if (state.status === CallStatus.OUTGOING_RINGING || state.status === CallStatus.CONNECTING) {
        endCallStore();
        clearTimers();
        if (webrtcRef.current) {
          webrtcRef.current.cleanup();
          webrtcRef.current = null;
        }
        ToastUtils.info("Call was declined");
        setTimeout(() => {
          resetCallState();
        }, 1000);
      }
    };

    const handleBusy = (_data: CallSignalingPayload) => {
      ToastUtils.info("User is busy on another call");
      cleanupCall();
    };

    eventBus.on(CALL_EVENTS.INCOMING, handleIncoming);
    eventBus.on(CALL_EVENTS.ANSWER, handleAnswer);
    eventBus.on(CALL_EVENTS.ICE_CANDIDATE, handleIceCandidate);
    eventBus.on(CALL_EVENTS.ENDED, handleEnded);
    eventBus.on(CALL_EVENTS.REJECTED, handleRejected);
    eventBus.on(CALL_EVENTS.BUSY, handleBusy);

    return () => {
      eventBus.off(CALL_EVENTS.INCOMING, handleIncoming);
      eventBus.off(CALL_EVENTS.ANSWER, handleAnswer);
      eventBus.off(CALL_EVENTS.ICE_CANDIDATE, handleIceCandidate);
      eventBus.off(CALL_EVENTS.ENDED, handleEnded);
      eventBus.off(CALL_EVENTS.REJECTED, handleRejected);
      eventBus.off(CALL_EVENTS.BUSY, handleBusy);
    };
  }, [
    receiveIncomingCall,
    setConnecting,
    endCallStore,
    resetCallState,
    cleanupCall,
    clearTimers,
    handleEndCall,
    flushPendingIceCandidates,
    startConnectTimeout,
  ]);

  return {
    status,
    callLogId,
    conversationId,
    remoteUserId,
    remoteUserName,
    isVideo,
    isInitiator,
    isMuted,
    isSpeakerOn,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall: handleEndCall,
    toggleMute,
    toggleSpeaker,
  };
}

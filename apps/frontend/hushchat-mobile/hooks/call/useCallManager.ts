import { useEffect, useRef, useCallback } from "react";
import { useCallStore } from "@/store/call/useCallStore";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { eventBus } from "@/services/eventBus";
import { CALL_EVENTS } from "@/constants/ws/webSocketEventKeys";
import { CallSignalPayload, CallSignalType, CallState } from "@/types/call/callSignaling";
import { WebRTCManager } from "@/services/webrtc/webrtcManager";
import { RING_TIMEOUT_MS } from "@/constants/call/callConfig";
import { requestCallPermissions } from "@/hooks/call/useCallPermissions";
import { logInfo } from "@/utils/logger";

export function useCallManager() {
  const { publishCallSignal } = useWebSocket();
  const webrtcRef = useRef<WebRTCManager | null>(null);
  const ringTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearRingTimeout = useCallback(() => {
    if (ringTimeoutRef.current) {
      clearTimeout(ringTimeoutRef.current);
      ringTimeoutRef.current = null;
    }
  }, []);

  const cleanupCall = useCallback(() => {
    clearRingTimeout();
    webrtcRef.current?.cleanup();
    webrtcRef.current = null;
    useCallStore.getState().setLocalStream(null);
    useCallStore.getState().setRemoteStream(null);
  }, [clearRingTimeout]);

  const endAndReset = useCallback(() => {
    cleanupCall();
    // Small delay before resetting so UI can show ENDED state briefly
    setTimeout(() => {
      useCallStore.getState().resetCallState();
    }, 500);
  }, [cleanupCall]);

  const createWebRTCManager = useCallback(() => {
    const manager = new WebRTCManager({
      onRemoteStream: (stream) => {
        useCallStore.getState().setRemoteStream(stream);
      },
      onIceCandidate: (candidate) => {
        const activeCall = useCallStore.getState().activeCall;
        if (!activeCall) return;
        publishCallSignal({
          callId: activeCall.callId,
          type: CallSignalType.ICE_CANDIDATE,
          conversationId: activeCall.conversationId,
          candidate: candidate.toJSON(),
        });
      },
      onConnectionStateChange: (state) => {
        if (state === "connected") {
          useCallStore.getState().setCallState(CallState.CONNECTED);
        } else if (state === "disconnected" || state === "failed") {
          const activeCall = useCallStore.getState().activeCall;
          if (activeCall && activeCall.callState === CallState.CONNECTED) {
            publishCallSignal({
              callId: activeCall.callId,
              type: CallSignalType.CALL_ENDED,
              conversationId: activeCall.conversationId,
            });
            useCallStore.getState().setCallState(CallState.ENDED);
            endAndReset();
          }
        }
      },
    });
    webrtcRef.current = manager;
    return manager;
  }, [publishCallSignal, endAndReset]);

  // Handle incoming signals from eventBus
  const handleSignal = useCallback(
    async (signal: CallSignalPayload) => {
      const store = useCallStore.getState();

      switch (signal.type) {
        case CallSignalType.INCOMING_CALL: {
          // If already in a call, auto-reject
          if (store.activeCall) {
            publishCallSignal({
              callId: signal.callId,
              type: CallSignalType.CALL_REJECTED,
              conversationId: signal.conversationId,
            });
            return;
          }
          store.receiveIncomingCall({
            callId: signal.callId,
            conversationId: signal.conversationId,
            isVideo: signal.isVideo ?? false,
            callerName: signal.callerName,
            callerUserId: signal.callerUserId,
            callerImageUrl: signal.callerImageUrl,
          });
          // Start ring timeout
          ringTimeoutRef.current = setTimeout(() => {
            const current = useCallStore.getState().activeCall;
            if (
              current?.callId === signal.callId &&
              current.callState === CallState.INCOMING_RINGING
            ) {
              publishCallSignal({
                callId: signal.callId,
                type: CallSignalType.CALL_TIMEOUT,
                conversationId: signal.conversationId,
              });
              store.handleCallTimeout();
              endAndReset();
            }
          }, RING_TIMEOUT_MS);
          break;
        }

        case CallSignalType.CALL_ACCEPTED: {
          clearRingTimeout();
          store.handleCallAccepted();
          // Caller side: start WebRTC offer
          try {
            const manager = createWebRTCManager();
            const localStream = await manager.startLocalStream(store.activeCall?.isVideo ?? false);
            store.setLocalStream(localStream);
            manager.createPeerConnection();
            const offer = await manager.createOffer();
            publishCallSignal({
              callId: signal.callId,
              type: CallSignalType.SDP_OFFER,
              conversationId: signal.conversationId,
              sdp: offer,
            });
          } catch (err) {
            logInfo("Error creating WebRTC offer:", err);
            endAndReset();
          }
          break;
        }

        case CallSignalType.CALL_REJECTED: {
          clearRingTimeout();
          store.setCallState(CallState.ENDED);
          endAndReset();
          break;
        }

        case CallSignalType.CALL_CANCELLED: {
          clearRingTimeout();
          store.setCallState(CallState.ENDED);
          endAndReset();
          break;
        }

        case CallSignalType.CALL_ENDED: {
          store.setCallState(CallState.ENDED);
          endAndReset();
          break;
        }

        case CallSignalType.CALL_TIMEOUT: {
          clearRingTimeout();
          store.handleCallTimeout();
          endAndReset();
          break;
        }

        case CallSignalType.SDP_OFFER: {
          // Callee side: received offer, create answer
          try {
            const manager = webrtcRef.current ?? createWebRTCManager();
            if (!store.localStream) {
              const localStream = await manager.startLocalStream(
                store.activeCall?.isVideo ?? false
              );
              store.setLocalStream(localStream);
            }
            manager.createPeerConnection();
            const answer = await manager.createAnswer(signal.sdp!);
            publishCallSignal({
              callId: signal.callId,
              type: CallSignalType.SDP_ANSWER,
              conversationId: signal.conversationId,
              sdp: answer,
            });
          } catch (err) {
            logInfo("Error handling SDP offer:", err);
            endAndReset();
          }
          break;
        }

        case CallSignalType.SDP_ANSWER: {
          try {
            await webrtcRef.current?.handleRemoteAnswer(signal.sdp!);
          } catch (err) {
            logInfo("Error handling SDP answer:", err);
          }
          break;
        }

        case CallSignalType.ICE_CANDIDATE: {
          try {
            await webrtcRef.current?.addIceCandidate(signal.candidate!);
          } catch (err) {
            logInfo("Error adding ICE candidate:", err);
          }
          break;
        }

        case CallSignalType.TOGGLE_AUDIO: {
          store.toggleRemoteAudio(signal.enabled ?? true);
          break;
        }

        case CallSignalType.TOGGLE_VIDEO: {
          store.toggleRemoteVideo(signal.enabled ?? true);
          break;
        }
      }
    },
    [publishCallSignal, clearRingTimeout, createWebRTCManager, endAndReset]
  );

  // Subscribe to call signals
  useEffect(() => {
    eventBus.on(CALL_EVENTS.SIGNAL, handleSignal);
    return () => {
      eventBus.off(CALL_EVENTS.SIGNAL, handleSignal);
    };
  }, [handleSignal]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupCall();
    };
  }, [cleanupCall]);

  // Public actions that UI calls
  const initiateCall = useCallback(
    async (
      conversationId: number,
      isVideo: boolean,
      calleeName?: string,
      calleeUserId?: number,
      calleeImageUrl?: string
    ) => {
      const store = useCallStore.getState();
      if (store.activeCall) return;

      const hasPermissions = await requestCallPermissions(isVideo);
      if (!hasPermissions) return;

      const callId = crypto.randomUUID();

      store.initiateCall({
        callId,
        conversationId,
        isVideo,
        calleeName,
        calleeUserId,
        calleeImageUrl,
      });

      logInfo("[CALL DEBUG] About to publishCallSignal OFFER_CALL", {
        callId,
        conversationId,
        isVideo,
      });

      publishCallSignal({
        callId,
        type: CallSignalType.OFFER_CALL,
        conversationId,
        isVideo,
      })
        .then((result) => {
          logInfo("[CALL DEBUG] publishCallSignal result:", result);
        })
        .catch((err) => {
          logInfo("[CALL DEBUG] publishCallSignal error:", err);
        });

      // Ring timeout for caller
      ringTimeoutRef.current = setTimeout(() => {
        const current = useCallStore.getState().activeCall;
        if (current?.callId === callId && current.callState === CallState.OUTGOING_RINGING) {
          publishCallSignal({
            callId,
            type: CallSignalType.CALL_TIMEOUT,
            conversationId,
          });
          store.handleCallTimeout();
          endAndReset();
        }
      }, RING_TIMEOUT_MS);
    },
    [publishCallSignal, endAndReset]
  );

  const acceptCall = useCallback(async () => {
    const store = useCallStore.getState();
    const call = store.activeCall;
    if (!call || call.callState !== CallState.INCOMING_RINGING) return;

    const hasPermissions = await requestCallPermissions(call.isVideo);
    if (!hasPermissions) return;

    clearRingTimeout();

    // Setup WebRTC before accepting
    const manager = createWebRTCManager();
    const localStream = await manager.startLocalStream(call.isVideo);
    store.setLocalStream(localStream);
    store.handleCallAccepted();

    publishCallSignal({
      callId: call.callId,
      type: CallSignalType.CALL_ACCEPTED,
      conversationId: call.conversationId,
    });
  }, [publishCallSignal, clearRingTimeout, createWebRTCManager]);

  const rejectCall = useCallback(() => {
    const call = useCallStore.getState().activeCall;
    if (!call) return;

    clearRingTimeout();
    publishCallSignal({
      callId: call.callId,
      type: CallSignalType.CALL_REJECTED,
      conversationId: call.conversationId,
    });
    useCallStore.getState().setCallState(CallState.ENDED);
    endAndReset();
  }, [publishCallSignal, clearRingTimeout, endAndReset]);

  const cancelCall = useCallback(() => {
    const call = useCallStore.getState().activeCall;
    if (!call) return;

    clearRingTimeout();
    publishCallSignal({
      callId: call.callId,
      type: CallSignalType.CALL_CANCELLED,
      conversationId: call.conversationId,
    });
    useCallStore.getState().setCallState(CallState.ENDED);
    endAndReset();
  }, [publishCallSignal, clearRingTimeout, endAndReset]);

  const endCall = useCallback(() => {
    const call = useCallStore.getState().activeCall;
    if (!call) return;

    publishCallSignal({
      callId: call.callId,
      type: CallSignalType.CALL_ENDED,
      conversationId: call.conversationId,
    });
    useCallStore.getState().setCallState(CallState.ENDED);
    endAndReset();
  }, [publishCallSignal, endAndReset]);

  const toggleAudio = useCallback(() => {
    const manager = webrtcRef.current;
    if (!manager) return;

    const enabled = manager.toggleAudio();
    useCallStore.getState().toggleLocalAudio(enabled);

    const call = useCallStore.getState().activeCall;
    if (call) {
      publishCallSignal({
        callId: call.callId,
        type: CallSignalType.TOGGLE_AUDIO,
        conversationId: call.conversationId,
        enabled,
      });
    }
  }, [publishCallSignal]);

  const toggleVideo = useCallback(() => {
    const manager = webrtcRef.current;
    if (!manager) return;

    const enabled = manager.toggleVideo();
    useCallStore.getState().toggleLocalVideo(enabled);

    const call = useCallStore.getState().activeCall;
    if (call) {
      publishCallSignal({
        callId: call.callId,
        type: CallSignalType.TOGGLE_VIDEO,
        conversationId: call.conversationId,
        enabled,
      });
    }
  }, [publishCallSignal]);

  return {
    initiateCall,
    acceptCall,
    rejectCall,
    cancelCall,
    endCall,
    toggleAudio,
    toggleVideo,
  };
}

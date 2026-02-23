package com.platform.software.chat.call.service;

import com.platform.software.chat.call.dto.ActiveCallInfo;
import com.platform.software.chat.call.dto.CallLogUpsertDTO;
import com.platform.software.chat.call.dto.CallParticipantUpsertDTO;
import com.platform.software.chat.call.dto.CallSignalDTO;
import com.platform.software.chat.call.dto.CallSignalOutboundDTO;
import com.platform.software.chat.call.entity.CallStatusEnum;
import com.platform.software.chat.conversation.service.ConversationUtilService;
import com.platform.software.chat.user.dto.UserViewDTO;
import com.platform.software.chat.user.entity.ChatUser;
import com.platform.software.chat.user.service.UserService;
import com.platform.software.common.constants.Constants;
import com.platform.software.common.constants.GeneralConstants;
import com.platform.software.common.constants.WebSocketTopicConstants;
import com.platform.software.config.interceptors.websocket.WebSocketSessionManager;
import com.platform.software.config.workspace.WorkspaceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class CallSignalingService {

    private static final Logger logger = LoggerFactory.getLogger(CallSignalingService.class);

    private final WebSocketSessionManager webSocketSessionManager;
    private final UserService userService;
    private final ConversationUtilService conversationUtilService;
    private final CallLogService callLogService;

    private final ConcurrentHashMap<String, ActiveCallInfo> activeCalls = new ConcurrentHashMap<>();

    public CallSignalingService(
            WebSocketSessionManager webSocketSessionManager,
            UserService userService,
            ConversationUtilService conversationUtilService,
            CallLogService callLogService
    ) {
        this.webSocketSessionManager = webSocketSessionManager;
        this.userService = userService;
        this.conversationUtilService = conversationUtilService;
        this.callLogService = callLogService;
    }

    @Async
    @Transactional
    public void handleCallSignal(CallSignalDTO signal, Map<String, Object> sessionAttrs) {
        logger.info("[CALL DEBUG] Service handleCallSignal invoked: type={}, callId={}",
                signal.getType(), signal.getCallId());
        logger.info("[CALL DEBUG] Session attrs keys: {}", sessionAttrs.keySet());

        String workspaceId = (String) sessionAttrs.get(GeneralConstants.WORKSPACE_ID);
        String callerEmail = (String) sessionAttrs.get(Constants.JWT_CLAIM_EMAIL);

        logger.info("[CALL DEBUG] workspaceId={}, callerEmail={}", workspaceId, callerEmail);

        if (workspaceId == null || callerEmail == null) {
            logger.warn("[CALL DEBUG] BLOCKED: Missing workspace or email in session attributes");
            return;
        }

        try {
            WorkspaceContext.setCurrentWorkspace(workspaceId);

            switch (signal.getType()) {
                case "OFFER_CALL" -> handleOfferCall(signal, workspaceId, callerEmail);
                case "CALL_ACCEPTED" -> handleCallAccepted(signal, workspaceId, callerEmail);
                case "CALL_REJECTED" -> handleCallRejected(signal, workspaceId, callerEmail);
                case "CALL_CANCELLED" -> handleCallCancelled(signal, workspaceId, callerEmail);
                case "CALL_ENDED" -> handleCallEnded(signal, workspaceId, callerEmail);
                case "CALL_TIMEOUT" -> handleCallTimeout(signal, workspaceId, callerEmail);
                case "SDP_OFFER", "SDP_ANSWER", "ICE_CANDIDATE", "TOGGLE_VIDEO", "TOGGLE_AUDIO" ->
                        relaySignal(signal, workspaceId, callerEmail);
                default -> logger.warn("Unknown call signal type: {}", signal.getType());
            }
        } catch (Exception e) {
            logger.error("[CALL DEBUG] Error handling call signal type={}: {}", signal.getType(), e.getMessage(), e);
        }
    }

    private void handleOfferCall(CallSignalDTO signal, String workspaceId, String callerEmail) {
        logger.info("[CALL DEBUG] handleOfferCall: callerEmail={}, conversationId={}", callerEmail, signal.getConversationId());
        ChatUser caller = userService.getUserByEmail(callerEmail);
        logger.info("[CALL DEBUG] Found caller: id={}", caller.getId());
        Long conversationId = signal.getConversationId();

        List<ChatUser> otherParticipants = conversationUtilService
                .getAllParticipantsExceptSender(conversationId, caller.getId());
        logger.info("[CALL DEBUG] Other participants count: {}", otherParticipants.size());

        if (otherParticipants.isEmpty()) {
            logger.warn("No other participants found in conversation {} for call", conversationId);
            return;
        }

        // For 1-1 calls, there should be exactly one other participant
        ChatUser callee = otherParticipants.get(0);

        ActiveCallInfo callInfo = ActiveCallInfo.builder()
                .callId(signal.getCallId())
                .conversationId(conversationId)
                .callerEmail(callerEmail)
                .calleeEmail(callee.getEmail())
                .callerUserId(caller.getId())
                .calleeUserId(callee.getId())
                .isVideo(signal.getIsVideo())
                .startedAt(Instant.now())
                .build();

        activeCalls.put(signal.getCallId(), callInfo);

        UserViewDTO callerView = userService.findUserById(caller.getId(), workspaceId);

        CallSignalOutboundDTO outbound = new CallSignalOutboundDTO();
        outbound.setCallId(signal.getCallId());
        outbound.setType("INCOMING_CALL");
        outbound.setConversationId(conversationId);
        outbound.setIsVideo(signal.getIsVideo());
        outbound.setCallerName(callerView.getFirstName() + " " + callerView.getLastName());
        outbound.setCallerUserId(caller.getId());
        outbound.setCallerImageUrl(callerView.getSignedImageUrl());

        webSocketSessionManager.sendMessageToUser(
                workspaceId, callee.getEmail(),
                WebSocketTopicConstants.CALL_SIGNAL, outbound
        );

        logger.info("Call offer sent from {} to {} for conversation {}",
                callerEmail, callee.getEmail(), conversationId);
    }

    private void handleCallAccepted(CallSignalDTO signal, String workspaceId, String senderEmail) {
        ActiveCallInfo callInfo = activeCalls.get(signal.getCallId());
        if (callInfo == null) {
            logger.warn("No active call found for callId: {}", signal.getCallId());
            return;
        }

        String targetEmail = getOtherPartyEmail(callInfo, senderEmail);
        relayToUser(signal, workspaceId, targetEmail);
    }

    private void handleCallRejected(CallSignalDTO signal, String workspaceId, String senderEmail) {
        ActiveCallInfo callInfo = activeCalls.remove(signal.getCallId());
        if (callInfo == null) {
            logger.warn("No active call found for callId: {}", signal.getCallId());
            return;
        }

        String targetEmail = getOtherPartyEmail(callInfo, senderEmail);
        relayToUser(signal, workspaceId, targetEmail);
        saveCallLog(callInfo, CallStatusEnum.REJECTED);
    }

    private void handleCallCancelled(CallSignalDTO signal, String workspaceId, String senderEmail) {
        ActiveCallInfo callInfo = activeCalls.remove(signal.getCallId());
        if (callInfo == null) {
            logger.warn("No active call found for callId: {}", signal.getCallId());
            return;
        }

        String targetEmail = getOtherPartyEmail(callInfo, senderEmail);
        relayToUser(signal, workspaceId, targetEmail);
        saveCallLog(callInfo, CallStatusEnum.CANCELLED);
    }

    private void handleCallEnded(CallSignalDTO signal, String workspaceId, String senderEmail) {
        ActiveCallInfo callInfo = activeCalls.remove(signal.getCallId());
        if (callInfo == null) {
            logger.warn("No active call found for callId: {}", signal.getCallId());
            return;
        }

        String targetEmail = getOtherPartyEmail(callInfo, senderEmail);
        relayToUser(signal, workspaceId, targetEmail);
        saveCallLog(callInfo, CallStatusEnum.ANSWERED);
    }

    private void handleCallTimeout(CallSignalDTO signal, String workspaceId, String senderEmail) {
        ActiveCallInfo callInfo = activeCalls.remove(signal.getCallId());
        if (callInfo == null) {
            logger.warn("No active call found for callId: {}", signal.getCallId());
            return;
        }

        String targetEmail = getOtherPartyEmail(callInfo, senderEmail);
        relayToUser(signal, workspaceId, targetEmail);
        saveCallLog(callInfo, CallStatusEnum.MISSED);
    }

    private void relaySignal(CallSignalDTO signal, String workspaceId, String senderEmail) {
        ActiveCallInfo callInfo = activeCalls.get(signal.getCallId());
        if (callInfo == null) {
            logger.warn("No active call found for relay, callId: {}", signal.getCallId());
            return;
        }

        String targetEmail = getOtherPartyEmail(callInfo, senderEmail);
        relayToUser(signal, workspaceId, targetEmail);
    }

    private void relayToUser(CallSignalDTO signal, String workspaceId, String targetEmail) {
        webSocketSessionManager.sendMessageToUser(
                workspaceId, targetEmail,
                WebSocketTopicConstants.CALL_SIGNAL, signal
        );
    }

    private String getOtherPartyEmail(ActiveCallInfo callInfo, String senderEmail) {
        return senderEmail.equals(callInfo.getCallerEmail())
                ? callInfo.getCalleeEmail()
                : callInfo.getCallerEmail();
    }

    private void saveCallLog(ActiveCallInfo callInfo, CallStatusEnum status) {
        try {
            ZonedDateTime startedAt = callInfo.getStartedAt().atZone(ZoneOffset.UTC);
            ZonedDateTime endedAt = ZonedDateTime.now(ZoneOffset.UTC);

            CallParticipantUpsertDTO callerParticipant = new CallParticipantUpsertDTO();
            callerParticipant.setUserId(callInfo.getCallerUserId());
            callerParticipant.setJoinedAt(startedAt);
            callerParticipant.setLeftAt(endedAt);

            CallParticipantUpsertDTO calleeParticipant = new CallParticipantUpsertDTO();
            calleeParticipant.setUserId(callInfo.getCalleeUserId());
            calleeParticipant.setJoinedAt(startedAt);
            calleeParticipant.setLeftAt(endedAt);

            CallLogUpsertDTO callLogUpsertDTO = new CallLogUpsertDTO();
            callLogUpsertDTO.setIsVideo(callInfo.getIsVideo());
            callLogUpsertDTO.setCallStartedAt(startedAt);
            callLogUpsertDTO.setCallEndedAt(endedAt);
            callLogUpsertDTO.setStatus(status);
            callLogUpsertDTO.setParticipants(List.of(callerParticipant, calleeParticipant));

            callLogService.saveCallLogInfo(
                    callInfo.getConversationId(),
                    callLogUpsertDTO,
                    callInfo.getCallerUserId()
            );

            logger.info("Call log saved for callId: {} with status: {}",
                    callInfo.getCallId(), status);
        } catch (Exception e) {
            logger.error("Failed to save call log for callId: {}", callInfo.getCallId(), e);
        }
    }
}

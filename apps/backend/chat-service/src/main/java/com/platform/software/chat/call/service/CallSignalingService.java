package com.platform.software.chat.call.service;

import com.platform.software.chat.call.dto.*;
import com.platform.software.chat.call.entity.CallLog;
import com.platform.software.chat.call.entity.CallParticipant;
import com.platform.software.chat.call.entity.CallStatusEnum;
import com.platform.software.chat.call.repository.CallLogRepository;
import com.platform.software.chat.call.repository.CallParticipantRepository;
import com.platform.software.chat.conversation.service.ConversationUtilService;
import com.platform.software.chat.notification.dto.NotificationRequestDTO;
import com.platform.software.chat.notification.repository.ChatNotificationRepository;
import com.platform.software.chat.notification.service.NotificationServiceFactory;
import com.platform.software.chat.user.entity.ChatUser;
import com.platform.software.chat.user.service.UserService;
import com.platform.software.common.constants.Constants;
import com.platform.software.common.constants.GeneralConstants;
import com.platform.software.common.constants.WebSocketTopicConstants;
import com.platform.software.config.interceptors.websocket.WebSocketSessionManager;
import com.platform.software.config.workspace.WorkspaceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class CallSignalingService {

    private static final Logger logger = LoggerFactory.getLogger(CallSignalingService.class);
    private static final long CALL_TIMEOUT_SECONDS = 60;

    private final WebSocketSessionManager webSocketSessionManager;
    private final ConversationUtilService conversationUtilService;
    private final UserService userService;
    private final CallLogRepository callLogRepository;
    private final CallParticipantRepository callParticipantRepository;
    private final NotificationServiceFactory notificationServiceFactory;
    private final ChatNotificationRepository chatNotificationRepository;

    // In-memory active call tracking
    private final ConcurrentHashMap<Long, ActiveCallInfo> activeCallsByCallLogId = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Long> userInCall = new ConcurrentHashMap<>();

    public CallSignalingService(
            WebSocketSessionManager webSocketSessionManager,
            ConversationUtilService conversationUtilService,
            UserService userService,
            CallLogRepository callLogRepository,
            CallParticipantRepository callParticipantRepository,
            NotificationServiceFactory notificationServiceFactory,
            ChatNotificationRepository chatNotificationRepository
    ) {
        this.webSocketSessionManager = webSocketSessionManager;
        this.conversationUtilService = conversationUtilService;
        this.userService = userService;
        this.callLogRepository = callLogRepository;
        this.callParticipantRepository = callParticipantRepository;
        this.notificationServiceFactory = notificationServiceFactory;
        this.chatNotificationRepository = chatNotificationRepository;
    }

    private Long resolveUserId(Map<String, Object> sessionAttrs) {
        String workspaceId = (String) sessionAttrs.get(GeneralConstants.WORKSPACE_ID);
        String email = (String) sessionAttrs.get(Constants.JWT_CLAIM_EMAIL);
        logger.debug("Resolving user ID for workspace={}, email={}", workspaceId, email);
        if (workspaceId == null || email == null) {
            logger.error("Missing session attributes: workspaceId={}, email={}", workspaceId, email);
            throw new IllegalStateException("Missing required session attributes for call signaling");
        }
        WorkspaceContext.setCurrentWorkspace(workspaceId);
        ChatUser user = userService.getUserByEmail(email);
        if (user == null) {
            logger.error("User not found for email={} in workspace={}", email, workspaceId);
            throw new IllegalStateException("User not found for email: " + email);
        }
        return user.getId();
    }

    @Transactional
    public void initiateCall(CallInitiateDTO dto, Map<String, Object> sessionAttrs) {
        String workspaceId = (String) sessionAttrs.get(GeneralConstants.WORKSPACE_ID);

        try {
            WorkspaceContext.setCurrentWorkspace(workspaceId);
            Long callerId = resolveUserId(sessionAttrs);

            // Validate caller is in conversation
            conversationUtilService.getConversationParticipantOrThrow(dto.getConversationId(), callerId);

            ChatUser caller = userService.getUserOrThrow(callerId);

            // Find the other participant (1-on-1 call)
            List<ChatUser> otherParticipants = conversationUtilService
                    .getAllActiveParticipantsExceptSender(dto.getConversationId(), callerId);

            if (otherParticipants.isEmpty()) {
                logger.warn("No other participants found in conversation {}", dto.getConversationId());
                return;
            }

            ChatUser callee = otherParticipants.get(0);

            // Check if callee is already in a call
            String calleeKey = workspaceId + ":" + callee.getId();
            if (userInCall.containsKey(calleeKey)) {
                // Send busy signal to caller
                CallSignalingDTO busySignal = CallSignalingDTO.builder()
                        .conversationId(dto.getConversationId())
                        .calleeId(callee.getId())
                        .type("busy")
                        .build();
                webSocketSessionManager.sendMessageToUser(
                        workspaceId, caller.getEmail(),
                        WebSocketTopicConstants.CALL_BUSY, busySignal
                );
                return;
            }

            // Check if caller is already in a call
            String callerKey = workspaceId + ":" + callerId;
            if (userInCall.containsKey(callerKey)) {
                logger.warn("Caller {} is already in a call", callerId);
                return;
            }

            // Create CallLog with MISSED status (will be updated on answer/reject)
            CallLog callLog = new CallLog();
            callLog.setInitiator(caller);
            callLog.setConversation(conversationUtilService.getConversationOrThrow(dto.getConversationId()));
            callLog.setIsVideo(dto.getIsVideo());
            callLog.setCallStartedAt(ZonedDateTime.now());
            callLog.setStatus(CallStatusEnum.MISSED);
            CallLog savedCallLog = callLogRepository.save(callLog);

            // Track active call
            ActiveCallInfo activeCall = ActiveCallInfo.builder()
                    .callLogId(savedCallLog.getId())
                    .conversationId(dto.getConversationId())
                    .callerId(callerId)
                    .calleeId(callee.getId())
                    .callerEmail(caller.getEmail())
                    .calleeEmail(callee.getEmail())
                    .workspaceId(workspaceId)
                    .isVideo(dto.getIsVideo())
                    .initiatedAt(ZonedDateTime.now())
                    .answered(false)
                    .build();
            activeCallsByCallLogId.put(savedCallLog.getId(), activeCall);
            userInCall.put(callerKey, savedCallLog.getId());

            // Send incoming call signal to callee
            CallSignalingDTO incomingSignal = CallSignalingDTO.builder()
                    .conversationId(dto.getConversationId())
                    .callLogId(savedCallLog.getId())
                    .callerId(callerId)
                    .calleeId(callee.getId())
                    .type("offer")
                    .sdp(dto.getSdp())
                    .isVideo(dto.getIsVideo())
                    .callerName(caller.getFirstName() + " " + caller.getLastName())
                    .callerEmail(caller.getEmail())
                    .build();

            webSocketSessionManager.sendMessageToUser(
                    workspaceId, callee.getEmail(),
                    WebSocketTopicConstants.CALL_INCOMING, incomingSignal
            );

            // Send push notification for incoming call
            sendCallPushNotification(callee.getId(), caller, savedCallLog.getId(), dto.getConversationId());

            logger.info("Call initiated: callLogId={}, caller={}, callee={}",
                    savedCallLog.getId(), callerId, callee.getId());

        } catch (Exception e) {
            logger.error("Failed to initiate call for conversation {}: {}", dto.getConversationId(), e.getMessage(), e);
        }
    }

    @Transactional
    public void answerCall(CallAnswerDTO dto, Map<String, Object> sessionAttrs) {
        String workspaceId = (String) sessionAttrs.get(GeneralConstants.WORKSPACE_ID);

        try {
            WorkspaceContext.setCurrentWorkspace(workspaceId);
            Long answererId = resolveUserId(sessionAttrs);

            ActiveCallInfo activeCall = activeCallsByCallLogId.get(dto.getCallLogId());
            if (activeCall == null) {
                logger.warn("No active call found for callLogId {}", dto.getCallLogId());
                return;
            }

            // Mark call as answered
            activeCall.setAnswered(true);
            String calleeKey = workspaceId + ":" + answererId;
            userInCall.put(calleeKey, dto.getCallLogId());

            // Update CallLog status to ANSWERED
            callLogRepository.findById(dto.getCallLogId()).ifPresent(callLog -> {
                callLog.setStatus(CallStatusEnum.ANSWERED);
                callLogRepository.save(callLog);
            });

            // Create CallParticipant records
            saveCallParticipants(dto.getCallLogId(), activeCall.getCallerId(), answererId);

            // Send answer SDP to caller
            CallSignalingDTO answerSignal = CallSignalingDTO.builder()
                    .callLogId(dto.getCallLogId())
                    .conversationId(activeCall.getConversationId())
                    .callerId(activeCall.getCallerId())
                    .calleeId(answererId)
                    .type("answer")
                    .sdp(dto.getSdp())
                    .build();

            webSocketSessionManager.sendMessageToUser(
                    workspaceId, activeCall.getCallerEmail(),
                    WebSocketTopicConstants.CALL_ANSWER, answerSignal
            );

            // Notify other devices of callee that the call was answered elsewhere
            sendAnsweredElsewhereToOtherDevices(activeCall, answererId, workspaceId);

            logger.info("Call answered: callLogId={}, answerer={}", dto.getCallLogId(), answererId);

        } catch (Exception e) {
            logger.error("Failed to answer call {}: {}", dto.getCallLogId(), e.getMessage(), e);
        }
    }

    public void forwardIceCandidate(CallIceCandidateDTO dto, Map<String, Object> sessionAttrs) {
        String workspaceId = (String) sessionAttrs.get(GeneralConstants.WORKSPACE_ID);

        try {
            WorkspaceContext.setCurrentWorkspace(workspaceId);
            Long senderId = resolveUserId(sessionAttrs);

            ActiveCallInfo activeCall = activeCallsByCallLogId.get(dto.getCallLogId());
            if (activeCall == null) {
                logger.warn("ICE candidate: no active call for callLogId {}", dto.getCallLogId());
                return;
            }

            // Determine the other party
            String targetEmail;
            if (senderId.equals(activeCall.getCallerId())) {
                targetEmail = activeCall.getCalleeEmail();
            } else {
                targetEmail = activeCall.getCallerEmail();
            }

            CallSignalingDTO iceSignal = CallSignalingDTO.builder()
                    .callLogId(dto.getCallLogId())
                    .conversationId(activeCall.getConversationId())
                    .type("ice-candidate")
                    .candidate(dto.getCandidate())
                    .build();

            webSocketSessionManager.sendMessageToUser(
                    workspaceId, targetEmail,
                    WebSocketTopicConstants.CALL_ICE_CANDIDATE, iceSignal
            );

        } catch (Exception e) {
            logger.error("Failed to forward ICE candidate for call {}: {}", dto.getCallLogId(), e.getMessage());
        }
    }

    @Transactional
    public void endCall(CallEndDTO dto, Map<String, Object> sessionAttrs) {
        String workspaceId = (String) sessionAttrs.get(GeneralConstants.WORKSPACE_ID);

        try {
            WorkspaceContext.setCurrentWorkspace(workspaceId);
            Long enderId = resolveUserId(sessionAttrs);

            ActiveCallInfo activeCall = activeCallsByCallLogId.get(dto.getCallLogId());
            if (activeCall == null) {
                logger.warn("No active call found for callLogId {}", dto.getCallLogId());
                return;
            }

            // Determine the other party
            String targetEmail;
            Long targetId;
            if (enderId.equals(activeCall.getCallerId())) {
                targetEmail = activeCall.getCalleeEmail();
                targetId = activeCall.getCalleeId();
            } else {
                targetEmail = activeCall.getCallerEmail();
                targetId = activeCall.getCallerId();
            }

            // Update CallLog
            callLogRepository.findById(dto.getCallLogId()).ifPresent(callLog -> {
                callLog.setCallEndedAt(ZonedDateTime.now());
                if (!activeCall.isAnswered()) {
                    callLog.setStatus(CallStatusEnum.CANCELLED);
                }
                callLogRepository.save(callLog);
            });

            // Send end signal to the other party
            CallSignalingDTO endSignal = CallSignalingDTO.builder()
                    .callLogId(dto.getCallLogId())
                    .conversationId(activeCall.getConversationId())
                    .type("end")
                    .reason("ended")
                    .build();

            webSocketSessionManager.sendMessageToUser(
                    workspaceId, targetEmail,
                    WebSocketTopicConstants.CALL_ENDED, endSignal
            );

            // Remove from active calls
            removeActiveCall(dto.getCallLogId(), activeCall, workspaceId);

            logger.info("Call ended: callLogId={}, endedBy={}", dto.getCallLogId(), enderId);

        } catch (Exception e) {
            logger.error("Failed to end call {}: {}", dto.getCallLogId(), e.getMessage());
        }
    }

    @Transactional
    public void rejectCall(CallRejectDTO dto, Map<String, Object> sessionAttrs) {
        String workspaceId = (String) sessionAttrs.get(GeneralConstants.WORKSPACE_ID);

        try {
            WorkspaceContext.setCurrentWorkspace(workspaceId);
            Long rejecterId = resolveUserId(sessionAttrs);

            ActiveCallInfo activeCall = activeCallsByCallLogId.get(dto.getCallLogId());
            if (activeCall == null) {
                logger.warn("No active call found for callLogId {}", dto.getCallLogId());
                return;
            }

            // Update CallLog status to REJECTED
            callLogRepository.findById(dto.getCallLogId()).ifPresent(callLog -> {
                callLog.setStatus(CallStatusEnum.REJECTED);
                callLog.setCallEndedAt(ZonedDateTime.now());
                callLogRepository.save(callLog);
            });

            // Send reject signal to caller
            CallSignalingDTO rejectSignal = CallSignalingDTO.builder()
                    .callLogId(dto.getCallLogId())
                    .conversationId(activeCall.getConversationId())
                    .type("rejected")
                    .reason("rejected")
                    .build();

            webSocketSessionManager.sendMessageToUser(
                    workspaceId, activeCall.getCallerEmail(),
                    WebSocketTopicConstants.CALL_REJECTED, rejectSignal
            );

            // Remove from active calls
            removeActiveCall(dto.getCallLogId(), activeCall, workspaceId);

            logger.info("Call rejected: callLogId={}, rejectedBy={}", dto.getCallLogId(), rejecterId);

        } catch (Exception e) {
            logger.error("Failed to reject call {}: {}", dto.getCallLogId(), e.getMessage());
        }
    }

    @Scheduled(fixedRate = 10000)
    @Transactional
    public void cleanupTimedOutCalls() {
        ZonedDateTime timeoutThreshold = ZonedDateTime.now().minusSeconds(CALL_TIMEOUT_SECONDS);

        activeCallsByCallLogId.forEach((callLogId, activeCall) -> {
            if (!activeCall.isAnswered() && activeCall.getInitiatedAt().isBefore(timeoutThreshold)) {
                try {
                    WorkspaceContext.setCurrentWorkspace(activeCall.getWorkspaceId());

                    // Update CallLog status to MISSED
                    callLogRepository.findById(callLogId).ifPresent(callLog -> {
                        callLog.setStatus(CallStatusEnum.MISSED);
                        callLog.setCallEndedAt(ZonedDateTime.now());
                        callLogRepository.save(callLog);
                    });

                    CallSignalingDTO timeoutSignal = CallSignalingDTO.builder()
                            .callLogId(callLogId)
                            .conversationId(activeCall.getConversationId())
                            .type("end")
                            .reason("timeout")
                            .build();

                    // Notify both parties
                    webSocketSessionManager.sendMessageToUser(
                            activeCall.getWorkspaceId(), activeCall.getCallerEmail(),
                            WebSocketTopicConstants.CALL_ENDED, timeoutSignal
                    );
                    webSocketSessionManager.sendMessageToUser(
                            activeCall.getWorkspaceId(), activeCall.getCalleeEmail(),
                            WebSocketTopicConstants.CALL_ENDED, timeoutSignal
                    );

                    removeActiveCall(callLogId, activeCall, activeCall.getWorkspaceId());
                    logger.info("Call timed out: callLogId={}", callLogId);

                } catch (Exception e) {
                    logger.error("Failed to cleanup timed out call {}: {}", callLogId, e.getMessage());
                }
            }
        });
    }

    private void removeActiveCall(Long callLogId, ActiveCallInfo activeCall, String workspaceId) {
        activeCallsByCallLogId.remove(callLogId);
        userInCall.remove(workspaceId + ":" + activeCall.getCallerId());
        userInCall.remove(workspaceId + ":" + activeCall.getCalleeId());
    }

    private void saveCallParticipants(Long callLogId, Long callerId, Long calleeId) {
        callLogRepository.findById(callLogId).ifPresent(callLog -> {
            ZonedDateTime now = ZonedDateTime.now();

            CallParticipant callerParticipant = new CallParticipant();
            callerParticipant.setCallLog(callLog);
            callerParticipant.setParticipant(userService.getUserOrThrow(callerId));
            callerParticipant.setJoinedAt(now);

            CallParticipant calleeParticipant = new CallParticipant();
            calleeParticipant.setCallLog(callLog);
            calleeParticipant.setParticipant(userService.getUserOrThrow(calleeId));
            calleeParticipant.setJoinedAt(now);

            callParticipantRepository.saveAll(List.of(callerParticipant, calleeParticipant));
        });
    }

    private void sendAnsweredElsewhereToOtherDevices(ActiveCallInfo activeCall, Long answererId, String workspaceId) {
        CallSignalingDTO answeredElsewhere = CallSignalingDTO.builder()
                .callLogId(activeCall.getCallLogId())
                .conversationId(activeCall.getConversationId())
                .type("end")
                .reason("answered_elsewhere")
                .build();

        // This is sent to the same user (callee) on all devices - the WebSocket session manager
        // will deliver it to all connected sessions. The answering device will ignore it.
        webSocketSessionManager.sendMessageToUser(
                workspaceId, activeCall.getCalleeEmail(),
                WebSocketTopicConstants.CALL_ENDED, answeredElsewhere
        );
    }

    private void sendCallPushNotification(Long calleeId, ChatUser caller, Long callLogId, Long conversationId) {
        try {
            List<String> tokens = chatNotificationRepository.findNonMutedTokensByUserId(calleeId);
            if (tokens.isEmpty()) {
                return;
            }

            Map<String, String> data = new HashMap<>();
            data.put("type", "incoming_call");
            data.put("conversationId", String.valueOf(conversationId));
            data.put("callLogId", String.valueOf(callLogId));
            data.put("callerName", caller.getFirstName() + " " + caller.getLastName());

            NotificationRequestDTO request = new NotificationRequestDTO(
                    tokens,
                    "Incoming Call",
                    caller.getFirstName() + " " + caller.getLastName() + " is calling you",
                    data
            );
            notificationServiceFactory.sendNotification(request);
        } catch (Exception e) {
            logger.error("Failed to send call push notification: {}", e.getMessage());
        }
    }
}

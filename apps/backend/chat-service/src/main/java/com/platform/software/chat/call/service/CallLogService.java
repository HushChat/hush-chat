package com.platform.software.chat.call.service;


import com.platform.software.chat.call.dto.CallLogUpsertDTO;
import com.platform.software.chat.call.dto.CallLogViewDTO;
import com.platform.software.chat.call.dto.CallParticipantUpsertDTO;
import com.platform.software.chat.call.entity.CallLog;
import com.platform.software.chat.call.entity.CallParticipant;
import com.platform.software.chat.call.repository.CallLogRepository;
import com.platform.software.chat.call.repository.CallParticipantRepository;
import com.platform.software.chat.conversation.entity.Conversation;
import com.platform.software.chat.conversation.service.ConversationUtilService;
import com.platform.software.chat.conversationparticipant.entity.ConversationParticipant;
import com.platform.software.chat.user.entity.ChatUser;
import com.platform.software.chat.user.service.UserService;
import com.platform.software.exception.CustomBadRequestException;
import com.platform.software.exception.CustomInternalServerErrorException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class CallLogService {
    private final Logger logger = LoggerFactory.getLogger(CallLogService.class);

    private final ConversationUtilService conversationUtilService;
    private final UserService userService;
    private final CallLogRepository callLogRepository;
    private final CallParticipantRepository callParticipantRepository;

    public CallLogService(
            ConversationUtilService conversationUtilService,
            UserService userService,
            CallLogRepository callLogRepository,
            CallParticipantRepository callParticipantRepository
    ) {
        this.conversationUtilService = conversationUtilService;
        this.userService = userService;
        this.callLogRepository = callLogRepository;
        this.callParticipantRepository = callParticipantRepository;
    }

    @Transactional
    public void saveCallLogInfo(Long conversationId, CallLogUpsertDTO callLogUpsertDTO, Long loggedInUserId) {
        conversationUtilService.getConversationParticipantOrThrow(conversationId, loggedInUserId);

        ChatUser loggedInUser = userService.getUserOrThrow(loggedInUserId);
        Conversation conversation = conversationUtilService.getConversationOrThrow(conversationId);

        CallLog savedCallLog = saveCallLog(callLogUpsertDTO, loggedInUser, conversation);
        saveCallLogParticipants(callLogUpsertDTO.getParticipants(), savedCallLog, conversationId);
    }

    public Page<CallLogViewDTO> getCallLogsByParticipantUserId(Long userId, Pageable pageable) {
        Page<CallLogViewDTO> callLogs = callLogRepository.findCallLogsByParticipantUserId(userId, pageable);
        return callLogs;
    }

    private void saveCallLogParticipants(List<CallParticipantUpsertDTO> participantRequests, CallLog savedCallLog, Long conversationId) {
        Map<Long, ChatUser> users = validateAndGetConversationParticipants(conversationId, participantRequests);

        List<CallParticipant> participants = new ArrayList<>();
        for (CallParticipantUpsertDTO callParticipantUpsertDTO : participantRequests) {
            ChatUser participantUser = users.get(callParticipantUpsertDTO.getUserId());
            CallParticipant callParticipant = new CallParticipant();
            callParticipant.setCallLog(savedCallLog);
            callParticipant.setParticipant(participantUser);
            callParticipant.setJoinedAt(callParticipantUpsertDTO.getJoinedAt());
            callParticipant.setLeftAt(callParticipantUpsertDTO.getLeftAt());

            participants.add(callParticipant);
        }

        try {
            callParticipantRepository.saveAll(participants);
        } catch (Exception e) {
            logger.error("cannot save conversation id: {} call log participant: ", conversationId, e);
            throw new CustomInternalServerErrorException("Cannot save call log at the moment");
        }
    }

    private CallLog saveCallLog(CallLogUpsertDTO callLogUpsertDTO, ChatUser loggedInUser, Conversation conversation) {
        CallLog callLog = callLogUpsertDTO.getCallLog();
        callLog.setInitiator(loggedInUser);
        callLog.setConversation(conversation);

        CallLog savedCallLog;
        try {
            savedCallLog = callLogRepository.save(callLog);
        } catch (Exception e) {
            logger.error("cannot save conversation id: {} call log: ", conversation.getId(), e);
            throw new CustomInternalServerErrorException("Cannot save call log at the moment");
        }
        return savedCallLog;
    }

    private Map<Long, ChatUser> validateAndGetConversationParticipants(Long conversationId, List<CallParticipantUpsertDTO> participantRequests) {
        Set<Long> participantIds = participantRequests
                .stream().map(CallParticipantUpsertDTO::getUserId)
                .collect(Collectors.toSet());
        if (participantIds.isEmpty()) {
            throw new CustomBadRequestException("Cannot log a call with no participants");
        }

        Map<Long, ConversationParticipant> participantMap = conversationUtilService
                .getConversationParticipantMap(conversationId, participantIds);
        if (participantMap.isEmpty()) {
            throw new CustomBadRequestException("None of the participants are in the conversation");
        }

        if (participantMap.size() != participantIds.size()) {
            Set<Long> notParticipantsIds = new HashSet<>(participantIds);
            notParticipantsIds.removeAll(participantMap.keySet());

            Map<Long, ChatUser> users = conversationUtilService.validateUsersTryingToAdd(notParticipantsIds);
            List<String> notParticipantNames = users.values().stream().map(u -> "%s %s".formatted(u.getFirstName(), u.getLastName())).toList();
            throw new CustomBadRequestException("%s participants are not in the conversation".formatted(notParticipantNames));
        }

        Map<Long, ChatUser> users = conversationUtilService.validateUsersTryingToAdd(participantIds);
        return users;
    }
}
package com.platform.software.chat.call.service;

import com.platform.software.chat.call.dto.InitiateCallResponseDTO;
import com.platform.software.chat.call.entity.CallLog;
import com.platform.software.chat.call.entity.CallStatusEnum;
import com.platform.software.chat.call.repository.CallLogRepository;
import com.platform.software.chat.conversation.entity.Conversation;
import com.platform.software.chat.conversation.repository.ConversationRepository;
import com.platform.software.chat.conversation.service.ConversationUtilService;
import com.platform.software.chat.user.entity.ChatUser;
import com.platform.software.chat.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;

@Service
@RequiredArgsConstructor
public class CallService {

    private final CallLogRepository callLogRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;
    private final ConversationUtilService conversationUtilService;

    public InitiateCallResponseDTO initiateCall(Long conversationId, Long initiatorId, boolean isVideo) {
        conversationUtilService.getConversationParticipantOrThrow(conversationId, initiatorId);

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        ChatUser initiator = userRepository.findById(initiatorId)
                .orElseThrow(() -> new RuntimeException("Initiator not found"));

        CallLog callLog = new CallLog();
        callLog.setConversation(conversation);
        callLog.setInitiator(initiator);
        callLog.setIsVideo(isVideo);
        callLog.setCallStartedAt(ZonedDateTime.now());
        callLog.setStatus(CallStatusEnum.INITIATED);

        CallLog saved = callLogRepository.save(callLog);

        return new InitiateCallResponseDTO(saved.getId());
    }
}

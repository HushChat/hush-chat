package com.platform.software.chat.message.service;

import com.platform.software.chat.conversation.entity.Conversation;
import com.platform.software.chat.conversation.repository.ConversationRepository;
import com.platform.software.chat.conversation.service.ConversationUtilService;
import com.platform.software.chat.conversationparticipant.entity.ConversationParticipant;
import com.platform.software.chat.conversationparticipant.entity.ConversationParticipantRoleEnum;
import com.platform.software.chat.message.dto.MessageTypeEnum;
import com.platform.software.chat.message.dto.MessageUpsertDTO;
import com.platform.software.chat.message.entity.Message;
import com.platform.software.chat.message.repository.MessageRepository;
import com.platform.software.chat.user.entity.ChatUser;
import com.platform.software.chat.user.service.UserService;
import com.platform.software.exception.CustomBadRequestException;
import com.platform.software.exception.CustomForbiddenException;
import com.platform.software.exception.CustomInternalServerErrorException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageUtilService {
    private final Logger logger = LoggerFactory.getLogger(getClass());

    private final ConversationUtilService conversationUtilService;
    private final UserService userService;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;

    /**
     * Retrieves the recipient ID for a one-to-one conversation.
     *
     * @param senderId the ID of the sender
     * @param conversation the conversation object
     * @return the ID of the recipient
     */
    public Long getRecipientIdForOneToOne(Long senderId, Conversation conversation) {
        List<ConversationParticipant> participants = conversation.getConversationParticipants();
        if (participants.size() != 2) {
            logger.error("conversation {} has {} participants, expected 2",
                conversation.getId(), participants.size());
            throw new CustomBadRequestException("Invalid conversation!");
        }
        return participants.stream()
            .map(ConversationParticipant::getUser)
            .map(ChatUser::getId)
            .filter(id -> !id.equals(senderId))
            .findFirst()
            .orElseThrow(() -> new CustomBadRequestException("Recipient not found!"));
    }

    public void validateInteractionAllowed(Conversation conversation, Long senderUserId) {
        if (!conversation.getIsGroup()) {
            Long recipientId = getRecipientIdForOneToOne(senderUserId, conversation);
            if (userService.isInteractionBlockedBetween(senderUserId, recipientId)) {
                logger.warn("User {} attempted to interact with blocked user {} in conversation {}",
                    senderUserId, recipientId, conversation.getId());

                // TODO: Replace with CustomBusinessRuleException once we standardize business rule violations
                throw new CustomBadRequestException("Cannot interact with blocked conversations");
            }
        } else {
            boolean isActive = conversationRepository.getIsActiveByConversationIdAndUserId(conversation.getId(), senderUserId);
            if (!isActive) {
                logger.warn("User {} attempted to interact in inactive group conversation {}",
                    senderUserId, conversation.getId());
                throw new CustomForbiddenException("Cannot interact in inactive group conversation");
            }
        }
    }

    public Message getMessageOrThrow(Long conversationId, Long messageId) {
        Message message = messageRepository
            .findByConversation_IdAndId(conversationId, messageId)
            .orElseThrow(() -> new CustomBadRequestException("Message does not exist or you don't have permission to this message!"));
        return message;
    }

    /** Adds a parent message to the new message if it is a reply.
     *
     * @param conversationId the ID of the conversation
     * @param parentMessageId the ID of the parent message if this is a reply (optional)
     * @param newMessage the new message to which the parent message will be added
     */
    private void addParentMessageIfReply(Long conversationId, Long parentMessageId, Message newMessage) {
        if (parentMessageId != null) {
            Message parentMessage = this.getMessageOrThrow(conversationId, parentMessageId);
            newMessage.setParentMessage(parentMessage);
        }
    }

    /**
     * Creates a new text message in the specified conversation.
     *
     * @param conversationId the ID of the conversation
     * @param senderUserId the ID of the user sending the message
     * @param message the message details
     * @return the saved Message entity
     */
    public Message createTextMessage(Long conversationId, Long senderUserId, MessageUpsertDTO message, MessageTypeEnum messageType) {
        ConversationParticipant participant = conversationUtilService.getConversationParticipantOrThrow(conversationId, senderUserId);
        ChatUser loggedInUser = userService.getUserOrThrow(senderUserId);
        Conversation conversation = conversationUtilService.getConversationOrThrow(conversationId);

        if (conversation.getOnlyAdminsCanSendMessages()) {
            if (participant.getRole() != ConversationParticipantRoleEnum.ADMIN) {
                throw new CustomForbiddenException("Only admins can send messages in this conversation");
            }
        }

        validateInteractionAllowed(conversation, senderUserId);

        Message newMessage = MessageService.buildMessage(message.getMessageText(), conversation, loggedInUser, messageType);
        addParentMessageIfReply(conversationId, message.getParentMessageId(), newMessage);

        try {
            return messageRepository.saveMessageWthSearchVector(newMessage);
        } catch (Exception e) {
            logger.error("conversation message save failed.", e);
            throw new CustomInternalServerErrorException("Failed to send message");
        }
    }
}

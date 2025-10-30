/**
 * Copyright (c) 2025, HushChat (https://gethush.chat)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

package com.platform.software.chat.message.service;

import com.platform.software.chat.conversation.entity.Conversation;
import com.platform.software.chat.message.dto.MessageReactionUpsertDTO;
import com.platform.software.chat.message.dto.MessageReactionViewDTO;
import com.platform.software.chat.message.entity.Message;
import com.platform.software.chat.message.entity.MessageReaction;
import com.platform.software.chat.message.repository.MessageReactionRepository;
import com.platform.software.chat.notification.service.ChatNotificationService;
import com.platform.software.chat.user.entity.ChatUser;
import com.platform.software.exception.CustomBadRequestException;
import com.platform.software.exception.CustomInternalServerErrorException;
import org.springframework.data.domain.Page;
import com.platform.software.chat.user.service.UserService;
import com.platform.software.config.workspace.WorkspaceContext;
import com.platform.software.utils.ValidationUtils;
import org.jetbrains.annotations.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronizationAdapter;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.Optional;

@Service
public class MessageReactionService {
    private final Logger logger = LoggerFactory.getLogger(MessageReactionService.class);

    private final MessageService messageService;
    private final UserService userService;
    private final MessageReactionRepository messageReactionRepository;
    private final ChatNotificationService chatNotificationService;

    public MessageReactionService(
            MessageService messageService,
            UserService userService,
            MessageReactionRepository messageReactionRepository, ChatNotificationService chatNotificationService
    ) {
        this.messageService = messageService;
        this.userService = userService;
        this.messageReactionRepository = messageReactionRepository;
        this.chatNotificationService = chatNotificationService;
    }

    /**
     * Adds or updates a reaction to a message by a user.
     *
     * @param messageReaction the reaction details to be added or updated
     * @param userId the ID of the user adding the reaction
     * @param messageId the ID of the message to which the reaction is being added
     */
    @Transactional
    public void addReaction(MessageReactionUpsertDTO messageReaction, Long userId, Long messageId) {
        ValidationUtils.validate(messageReaction);

        ChatUser user = userService.getUserOrThrow(userId);
        Message message = messageService.getMessageIfUserParticipant(userId, messageId);
        Conversation conversation = message.getConversation();

        messageService.validateInteractionAllowed(conversation, userId);

        Optional<MessageReaction> existingReaction = messageReactionRepository.findByMessageIdAndUserId(messageId, userId);

        if (existingReaction.isPresent()) {
            handleExistingReaction(messageReaction, userId, messageId, existingReaction.get());
        } else {
            // Create new reaction
            MessageReaction newReaction = createNewReaction(messageReaction, message, user);
            saveReaction(newReaction, messageId);
        }

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronizationAdapter() {
            @Override
            public void afterCommit() {
                chatNotificationService.sendMessageReactionNotifications(message, user);
            }
        });
    }

    /**
     * Creates a new MessageReaction entity from the provided DTO.
     *
     * @param messageReaction the DTO containing reaction details
     * @param message the message to which the reaction is associated
     * @param user the user who is reacting
     * @return a new MessageReaction entity
     */
    @NotNull
    private static MessageReaction createNewReaction(MessageReactionUpsertDTO messageReaction, Message message, ChatUser user) {
        MessageReaction newReaction = new MessageReaction();
        newReaction.setMessage(message);
        newReaction.setUser(user);
        newReaction.setReactionType(messageReaction.getReactionType());
        return newReaction;
    }

    /**
     * Handles an existing reaction by either updating it or removing it based on the new reaction type.
     *
     * @param messageReaction the new reaction details
     * @param userId the ID of the user who reacted
     * @param messageId the ID of the message being reacted to
     * @param reaction the existing reaction, if present
     */
    private void handleExistingReaction(MessageReactionUpsertDTO messageReaction, Long userId, Long messageId, MessageReaction reaction) {
        // If same reaction type, remove it (toggle off)
        boolean isReactionAddedBefore = reaction.getReactionType().equals(messageReaction.getReactionType());
        if (isReactionAddedBefore) {
            removeReaction(reaction, userId);
            return;
        }

        // Different reaction type, update it
        reaction.setReactionType(messageReaction.getReactionType());
        saveReaction(reaction, messageId);
    }

    /** saves the reaction to the database.
     *
     * @param reaction the reaction to be saved
     * @param messageId the ID of the message associated with the reaction
     */
    private void saveReaction(MessageReaction reaction, Long messageId) {
        try {
            messageReactionRepository.save(reaction);
        } catch (Exception e) {
            logger.error("Cannot save reaction for message: {}", messageId, e);
            throw new CustomInternalServerErrorException("Cannot save reaction");
        }
    }

    /**
     * Removes a reaction from a message by a user.
     *
     * @param userId the ID of the user removing the reaction
     * @param messageId the ID of the message from which the reaction is being removed
     */
    public void removeReaction(Long userId, Long messageId) {
        messageService.getMessageIfUserParticipant(userId, messageId);

        MessageReaction reaction = messageReactionRepository.findByMessageIdAndUserId(messageId, userId)
            .orElseThrow(() -> new CustomBadRequestException("Cannot find reaction"));

        removeReaction(reaction, userId);
    }

    /**
     * Removes a reaction from the database.
     *
     * @param reaction the reaction to be removed
     * @param messageId the ID of the message associated with the reaction
     */
    private void removeReaction(MessageReaction reaction, Long messageId) {
        try {
            messageReactionRepository.delete(reaction);
        } catch (Exception e) {
            logger.error("Cannot remove reaction for message: {}", messageId, e);
            throw new CustomInternalServerErrorException("Cannot remove reaction");
        }
    }

    /**
     * get reactions by Message id
     *
     * @param messageId the id of message
     * @param pageable pagination information
     * @return page of MessageReactionViewDTO
     */
    public Page<MessageReactionViewDTO> getMessageReactions(Long messageId, Long loggedInUserId, Pageable pageable) {
        messageService.getMessageIfUserParticipant(loggedInUserId, messageId);

        Page<MessageReaction> messageReactions = messageReactionRepository
                .getMessageReactionsByMessage_Id_OrderByReactionType(messageId, pageable);
        return messageReactions.map(MessageReactionViewDTO::new);
    }
}
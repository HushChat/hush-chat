package com.platform.software.chat.message.service;


import com.platform.software.chat.conversation.entity.Conversation;
import com.platform.software.chat.conversation.entity.ConversationEvent;
import com.platform.software.chat.conversation.service.ConversationUtilService;
import com.platform.software.chat.message.attachment.dto.MessageAttachmentDTO;
import com.platform.software.chat.message.attachment.entity.MessageAttachment;
import com.platform.software.chat.message.dto.MessageViewDTO;
import com.platform.software.chat.message.entity.FavouriteMessage;
import com.platform.software.chat.message.entity.Message;
import com.platform.software.chat.message.repository.FavoriteMessageRepository;
import com.platform.software.chat.user.entity.ChatUser;
import com.platform.software.chat.user.service.UserService;
import com.platform.software.config.aws.CloudPhotoHandlingService;
import com.platform.software.exception.CustomBadRequestException;
import com.platform.software.exception.CustomInternalServerErrorException;
import com.platform.software.exception.CustomResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class FavoriteMessageService {
    private static final Logger logger = LoggerFactory.getLogger(FavoriteMessageService.class);

    private final FavoriteMessageRepository favoriteMessageRepository;
    private final UserService userService;
    private final MessageService messageService;
    private final ConversationUtilService conversationUtilService;
    private final CloudPhotoHandlingService  cloudPhotoHandlingService;

    public FavoriteMessageService(
        FavoriteMessageRepository favoriteMessageRepository,
        UserService userService,
        MessageService messageService,
        ConversationUtilService conversationUtilService,
        CloudPhotoHandlingService cloudPhotoHandlingService
    ) {
        this.favoriteMessageRepository = favoriteMessageRepository;
        this.userService = userService;
        this.messageService = messageService;
        this.conversationUtilService = conversationUtilService;
        this.cloudPhotoHandlingService = cloudPhotoHandlingService;
    }

    /**
     * Toggles the favorite status of a message for a specific user in a conversation.
     *
     * @param userId the ID of the user toggling the favorite status
     * @param conversationId the ID of the conversation containing the message
     * @param messageId the ID of the message to toggle favorite status for
     * @return MessageViewDTO containing the details of the favorited message
     */
    public MessageViewDTO toggleFavoriteMessage(Long userId, Long conversationId, Long messageId) {
        ChatUser user = userService.getUserOrThrow(userId);
        Message message = messageService.getMessageIfUserParticipant(userId, messageId);
        Conversation conversation = conversationUtilService.getConversationOrThrow(conversationId);

        // this return list of one message if exist
        List<FavouriteMessage> existingFavorite = favoriteMessageRepository
                .findByUserIdAndMessageIdInAndConversationId(userId, List.of(messageId), conversationId);

        try {
            if (!existingFavorite.isEmpty()) {
                favoriteMessageRepository.deleteById(existingFavorite.getFirst().getId());

                MessageViewDTO messageViewDTO = new MessageViewDTO(message);
                messageViewDTO.setIsFavorite(false);

                return messageViewDTO;
            } else {
                FavouriteMessage newFavorite = new FavouriteMessage();
                newFavorite.setUser(user);
                newFavorite.setMessage(message);
                newFavorite.setConversation(conversation);

                favoriteMessageRepository.save(newFavorite);

                MessageViewDTO messageViewDTO = new MessageViewDTO(message);
                messageViewDTO.setIsFavorite(true);

                return messageViewDTO;
            }
        } catch (Exception exception) {
            logger.error("Failed to toggle favorite message for user {} and message {}", userId, messageId, exception);
            throw new CustomInternalServerErrorException("Failed to update favorite status!");
        }
    }

    /**
     * Retrieves favorite messages for a user with pagination.
     *
     * @param userId the ID of the user
     * @param pageable the pagination information
     * @return a paginated list of MessageViewDTOs representing the user's favorite messages
     */
    public Page<MessageViewDTO> getFavoriteMessages(Long conversationId, Long userId, Pageable pageable) {
        Page<Message> favoriteMessagePages = favoriteMessageRepository.findFavoriteMessagesOfUserForConversation(conversationId, userId, pageable);

        Map<Long, String> senderImageSignedUrlMap = favoriteMessagePages.stream()
                .map(Message::getSender)
                .filter(sender -> sender != null && sender.getImageIndexedName() != null)
                .collect(Collectors.toMap(
                        ChatUser:: getId,
                        sender -> cloudPhotoHandlingService.getPhotoViewSignedURL(sender.getImageIndexedName()),
                        (existing, replacement) -> existing
                ));

        List<MessageViewDTO> enrichedDTOs = favoriteMessagePages.stream()
                .map(message -> {
                    MessageViewDTO messageViewDTO = new MessageViewDTO(message);

                    List<MessageAttachmentDTO> attachmentDTOs = new ArrayList<>();

                    List<MessageAttachment> attachments = message.getAttachments();

                    if (message.getSender() != null) {
                        String senderImageUrl = senderImageSignedUrlMap.get(message.getSender().getId());
                        messageViewDTO.setSenderSignedImageUrl(senderImageUrl);
                    }

                    if (attachments == null || attachments.isEmpty()) {
                        return new MessageViewDTO(message);
                    }

                    for (MessageAttachment attachment : attachments) {
                        try {
                            String fileViewSignedURL = cloudPhotoHandlingService
                                    .getPhotoViewSignedURL(attachment.getIndexedFileName());

                            MessageAttachmentDTO messageAttachmentDTO = new MessageAttachmentDTO();
                            messageAttachmentDTO.setId(attachment.getId());
                            messageAttachmentDTO.setFileUrl(fileViewSignedURL);
                            messageAttachmentDTO.setIndexedFileName(attachment.getIndexedFileName());
                            messageAttachmentDTO.setOriginalFileName(attachment.getOriginalFileName());
                            attachmentDTOs.add(messageAttachmentDTO);
                        } catch (Exception e) {
                            logger.error("failed to add file {} to zip: {}", attachment.getOriginalFileName(), e.getMessage());
                            throw new CustomInternalServerErrorException("Failed to get conversation!");
                        }
                    }
                    messageViewDTO.setMessageAttachments(attachmentDTOs);
                    messageViewDTO.setIsFavorite(true);
                    return messageViewDTO;
                })
                .collect(Collectors.toList());

        return new PageImpl<>(enrichedDTOs, favoriteMessagePages.getPageable(), favoriteMessagePages.getTotalElements());
    }


    /**
     * Deletes a favorite message for the user.
     *
     * @param userId the ID of the user
     * @param messageId the ID of the message to be unfavorited
     */
    public void deleteFavoriteMessage(Long userId, Long messageId) {
        FavouriteMessage favoriteMessage = favoriteMessageRepository
                .findByUserIdAndMessageId(userId, messageId)
                .orElseThrow(() -> {
                    logger.warn("user {} attempted to delete non-existent favorite for message {}", userId, messageId);
                    return new CustomResourceNotFoundException("Favorite message not found!");
                });

        try {
            favoriteMessageRepository.delete(favoriteMessage);
        } catch (Exception exception) {
            logger.error("failed to delete favorite message for user {} and message {}", userId, messageId, exception);
            throw new CustomInternalServerErrorException("Failed to un-favourite message!");
        }
    }
}

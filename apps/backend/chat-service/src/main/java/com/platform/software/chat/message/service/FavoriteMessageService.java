package com.platform.software.chat.message.service;


import com.platform.software.chat.message.dto.MessageViewDTO;
import com.platform.software.chat.message.entity.FavouriteMessage;
import com.platform.software.chat.message.entity.Message;
import com.platform.software.chat.message.repository.FavoriteMessageRepository;
import com.platform.software.chat.user.entity.ChatUser;
import com.platform.software.chat.user.service.UserService;
import com.platform.software.exception.CustomBadRequestException;
import com.platform.software.exception.CustomInternalServerErrorException;
import com.platform.software.exception.CustomResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class FavoriteMessageService {
    private static final Logger logger = LoggerFactory.getLogger(FavoriteMessageService.class);

    private final FavoriteMessageRepository favoriteMessageRepository;
    private final UserService userService;
    private final MessageService messageService;

    public FavoriteMessageService(
            FavoriteMessageRepository favoriteMessageRepository,
            UserService userService,
            MessageService messageService
    ) {
        this.favoriteMessageRepository = favoriteMessageRepository;
        this.userService = userService;
        this.messageService = messageService;
    }

    /**
     * Creates a favorite message for the user.
     *
     * @param userId    the ID of the user
     * @param messageId the ID of the message to be favorited
     * @return MessageViewDTO containing the details of the favorited message
     */
    public MessageViewDTO createFavoriteMessage(Long userId, Long messageId) {
        ChatUser user = userService.getUserOrThrow(userId);
        Message message = messageService.getMessageIfUserParticipant(userId, messageId);

        if (favoriteMessageRepository.existsByUserIdAndMessageId(userId, messageId)) {
            logger.warn("user {} attempted to favorite message {} which is already favorited", userId, messageId);
            throw new CustomBadRequestException("Message is already a favorite!");
        }

        FavouriteMessage favoriteMessage = new FavouriteMessage();
        favoriteMessage.setUser(user);
        favoriteMessage.setMessage(message);
        try {
            FavouriteMessage savedFavorite = favoriteMessageRepository.save(favoriteMessage);
            return new MessageViewDTO(savedFavorite.getMessage());
        } catch (Exception exception) {
            logger.error("failed to create favorite message for user {} and message {}", userId, messageId, exception);
            throw new CustomInternalServerErrorException("Failed to add message to favorites!");
        }
    }

    /**
     * Retrieves favorite messages for a user with pagination.
     *
     * @param userId   the ID of the user
     * @param pageable the pagination information
     * @return a paginated list of MessageViewDTOs representing the user's favorite messages
     */
    public Page<MessageViewDTO> getFavoriteMessagesByUserId(Long userId, Pageable pageable) {
        return favoriteMessageRepository.findFavoriteMessagesByUserId(userId, pageable);
    }


    /**
     * Deletes a favorite message for the user.
     *
     * @param userId    the ID of the user
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

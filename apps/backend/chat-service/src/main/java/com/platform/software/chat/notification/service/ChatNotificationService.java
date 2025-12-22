package com.platform.software.chat.notification.service;

import com.platform.software.chat.message.entity.Message;
import com.platform.software.chat.message.service.MessageMentionService;
import com.platform.software.chat.notification.dto.DeviceTokenUpsertDTO;
import com.platform.software.chat.notification.dto.NotificationRequestDTO;
import com.platform.software.chat.notification.entity.ChatNotification;
import com.platform.software.chat.notification.repository.ChatNotificationRepository;
import com.platform.software.chat.user.entity.ChatUser;
import com.platform.software.chat.user.service.UserService;
import com.platform.software.common.constants.Constants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ChatNotificationService {

    private final UserService userService;
    private final ChatNotificationRepository chatNotificationRepository;
    private final ChatNotificationUtilService chatNotificationUtilService;
    private final NotificationServiceFactory notificationServiceFactory;
    private final MessageMentionService messageMentionService;

    private static final Logger logger = LoggerFactory.getLogger(ChatNotificationService.class);

    public ChatNotificationService(UserService userService, ChatNotificationRepository chatNotificationRepository, ChatNotificationUtilService chatNotificationUtilService, NotificationServiceFactory notificationServiceFactory, MessageMentionService messageMentionService) {
        this.userService = userService;
        this.chatNotificationRepository = chatNotificationRepository;
        this.chatNotificationUtilService = chatNotificationUtilService;
        this.notificationServiceFactory = notificationServiceFactory;
        this.messageMentionService = messageMentionService;
    }

    /**
     * Build and send notifications to tokens
     *
     * @param tokens list of device tokens
     * @param message  target message
     * @param body   notification body
     */
    private void buildAndDispatchNotification(List<String> tokens, Message message, String body) {
        String title = chatNotificationUtilService.getNotificationTitle(message);

        Map<String, String> data = buildNotificationData(
            message.getConversation().getId(), 
            message.getId()
        );

        NotificationRequestDTO notificationsRequest = new NotificationRequestDTO(tokens, title, body, data);
        notificationServiceFactory.sendNotification(notificationsRequest);
    }

    private Map<String, String> buildNotificationData(Long conversationId, Long messageId) {
        Map<String, String> data = new HashMap<>();
        data.put("conversationId", String.valueOf(conversationId));
        data.put("messageId", String.valueOf(messageId));
        return data;
    }

    /**
     * Save new device token in database
     *
     * @param userId logged in user id
     * @param deviceTokenUpsertDTO device token details
     */
    @Transactional
    public void saveDeviceToken( Long userId, DeviceTokenUpsertDTO deviceTokenUpsertDTO){
        ChatUser user = userService.getUserOrThrow(userId);
        Optional<ChatNotification> isExist =
                chatNotificationRepository.findByToken(deviceTokenUpsertDTO.getToken());

        try {
            if(isExist.isEmpty()){
                ChatNotification chatNotification = DeviceTokenUpsertDTO.toChatNotification(deviceTokenUpsertDTO);
                chatNotification.setChatUser(user);
                chatNotificationRepository.save(chatNotification);
            }
        } catch (Exception e) {
            logger.error("Failed to save device token for user ID: {}", userId, e);
        }
    }

    /**
     * Delete device tokens by user email
     *
     * @param email user email
     */
    @Transactional
    public void deleteDeviceTokens(String email){
        chatNotificationRepository.deleteChatNotificationsByChatUser_Email(email);
    }

    /**
     * Send message notifications
     *
     * @param conversationId conversation id
     * @param loggedInUserId logged in user id
     * @param message message
     */
    public void sendMessageNotificationsToParticipants(Long conversationId, Long loggedInUserId, Message message) {

        boolean mentionsAll = message.getMessageText().toLowerCase().contains(Constants.MENTION_ALL);

        List<Long> mentionedUsers = mentionsAll
                ? List.of()
                : messageMentionService.getMentionedUsersByUsernames(message.getMessageText()).stream().map(ChatUser::getId).collect(Collectors.toList());

        List<String> tokens = chatNotificationRepository.findTokensByConversationId(conversationId, loggedInUserId, false, mentionsAll, mentionedUsers);

        if (tokens.isEmpty()) {
            return;
        }

        String body = message.getConversation().getIsGroup()
            ? message.getSender().getFirstName() + ": " + message.getMessageText() 
            : message.getMessageText();

        buildAndDispatchNotification(tokens, message, body);
    }

    /**
     * Send message reaction notifications
     *
     * @param message message
     * @param loggedInUser logged in user
     */
    public void sendMessageReactionNotifications(Message message, ChatUser loggedInUser) {
        List<String> tokens = chatNotificationRepository.findNonMutedTokensByUserId(message.getSender().getId());

        if (tokens.isEmpty()) {
            return;
        }

        String body = loggedInUser.getFirstName() + " " + loggedInUser.getLastName() + " reacted to your message";

        buildAndDispatchNotification(tokens, message, body);
    }
}

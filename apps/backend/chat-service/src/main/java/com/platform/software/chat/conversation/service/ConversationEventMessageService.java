package com.platform.software.chat.conversation.service;

import com.platform.software.chat.conversation.entity.ConversationEvent;
import com.platform.software.chat.message.dto.MessageViewDTO;
import com.platform.software.chat.user.entity.ChatUser;
import org.springframework.stereotype.Service;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.concurrent.TimeUnit;

@Service
public class ConversationEventMessageService {

    /**
     * Generates a human-readable event description message
     * @param event The conversation event
     * @param loggedInUserId The ID of the currently logged-in user (can be null)
     * @return Formatted event message string
     */
    public String generateEventMessage(ConversationEvent event, Long loggedInUserId) {
        if (event == null || event.getEventType() == null) {
            return "Unknown event";
        }

        String actorName = getUserDisplayName(event.getActorUser(), loggedInUserId);
        String targetName = getUserDisplayName(event.getTargetUser(), loggedInUserId);
        String timeDescription = getTimeDescription(event.getMessage() != null ?
            event.getMessage().getCreatedAt() : event.getCreatedAt());

        return switch (event.getEventType()) {
            case GROUP_CREATED -> String.format("Group created %s by %s", timeDescription, actorName);
            case USER_ADDED -> String.format("%s added %s %s", actorName, targetName, timeDescription);
            case USER_REMOVED -> String.format("%s removed %s %s", actorName, targetName, timeDescription);
            case USER_LEFT -> String.format("%s left the group %s", actorName, timeDescription);
            case USER_JOINED -> String.format("%s joined the group %s", actorName, timeDescription);
            case GROUP_RENAMED -> String.format("Group renamed %s by %s", timeDescription, actorName);
            case GROUP_IMAGE_CHANGED -> String.format("Group image changed %s by %s", timeDescription, actorName);
            case GROUP_DESCRIPTION_CHANGED ->
                String.format("Group description changed %s by %s", timeDescription, actorName);
            case USER_PROMOTED_TO_ADMIN ->
                String.format("%s promoted %s to admin %s", actorName, targetName, timeDescription);
            case USER_REMOVED_FROM_ADMIN ->
                String.format("%s removed %s from admin %s", actorName, targetName, timeDescription);
            default -> "Unknown event";
        };
    }

    /**
     * Gets user display name in format "FirstName LastName" or "You" if it's the logged-in user
     */
    private String getUserDisplayName(ChatUser user, Long loggedInUserId) {
        if (user == null) {
            return "Unknown User";
        }

        // Check if this is the logged-in user
        if (loggedInUserId != null && user.getId() != null && user.getId().equals(loggedInUserId)) {
            return "You";
        }

        if (user.getFirstName() != null && user.getLastName() != null) {
            return user.getFirstName() + " " + user.getLastName();
        }

        if (user.getFirstName() != null) {
            return user.getFirstName();
        }

        if (user.getEmail() != null) {
            return user.getEmail();
        }

        return "Unknown User";
    }

    /**
     * Generates relative time description (e.g., "today", "yesterday", "2 days ago")
     */
    private String getTimeDescription(Date eventTime) {
        if (eventTime == null) {
            return "recently";
        }

        Date now = new Date();
        long diffInMillis = now.getTime() - eventTime.getTime();
        long daysBetween = TimeUnit.MILLISECONDS.toDays(diffInMillis);

        if (daysBetween == 0) {
            return "today";
        } else if (daysBetween == 1) {
            return "yesterday";
        } else if (daysBetween < 7) {
            return daysBetween + " days ago";
        } else {
            // Format as date for older events
            SimpleDateFormat formatter = new SimpleDateFormat("MMM dd, yyyy");
            return "on " + formatter.format(eventTime);
        }
    }

    /**
     * Sets the formatted message text on the MessageViewDTO
     */
    public void setEventMessageText(ConversationEvent event, MessageViewDTO view, Long loggedInUserId) {
        if (event != null && view != null) {
            String messageText = generateEventMessage(event, loggedInUserId);
            view.setMessageText(messageText);
        }
    }
}
package com.platform.software.common.constants;

/**
 * Centralized WebSocket topic destinations.
 *
 * <p>
 * All topic paths are defined with a trailing slash ("/"),
 * so user-specific identifiers (e.g. encoded email) can be
 * appended directly.
 * </p>
 */
public final class WebSocketTopicConstants {

    private WebSocketTopicConstants() {
        // prevent instantiation
    }

    /** New conversation created event */
    public static final String CONVERSATION_CREATED = "/topic/conversation-created/";

    /** New message received event */
    public static final String MESSAGE_RECEIVED = "/topic/message-received/";

    /** Online status event */
    public static final String ONLINE_STATUS = "/topic/online-status/";

    /** Message unsent event */
    public static final String MESSAGE_UNSENT = "/topic/message-unsent/";

    /** Message reaction event */
    public static final String MESSAGE_REACTION = "/topic/message-reaction/";

}

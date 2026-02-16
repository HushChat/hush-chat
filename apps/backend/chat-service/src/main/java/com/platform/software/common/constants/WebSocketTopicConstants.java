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

    /** Conversation Metadata Update **/
    public static final String CONVERSATION_UPDATED = "/topic/conversation-updated/";
  
    /** Message unsent event */
    public static final String MESSAGE_UNSENT = "/topic/message-unsent/";

    /** Message reaction event */
    public static final String MESSAGE_REACTION = "/topic/message-reaction/";

    /** Message seen event */
    public static final String MESSAGE_READ = "/topic/message-read/";
  
    /** Typing event */
    public static final String TYPING_STATUS = "/topic/typing-status/";

    /** Message pinned event */
    public static final String MESSAGE_PINNED = "/topic/message-pinned/";
  
    /** Message updated event */
    public static final String MESSAGE_UPDATED = "/topic/message-updated/";

    /** Incoming call event */
    public static final String CALL_INCOMING = "/topic/call-incoming/";

    /** Call answer (SDP answer) event */
    public static final String CALL_ANSWER = "/topic/call-answer/";

    /** ICE candidate exchange event */
    public static final String CALL_ICE_CANDIDATE = "/topic/ice-candidate/";

    /** Call ended event */
    public static final String CALL_ENDED = "/topic/call-ended/";

    /** Call rejected event */
    public static final String CALL_REJECTED = "/topic/call-rejected/";

    /** Call busy event */
    public static final String CALL_BUSY = "/topic/call-busy/";

}

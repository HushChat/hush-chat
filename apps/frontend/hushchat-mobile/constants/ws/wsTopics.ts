export const WS_URL_PATH = "/ws-message-subscription";

export const WS_TOPICS = {
  conversation: {
    created: "/topic/conversation-created/",
  },
  message: {
    received: "/topic/message-received/",
    unsent: "/topic/message-unsent/",
    react: "/topic/message-reaction/",
    typing: "/topic/typing-status/",
    read: "/topic/message-read/",
  },
  user: {
    onlineStatus: "/topic/online-status/",
  },
} as const;

// All topic string values ("/topic/...")
export type WSTopic = {
  [K in keyof typeof WS_TOPICS]: (typeof WS_TOPICS)[K][keyof (typeof WS_TOPICS)[K]];
}[keyof typeof WS_TOPICS];

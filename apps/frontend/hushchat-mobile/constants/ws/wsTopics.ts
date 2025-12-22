export const WS_TOPICS = {
  conversation: {
    created: "/topic/conversation-created/",
  },
  message: {
    received: "/topic/message-received/",
    unsent: "/topic/message-unsent/",
    react: "/topic/message-reaction/",
  },
  user: {
    onlineStatus: "/topic/online-status/",
  },
} as const;

// All topic string values ("/topic/...")
export type WSTopic = {
  [K in keyof typeof WS_TOPICS]: (typeof WS_TOPICS)[K][keyof (typeof WS_TOPICS)[K]];
}[keyof typeof WS_TOPICS];

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
    pinned: "/topic/message-pinned/",
    updated: "/topic/message-updated/",
  },
  user: {
    onlineStatus: "/topic/online-status/",
  },
} as const;

// All topic string values ("/topic/...")
export type WSTopic = {
  [K in keyof typeof WS_TOPICS]: (typeof WS_TOPICS)[K][keyof (typeof WS_TOPICS)[K]];
}[keyof typeof WS_TOPICS];

// topics to subscribe
export const TOPICS = [
  { destination: WS_TOPICS.message.received, id: "sub-message-received" },
  { destination: WS_TOPICS.user.onlineStatus, id: "sub-online-status" },
  { destination: WS_TOPICS.conversation.created, id: "sub-conversation-created" },
  { destination: WS_TOPICS.message.unsent, id: "sub-message-unsent" },
  { destination: WS_TOPICS.message.react, id: "sub-message-reaction" },
  { destination: WS_TOPICS.message.typing, id: "sub-typing-status" },
  { destination: WS_TOPICS.message.read, id: "sub-message-read" },
  { destination: WS_TOPICS.message.updated, id: "sub-message-updated" },
] as const;

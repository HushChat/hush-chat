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
  call: {
    incoming: "/topic/call-incoming/",
    answer: "/topic/call-answer/",
    iceCandidate: "/topic/ice-candidate/",
    ended: "/topic/call-ended/",
    rejected: "/topic/call-rejected/",
    busy: "/topic/call-busy/",
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
  { destination: WS_TOPICS.message.pinned, id: "sub-message-pinned" },
  { destination: WS_TOPICS.call.incoming, id: "sub-call-incoming" },
  { destination: WS_TOPICS.call.answer, id: "sub-call-answer" },
  { destination: WS_TOPICS.call.iceCandidate, id: "sub-call-ice-candidate" },
  { destination: WS_TOPICS.call.ended, id: "sub-call-ended" },
  { destination: WS_TOPICS.call.rejected, id: "sub-call-rejected" },
  { destination: WS_TOPICS.call.busy, id: "sub-call-busy" },
] as const;

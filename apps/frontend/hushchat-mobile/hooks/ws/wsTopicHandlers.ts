import { WS_TOPICS, WSTopic } from "@/constants/ws/wsTopics";
import {
  emitConversationCreated,
  emitMessageReaction,
  emitMessageUnsent,
  emitNewMessage,
  emitUserStatus,
} from "@/services/eventBus";
import { IConversation, IUserStatus } from "@/types/chat/types";
import { MessageReactionPayload, MessageUnsentPayload } from "@/types/ws/types";
import { logDebug, logInfo } from "@/utils/logger";

export type TopicHandler = (body: string) => void;

export const WS_TOPIC_HANDLERS: Record<WSTopic, TopicHandler> = {
  [WS_TOPICS.message.received]: (body) => {
    const conversation = JSON.parse(body) as IConversation;
    if (conversation.messages?.length) emitNewMessage(conversation);
  },

  [WS_TOPICS.message.unsent]: (body) => {
    const payload = JSON.parse(body) as MessageUnsentPayload;
    emitMessageUnsent(payload);
  },

  [WS_TOPICS.message.react]: (body) => {
    const data = JSON.parse(body) as MessageReactionPayload;
    emitMessageReaction(data);
  },

  [WS_TOPICS.user.onlineStatus]: (body) => {
    const status = JSON.parse(body) as IUserStatus;
    emitUserStatus(status);
  },

  [WS_TOPICS.conversation.created]: (body) => {
    const conversation = JSON.parse(body) as IConversation;
    emitConversationCreated(conversation);
  },
};

const normalizeTopic = (topic: string): string => {
  // Strip "/user" prefix added by STOMP for user-specific queues
  if (topic.startsWith("/user")) {
    return topic.replace("/user", "");
  }
  return topic;
};

export const handleMessageByTopic = (topic: string, body: string) => {
  try {
    const normalizedTopic = normalizeTopic(topic);

    const handler = WS_TOPIC_HANDLERS[normalizedTopic as keyof typeof WS_TOPIC_HANDLERS];

    if (!handler) {
      logDebug("Received message from unknown topic:", normalizedTopic);
      return;
    }

    handler(body);
  } catch (error) {
    logInfo("Error handling WebSocket message:", topic, error);
  }
};

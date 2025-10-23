import { Ionicons } from '@expo/vector-icons';
import React, { ReactNode } from 'react';
import { TUser } from '@/types/user/types';
import { PagePaginatedQueryResult } from '@/query/usePaginatedQuery';

export interface IConversation {
  id: number;
  name: string;
  isGroup: boolean;
  createdAt: string;
  signedImageUrl: string | null;
  messages: IMessage[];
  favoriteByLoggedInUser: boolean;
  description: string;
  pinnedByLoggedInUser: boolean;
  mutedByLoggedInUser: boolean;
}

export interface ReactionSummary {
  counts: Record<string, number>;
  currentUserReaction: string;
}

export interface IMessageAttachment {
  mimeType: string;
  id: number;
  originalFileName: string;
  indexedFileName: string;
  fileUrl: string;
}

export interface IMessage {
  id: number;
  senderId: number;
  senderFirstName: string;
  senderLastName: string;
  parentMessageId: number | null;
  messageText: string;
  createdAt: string;
  reactionSummary?: ReactionSummary;
  conversationId: number;
  parentMessage?: IMessage;
  isForwarded: boolean;
  isUnsend?: boolean;
  mentions?: TUser[];
  messageAttachments?: IMessageAttachment[];
}

export interface IMessageView extends IMessage {
  senderFirstName: string;
  senderLastName: string;
  isSeen?: boolean;
}

export interface IFilter {
  key: ConversationType;
  label: string;
  isActive: boolean;
}

export interface ChatComponentProps {
  chatItemList: ReactNode;
  conversationsRefetch: () => void;
  conversationsLoading: boolean;
  filters: IFilter[];
  selectedConversation: IConversation | null;
  setSelectedConversation: (conversation: IConversation | null) => void;
  onSearchQueryInserting?: (searchQuery: string) => void;
  searchQuery?: string;
}

export enum ConversationType {
  ALL = 'ALL',
  ARCHIVED = 'ARCHIVED',
  FAVORITES = 'FAVORITES',
  UNREAD = 'UNREAD',
}

export interface oneToOneChatInfo {
  userView: UserView;
  imageUrl: string;
  blocked: boolean;
  favorite: boolean;
  pinned: boolean;
  mutedUntil: number | null;
}

export interface UserView {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  signedImageUrl: string;
}

export interface IOption {
  id: number;
  name: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  action: () => void | Promise<void>;
  critical?: boolean;
  iconComponent?: (props: { size: number }) => JSX.Element;
}

export enum ReactionType {
  THUMBS_UP = 'THUMBS_UP',
  LOVE = 'LOVE',
  HAHA = 'HAHA',
  WOW = 'WOW',
  ANGRY = 'ANGRY',
  SAD = 'SAD',
}

export interface IMessageReaction {
  reactionType: ReactionType;
  count: number;
  reactedByCurrentUser: boolean;
}

export interface IMessageReactions {
  messageId: number;
  reactions: IMessageReaction[];
  totalReactionsCount: number;
}

export interface IMessageReactionRequest {
  reactionType: ReactionType;
}

export interface ConversationParticipant {
  id: number;
  role: 'MEMBER' | 'ADMIN';
  user: TUser;
}

export interface MessageReact {
  id: number;
  reactionType: ReactionType;
  name: string;
}

export interface UpdateUserInput {
  id: string;
  firstName: string;
  lastName: string;
  imageFileName: string;
}

export interface Conversation {
  id: number;
  name: string;
  conversationParticipants: PagePaginatedQueryResult<ConversationParticipant>['pages'];
  signedImageUrl: string | null;
}

export interface GroupProfile {
  conversation: Conversation;
  mutedUntil: number | null;
  participantCount: number;
  pinned: boolean;
  favorite: boolean;
  admin: boolean;
  active: boolean;
}

export interface IBasicMessage {
  id: number;
  senderId: number;
  senderFirstName: string | null;
  senderLastName: string | null;
  messageText: string;
}

export interface ConversationAPIResponse {
  id: number;
  isGroup: boolean;
  isBlocked: boolean;
  signedImageUrl: string | null;
  isActive: boolean;
  name: string;
  pinnedMessage?: IBasicMessage | null;
}

export interface IGroupConversation {
  name: string;
  participantUserIds?: number[];
  description?: string;
  imageFileName?: string | null;
}

export enum ConversationSearchResultKeys {
  CHATS = 'chats',
  MESSAGES = 'messages',
  USERS = 'users',
}

export interface ISearchResults {
  users?: TUser[];
  chats?: IConversation[];
  messages?: IConversation[];
}

export interface ISectionedSearchResult extends ISearchResults {
  _isHeader?: boolean;
  _headerTitle?: ConversationSearchResultKeys;
  _sectionType?: ConversationSearchResultKeys;
  _uniqueKey?: string;
}

export interface TMessageForward {
  forwardedMessageIds: number[];
  conversationIds: number[];
  customText: string;
}

export interface ConversationInfo {
  conversationId: number;
  conversationName: string;
  signedImageUrl: string;
}

export type TPickerState = {
  openPickerMessageId: string | null;
  setOpenPickerMessageId: React.Dispatch<React.SetStateAction<string | null>>;
};

export type TImagePreviewProps = {
  visible: boolean;
  images: IMessageAttachment[];
  initialIndex: number;
  onClose: () => void;
};

export enum chatUserRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export const REACTION_EMOJIS: Record<ReactionType, string> = {
  THUMBS_UP: '👍',
  LOVE: '❤️',
  HAHA: '😂',
  WOW: '😮',
  SAD: '😢',
  ANGRY: '😠',
};

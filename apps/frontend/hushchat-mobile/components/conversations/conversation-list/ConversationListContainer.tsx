import { useCallback } from "react";
import { ISearchResults, IConversation } from "@/types/chat/types";
import { ToastUtils } from "@/utils/toastUtils";
import { useModalContext } from "@/context/modal-context";
import { MODAL_BUTTON_VARIANTS, MODAL_TYPES } from "@/components/Modal";
import SearchedConversationListView from "./SearchedConversationListView";
import RegularConversationListView from "./RegularConversationListView";
import { useDeleteConversationByIdMutation } from "@/query/delete/queries";
import { useArchiveConversationMutation } from "@/query/patch/queries";
import { useUserStore } from "@/store/user/useUserStore";
import { useConversationStore } from "@/store/conversation/useConversationStore";
import { getCriteria } from "@/utils/conversationUtils";
import { getAPIErrorMsg } from "@/utils/commonUtils";

export interface ConversationListContainerProps {
  conversations: IConversation[];
  conversationsError?: string;
  conversationsLoading: boolean;
  conversationsRefetch: () => void;
  setSelectedConversation: (conversation: IConversation | null) => void;
  fetchNextPage: () => Promise<unknown>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  selectedConversation: IConversation | null;
  searchedConversationsResult: ISearchResults;
  isSearchingConversations: boolean;
  errorWhileSearchingConversation?: string;
  searchQuery?: string;
  refetchSearchResults?: () => void;
}

export default function ConversationListContainer({
  conversations,
  conversationsError,
  conversationsLoading,
  conversationsRefetch,
  setSelectedConversation,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  selectedConversation,
  searchedConversationsResult,
  isSearchingConversations,
  errorWhileSearchingConversation,
  searchQuery = "",
  refetchSearchResults,
}: ConversationListContainerProps) {
  const { openModal, closeModal } = useModalContext();
  const {
    user: { id: userId },
  } = useUserStore();
  const { selectedConversationType } = useConversationStore();
  const criteria = getCriteria(selectedConversationType);

  const deleteConversation = useDeleteConversationByIdMutation(
    {
      userId: Number(userId),
      criteria,
    },
    () => {
      ToastUtils.success("Conversation deleted successfully!");
      closeModal();
    },
    (error) => {
      ToastUtils.error(error as string);
    }
  );

  const archiveConversation = useArchiveConversationMutation(
    {
      userId: Number(userId),
      criteria,
    },
    () => {
      if (searchQuery) {
        refetchSearchResults?.();
      }
    },
    (error) => {
      ToastUtils.error(getAPIErrorMsg(error));
    }
  );

  const handleArchivePress = useCallback(
    async (conversationId: number) => {
      archiveConversation.mutate(conversationId);
    },
    [archiveConversation]
  );

  const handleDeleteConversation = useCallback(
    (conversationId: number) => {
      openModal({
        type: MODAL_TYPES.confirm,
        title: "Delete Conversation?",
        description: "Are you sure you want to delete this conversation?",
        buttons: [
          { text: "Cancel", onPress: closeModal },
          {
            text: "Delete",
            onPress: () => {
              deleteConversation.mutate(conversationId, {
                onSuccess: () => {
                  if (selectedConversation?.id === conversationId) {
                    setSelectedConversation(null);
                  }
                },
              });
            },
            variant: MODAL_BUTTON_VARIANTS.destructive,
          },
        ],
        icon: "trash-bin",
      });
    },
    [openModal, closeModal, deleteConversation, selectedConversation?.id, setSelectedConversation]
  );

  const isSearchActive = searchQuery && searchQuery.length > 0;

  if (isSearchActive) {
    return (
      <SearchedConversationListView
        searchedConversationsResult={searchedConversationsResult}
        isSearchingConversations={isSearchingConversations}
        errorWhileSearchingConversation={errorWhileSearchingConversation}
        searchQuery={searchQuery}
        selectedConversation={selectedConversation}
        setSelectedConversation={setSelectedConversation}
        onArchive={handleArchivePress}
        onDelete={handleDeleteConversation}
        onRefresh={conversationsRefetch}
      />
    );
  }

  // Render regular conversation list when no search
  return (
    <RegularConversationListView
      conversations={conversations}
      conversationsError={conversationsError}
      conversationsLoading={conversationsLoading}
      conversationsRefetch={conversationsRefetch}
      setSelectedConversation={setSelectedConversation}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      selectedConversation={selectedConversation}
      onArchive={handleArchivePress}
      onDelete={handleDeleteConversation}
    />
  );
}

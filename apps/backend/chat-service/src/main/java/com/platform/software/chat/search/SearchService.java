/**
 * Copyright (c) 2025, HushChat (https://gethush.chat)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

package com.platform.software.chat.search;

import com.platform.software.chat.conversation.dto.ConversationDTO;
import com.platform.software.chat.conversation.dto.ConversationFilterCriteriaDTO;
import com.platform.software.chat.conversation.dto.ConversationSearchResults;
import com.platform.software.chat.conversation.repository.ConversationRepository;
import com.platform.software.chat.conversationparticipant.repository.ConversationParticipantRepository;
import com.platform.software.chat.message.dto.MessageViewDTO;
import com.platform.software.chat.message.entity.Message;
import com.platform.software.chat.message.repository.MessageRepository;
import com.platform.software.chat.user.dto.UserDTO;
import com.platform.software.chat.user.dto.UserFilterCriteriaDTO;
import com.platform.software.chat.user.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class SearchService {
    private final int MAX_SEARCH_RESULT_SIZE = 25;
    private final int MIN_SEARCH_KEYWORD_SIZE = 2;

    private final ConversationParticipantRepository conversationParticipantRepository;
    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final UserService userService;

    public SearchService(
        ConversationParticipantRepository conversationParticipantRepository,
        MessageRepository messageRepository,
        ConversationRepository conversationRepository,
        UserService userService
    ) {
        this.conversationParticipantRepository = conversationParticipantRepository;
        this.messageRepository = messageRepository;
        this.conversationRepository = conversationRepository;
        this.userService = userService;
    }

    /**
     * Search keywords across conversations.
     * 1. find by conversation name - if conversation is one to one, then search by other participant's name
     * 2. find by messages
     *
     * @param userId          the user id
     * @param searchRequestDTO the message search request dto
     * @return the list of conversations
     */
    public ConversationSearchResults searchKeywordAcrossConversations(Long userId, SearchRequestDTO searchRequestDTO) {
        String searchKeyword = searchRequestDTO.getSearchKeyword();
        if (searchKeyword == null || searchKeyword.trim().length() <= MIN_SEARCH_KEYWORD_SIZE) {
            return new ConversationSearchResults();
        }
        Pageable pageable = PageRequest.of(0, MAX_SEARCH_RESULT_SIZE);

        List<UserDTO> userWithNameMatched = getUsersWithConversations(searchKeyword, pageable, userId);
        List<ConversationDTO> conversationsWithNameMatched = conversationsWithNameMatched(searchKeyword, userId, pageable);
        List<ConversationDTO> conversationsWithMessagesMatched = new ArrayList<>();

        if(searchRequestDTO.isIncludeMessages()){
            conversationsWithMessagesMatched = conversationsWithMessagesMatched(searchKeyword, userId, pageable);
        }

        ConversationSearchResults conversationSearchResults = new ConversationSearchResults(
            userWithNameMatched, conversationsWithNameMatched, conversationsWithMessagesMatched
        );
        
        return conversationSearchResults;
    }

    private List<UserDTO> getUsersWithConversations(String searchKeyword, Pageable pageable, Long loggedInUserId) {
        UserFilterCriteriaDTO userFilterCriteriaDTO = new UserFilterCriteriaDTO();
        userFilterCriteriaDTO.setKeyword(searchKeyword);

        Page<UserDTO> userDTOPage = userService.getAllUsersWithConversations(
            pageable, userFilterCriteriaDTO, loggedInUserId
        );
        
        return userDTOPage.getContent();
    }

    /**
     * Finds conversations containing messages that match the search keyword.
     * Only searches within conversations that the logged-in user participates in.
     *
     * @param searchKeyword the keyword to search for in message content
     * @param loggedInUserId the ID of the currently logged-in user
     * @param pageable pagination information for limiting and sorting results
     * @return a list of ConversationDTO objects containing the matched messages,
     *         where each conversation includes only the matching message(s)
     */
    private List<ConversationDTO> conversationsWithMessagesMatched(String searchKeyword, Long loggedInUserId, Pageable pageable) {
        List<ConversationDTO> loggedInUserAllConversations = conversationParticipantRepository.findAllConversationsByUserId(loggedInUserId);

        Set<Long> conversationIds = loggedInUserAllConversations.stream()
                .map(ConversationDTO::getId).collect(Collectors.toSet());
        Page<Message> messagePage = messageRepository.findBySearchTermInConversations(searchKeyword, conversationIds, pageable);

        List<ConversationDTO> conversationsFromMessages  = messagePage.getContent()
                .stream()
                .map(m -> {
                    ConversationDTO conversationDTO = new ConversationDTO(m.getConversation());
                    conversationDTO.setMessages(List.of(new MessageViewDTO(m)));
                    return conversationDTO;
                })
                .toList();

        Map<Long, String> nameById = loggedInUserAllConversations.stream()
                .filter(c -> c.getId() != null && c.getName() != null)
                .collect(Collectors.toMap(ConversationDTO::getId, ConversationDTO::getName));

        List<ConversationDTO> updatedConversations  = conversationsFromMessages .stream()
                .map(dto -> {
                    if(!dto.getIsGroup()) {
                        String name = nameById.get(dto.getId());
                        dto.setName(name);
                    }
                    return dto;
                }).toList();

        return updatedConversations;
    }

    /**
     * Searches for conversations whose names/titles match the given search keyword.
     * Only returns conversations that the logged-in user participates in.
     *
     * @param searchKeyword the keyword to search for in conversation names
     * @param loggedInUserId the ID of the currently logged-in user
     * @param pageable pagination information for limiting and sorting results
     * @return a list of ConversationDTO objects representing conversations with matching names,
     *         including their latest messages
     */
    private List<ConversationDTO> conversationsWithNameMatched(String searchKeyword, Long loggedInUserId, Pageable pageable) {
        ConversationFilterCriteriaDTO conversationFilterCriteria = new ConversationFilterCriteriaDTO();
        conversationFilterCriteria.setSearchKeyword(searchKeyword);

        Page<ConversationDTO> conversationDTOPage = conversationRepository.findAllConversationsByUserIdWithLatestMessages(
            loggedInUserId, conversationFilterCriteria, pageable
        );

        return conversationDTOPage.getContent();
    }
}

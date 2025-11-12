package com.platform.software.chat.search;

import com.platform.software.chat.conversation.dto.ConversationSearchResults;
import com.platform.software.config.security.AuthenticatedUser;
import com.platform.software.config.security.model.UserDetails;
import io.swagger.annotations.ApiOperation;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SearchController {

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    /**
     * Search keyword from conversations, users and messages.
     *
     * @param userDetails      the user details
     * @param searchRequestDTO the search request dto
     * @return the response entity
     */
    @ApiOperation(value = "search keyword from conversations, users and messages", response = ConversationSearchResults.class)
    @PostMapping("search")
    public ResponseEntity<ConversationSearchResults> searchKeywordAcrossConversations(
            @AuthenticatedUser UserDetails userDetails,
            @RequestBody SearchRequestDTO searchRequestDTO
    ) {
        ConversationSearchResults results = searchService.searchKeywordAcrossConversations(
                userDetails.getId(), searchRequestDTO
        );
        return new ResponseEntity<>(results, HttpStatus.OK);
    }
}

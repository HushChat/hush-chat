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

package com.platform.software.chat.message.controller;

import com.platform.software.chat.message.dto.*;
import com.platform.software.chat.message.service.FavoriteMessageService;
import com.platform.software.chat.message.service.MessageReactionService;
import com.platform.software.chat.message.service.MessageService;
import com.platform.software.config.security.AuthenticatedUser;
import com.platform.software.config.security.model.UserDetails;
import io.swagger.annotations.ApiOperation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/messages")
public class MessageController {
    private final FavoriteMessageService favoriteMessageService;
    private final MessageReactionService messageReactionService;
    private final MessageService messageService;

    public MessageController(FavoriteMessageService favoriteMessageService, MessageReactionService messageReactionService, MessageService messageService) {
        this.favoriteMessageService = favoriteMessageService;
        this.messageReactionService = messageReactionService;
        this.messageService = messageService;
    }

    /**
     * Create a favorite message for the authenticated user.
     *
     * @param authenticatedUser the authenticated user details
     * @param messageId the ID of the message to be favorited
     * @return ResponseEntity containing the created MessageViewDTO
     */
    @ApiOperation(value = "Create favorite message", response = MessageViewDTO.class)
    @PostMapping("{messageId}/favorite")
    public ResponseEntity<MessageViewDTO> createFavoriteMessage(
        @AuthenticatedUser UserDetails authenticatedUser,
        @PathVariable Long messageId
    ) {
        MessageViewDTO favoriteMessage = favoriteMessageService.createFavoriteMessage(
            authenticatedUser.getId(),
            messageId
        );
        return ResponseEntity.ok(favoriteMessage);
    }

    /**
     * Forward messages to one or more conversations.
     *
     * @param userDetails the authenticated user details
     * @param messageForwardRequestDTO the request DTO containing message forwarding details
     * @return ResponseEntity with HTTP status OK
     */
    @ApiOperation(value = "forward messages to conversations")
    @PutMapping("forward")
    public ResponseEntity<Void> forwardMessages(
            @AuthenticatedUser UserDetails userDetails,
            @RequestBody MessageForwardRequestDTO messageForwardRequestDTO
    ) {
        messageService.forwardMessages(userDetails.getId(), messageForwardRequestDTO);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    /**
     * Get all favorite messages for the logged-in user.
     *
     * @param authenticatedUser the authenticated user details
     * @param pageable pagination information
     * @return ResponseEntity containing a page of MessageViewDTO
     */
    @ApiOperation(value = "Get all favorite messages for logged in user", response = Page.class)
    @GetMapping("favorites")
    public ResponseEntity<Page<MessageViewDTO>> getFavoriteMessages(
        @AuthenticatedUser UserDetails authenticatedUser,
        Pageable pageable
    ) {
        Page<MessageViewDTO> favoriteMessages = favoriteMessageService.getFavoriteMessagesByUserId(
            authenticatedUser.getId(),
            pageable
        );
        return ResponseEntity.ok(favoriteMessages);
    }

    /**
     * Unfavorite a message for the authenticated user.
     *
     * @param authenticatedUser the authenticated user details
     * @param messageId the ID of the message to be unfavorited
     * @return ResponseEntity with HTTP status NO_CONTENT
     */
    @ApiOperation(value = "Unfavorite a message")
    @DeleteMapping("{messageId}/favorite")
    public ResponseEntity<Void> deleteFavoriteMessage(
        @AuthenticatedUser UserDetails authenticatedUser,
        @PathVariable Long messageId
    ) {
        favoriteMessageService.deleteFavoriteMessage(
            authenticatedUser.getId(),
            messageId
        );
        return ResponseEntity.noContent().build();
    }

    /**
     * Add a reaction to a message.
     *
     * @param authenticatedUser the authenticated user details
     * @param messageId the ID of the message to react to
     * @param messageReactionUpsertDTO the DTO containing reaction details
     * @return ResponseEntity with HTTP status NO_CONTENT
     */
    @ApiOperation(value = "Add reaction to a message")
    @PostMapping("{messageId}/reactions")
    public ResponseEntity<Void> addMessageReaction(
        @AuthenticatedUser UserDetails authenticatedUser,
        @PathVariable Long messageId,
        @RequestBody MessageReactionUpsertDTO messageReactionUpsertDTO
    ) {
        messageReactionService.addReaction(
            messageReactionUpsertDTO,
            authenticatedUser.getId(),
            messageId
        );
        return ResponseEntity.noContent().build();
    }

    /**
     * Remove a reaction from a message.
     *
     * @param authenticatedUser the authenticated user details
     * @param messageId the ID of the message to remove reaction from
     * @return ResponseEntity with HTTP status NO_CONTENT
     */
    @ApiOperation(value = "Remove reaction from a message")
    @DeleteMapping("{messageId}/reactions")
    public ResponseEntity<Void> removeMessageReaction(
        @AuthenticatedUser UserDetails authenticatedUser,
        @PathVariable Long messageId
    ) {
        messageReactionService.removeReaction(
            authenticatedUser.getId(),
            messageId
        );
        return ResponseEntity.noContent().build();
    }

    @ApiOperation(value = "Get message thread with replies and optional parent chain", response = MessageThreadResponseDTO.class)
    @GetMapping("{messageId}/thread")
    public ResponseEntity<MessageThreadResponseDTO> getMessageThread(
        @AuthenticatedUser UserDetails authenticatedUser,
        @PathVariable Long messageId,
        @RequestParam(defaultValue = "false") boolean includeParentChain
    ) {
        MessageThreadResponseDTO threadResponse = messageService.getMessageThread(
            authenticatedUser.getId(),
            messageId,
            includeParentChain
        );
        return ResponseEntity.ok(threadResponse);
    }

    /** unsend a message in a conversation
     *
     * @param messageId the id of message that need to unsend
     * @param userDetails the authenticated user details
     * @return ResponseEntity with status NO_CONTENT
     */
    @ApiOperation(value = "unsend a message")
    @PatchMapping("{messageId}/unsend")
    public ResponseEntity<Void> unSendMessage( @PathVariable Long messageId, @AuthenticatedUser UserDetails userDetails) {
        messageService.unsendMessage(userDetails.getId(), messageId);
        return ResponseEntity.ok().build();
    }

    /**
     * get reactions by Message id
     *
     * @param messageId the id of message
     * @param pageable pagination information
     * @return page of MessageReactionViewDTO
     */
    @ApiOperation(value = "get reactions of a message")
    @GetMapping("{messageId}/reactions")
    public ResponseEntity<Page<MessageReactionViewDTO>> getReactions(
            @PathVariable Long messageId,
            Pageable pageable,
            @AuthenticatedUser UserDetails userDetails
    ) {
        return ResponseEntity.ok(messageReactionService
                .getMessageReactions(messageId, userDetails.getId(), pageable)
        );
    }
}
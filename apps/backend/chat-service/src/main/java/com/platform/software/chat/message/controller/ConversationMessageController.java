package com.platform.software.chat.message.controller;

import com.platform.software.chat.conversation.readstatus.dto.MessageLastSeenRequestDTO;
import com.platform.software.chat.conversation.readstatus.service.ConversationReadStatusService;
import com.platform.software.chat.conversation.service.ConversationService;
import com.platform.software.chat.message.dto.MessageUpsertDTO;
import com.platform.software.chat.message.dto.MessageViewDTO;
import com.platform.software.chat.message.service.MessageService;
import com.platform.software.config.aws.SignedURLResponseDTO;
import com.platform.software.config.security.AuthenticatedUser;
import com.platform.software.config.security.model.UserDetails;
import com.platform.software.controller.external.IdBasedPageRequest;
import io.swagger.annotations.ApiOperation;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/conversations/{conversationId}/messages")
public class ConversationMessageController {

    // This controller will handle conversation-specific message operations
    // You can define methods here to handle message retrieval, creation, etc. for a specific conversation

    private final MessageService messageService;
    private final ConversationService conversationService;
    private final ConversationReadStatusService conversationReadStatusService;

    public ConversationMessageController(MessageService messageService, ConversationService conversationService, ConversationReadStatusService conversationReadStatusService) {
        this.messageService = messageService;
        this.conversationService = conversationService;
        this.conversationReadStatusService = conversationReadStatusService;
    }

    /**
     * Create messages for a specific conversation.
     *
     * @param conversationId the ID of the conversation
     * @param messageDTO     the message data transfer object containing message details
     * @param userDetails    the authenticated user details
     * @return ResponseEntity containing the created MessageViewDTO
     */
    @ApiOperation(value = "create messages for a conversation", response = MessageViewDTO.class)
    @PostMapping("")
    public ResponseEntity<MessageViewDTO> createMessages(
            @PathVariable Long conversationId,
            @RequestBody MessageUpsertDTO messageDTO,
            @AuthenticatedUser UserDetails userDetails
    ) {
        MessageViewDTO newMessage = messageService.createMessage(
                messageDTO, conversationId, userDetails.getId()
        );
        return new ResponseEntity<>(newMessage, HttpStatus.OK);
    }

    @ApiOperation(value = "Signind urls generate to upload message attachments", response = SignedURLResponseDTO.class)
    @PostMapping("/upload-signed-url")
    public ResponseEntity<SignedURLResponseDTO> generateSignedURLForMessageAttachmentUpload(
            @PathVariable Long conversationId,
            @RequestBody MessageUpsertDTO messageDTO,
            @AuthenticatedUser UserDetails userDetails
    ) {
        SignedURLResponseDTO signedURLResponseDTO = messageService.getSignedURLResponseDTOAndCreateMessage(
                messageDTO, conversationId, userDetails.getId()
        );
        return new ResponseEntity<>(signedURLResponseDTO, HttpStatus.OK);
    }

    /**
     * Get messages from a specific conversation.
     *
     * @param conversationId     the ID of the conversation
     * @param userDetails        the authenticated user details
     * @param idBasedPageRequest pagination information
     * @return ResponseEntity containing a page of MessageViewDTOs
     */
    @ApiOperation(value = "get messages from a conversation", response = MessageViewDTO.class)
    @GetMapping("")
    public ResponseEntity<Page<MessageViewDTO>> getMessages(
            @PathVariable Long conversationId,
            @AuthenticatedUser UserDetails userDetails,
            IdBasedPageRequest idBasedPageRequest
    ) {
        Page<MessageViewDTO> messages = conversationService.getMessages(idBasedPageRequest, conversationId, userDetails.getId());
        return new ResponseEntity<>(messages, HttpStatus.OK);
    }


    /**
     * set last seen message of the conversation
     *
     * @param conversationId            the ID of the conversation
     * @param userDetails               the authenticated user details
     * @param messageLastSeenRequestDTO the request DTO containing last seen message details
     * @return ResponseEntity with status OK
     */
    @ApiOperation(value = "set last seen message of the conversation")
    @PutMapping("")
    public ResponseEntity<Void> setConversationLastSeenMessage(
            @PathVariable Long conversationId,
            @AuthenticatedUser UserDetails userDetails,
            @RequestBody MessageLastSeenRequestDTO messageLastSeenRequestDTO
    ) {
        conversationReadStatusService.setConversationLastSeenMessage(conversationId, userDetails.getId(), messageLastSeenRequestDTO);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    /**
     * pin a message in a conversation
     *
     * @param conversationId the ID of the conversation
     * @param messageId      the ID of the message to pin
     * @param userDetails    the authenticated user details
     * @return ResponseEntity with status OK
     */
    @ApiOperation(value = "pin/unpin a message")
    @PostMapping("{messageId}/pin")
    public ResponseEntity<Void> pinMessage(
            @PathVariable Long conversationId,
            @PathVariable Long messageId,
            @AuthenticatedUser UserDetails userDetails
    ) {
        conversationService.togglePinMessage(
                userDetails.getId(),
                conversationId,
                messageId
        );
        return ResponseEntity.ok().build();
    }

    /**
     * unpin a message in a conversation
     *
     * @param conversationId the ID of the conversation
     * @param userDetails    the authenticated user details
     * @return ResponseEntity with status NO_CONTENT
     */
    @ApiOperation(value = "unpin message")
    @PatchMapping("unpin")
    public ResponseEntity<Void> unpinMessage(
            @PathVariable Long conversationId,
            @AuthenticatedUser UserDetails userDetails
    ) {
        conversationService.unpinMessage(userDetails.getId(), conversationId);
        return ResponseEntity.noContent().build();
    }
}
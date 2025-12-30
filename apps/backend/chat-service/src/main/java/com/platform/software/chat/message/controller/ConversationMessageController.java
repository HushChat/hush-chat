package com.platform.software.chat.message.controller;

import com.platform.software.chat.conversation.readstatus.dto.ConversationReadInfo;
import com.platform.software.chat.conversation.readstatus.dto.MessageLastSeenRequestDTO;
import com.platform.software.chat.conversation.readstatus.service.ConversationReadStatusService;
import com.platform.software.chat.conversation.service.ConversationService;
import com.platform.software.chat.message.dto.MessageUpsertDTO;
import com.platform.software.chat.message.dto.MessageViewDTO;
import com.platform.software.chat.message.dto.MessageWithAttachmentUpsertDTO;
import com.platform.software.chat.message.service.MessageService;
import com.platform.software.chat.user.dto.UserBasicViewDTO;
import com.platform.software.config.aws.SignedURLResponseDTO;
import com.platform.software.config.security.AuthenticatedUser;
import com.platform.software.config.security.model.UserDetails;
import com.platform.software.controller.external.IdBasedPageRequest;
import io.swagger.annotations.ApiOperation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/conversations/{conversationId}/messages")
public class ConversationMessageController {

    // This controller will handle conversation-specific message operations
    // You can define methods here to handle message retrieval, creation, etc. for a specific conversation

    private final MessageService messageService;
    private final ConversationService conversationService;
    private final ConversationReadStatusService conversationReadStatusService;

    public ConversationMessageController(
        MessageService messageService, 
        ConversationService conversationService, 
        ConversationReadStatusService conversationReadStatusService
    ) {
        this.messageService = messageService;
        this.conversationService = conversationService;
        this.conversationReadStatusService = conversationReadStatusService;
    }

    /**
     * Create messages for a specific conversation.
     *
     * @param conversationId the ID of the conversation
     * @param messageDTO the message data transfer object containing message details
     * @param userDetails the authenticated user details
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
     * Create messages with attachments response entity.
     *
     * @param conversationId the conversation id
     * @param messageDTO     the message dto
     * @param userDetails    the user details
     * @return the response entity
     */
    @ApiOperation(value = "Signed urls generate to upload messages attachments", response = MessageViewDTO.class)
    @PostMapping("/upload-message-signed-url")
    public ResponseEntity<List<MessageViewDTO>> createMessagesWithAttachments(
        @PathVariable Long conversationId,
        @RequestBody List<MessageWithAttachmentUpsertDTO> messageDTO,
        @AuthenticatedUser UserDetails userDetails
    ) {
        List<MessageViewDTO> createdMessages = messageService.createMessagesWithAttachments(
            messageDTO, conversationId, userDetails.getId()
        );
        return new ResponseEntity<>(createdMessages, HttpStatus.OK);
    }

    /**
     * Get messages from a specific conversation.
     *
     * @param conversationId the ID of the conversation
     * @param userDetails the authenticated user details
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
     * Get conversation last read status for a user.
     *
     * @param conversationId the conversation id
     * @param userDetails    the user details
     * @return the conversation last read status
     */
    @ApiOperation(value = "Get conversation last read status for a user", response = ConversationReadInfo.class)
    @GetMapping("last-read-status")
    public ResponseEntity<ConversationReadInfo> getConversationLastReadStatus(
        @PathVariable Long conversationId,
        @AuthenticatedUser UserDetails userDetails
    ) {
        ConversationReadInfo conversationReadInfo = conversationService.getConversationReadInfo(conversationId, userDetails.getId());
        return new ResponseEntity<>(conversationReadInfo, HttpStatus.OK);
    }

    /** set last seen message of the conversation
     *
     * @param conversationId the ID of the conversation
     * @param userDetails the authenticated user details
     * @param messageLastSeenRequestDTO the request DTO containing last seen message details
     * @return ResponseEntity with status OK
     */
    @ApiOperation(value = "set last seen message of the conversation", response = ConversationReadInfo.class)
    @PutMapping("last-read-status")
    public ResponseEntity<ConversationReadInfo> setConversationLastSeenMessage(
            @PathVariable Long conversationId,
            @AuthenticatedUser UserDetails userDetails,
            @RequestBody MessageLastSeenRequestDTO messageLastSeenRequestDTO
    ) {
        ConversationReadInfo conversationReadInfo = conversationReadStatusService
            .setConversationLastSeenMessage(conversationId, userDetails.getId(), messageLastSeenRequestDTO);
        return new ResponseEntity<>(conversationReadInfo, HttpStatus.OK);
    }

    /** pin a message in a conversation
     *
     * @param conversationId the ID of the conversation
     * @param messageId the ID of the message to pin
     * @param duration the duration the message needs to be pinned
     * @param userDetails the authenticated user details
     * @return ResponseEntity with status OK
     */
    @ApiOperation(value = "pin/unpin a message")
    @PostMapping("{messageId}/pin")
    public ResponseEntity<Void> pinMessage(
            @PathVariable Long conversationId,
            @PathVariable Long messageId,
            @RequestParam(required = false) String duration,
            @AuthenticatedUser UserDetails userDetails
    ) {
        conversationService.togglePinMessage(
                userDetails.getId(),
                conversationId,
                messageId,
                duration
        );
        return ResponseEntity.ok().build();
    }

    /**
     * Edit message response entity.
     *
     * @param conversationId the conversation id
     * @param messageId      the message id
     * @param userDetails    the user details
     * @param messageDTO     the message dto
     * @return the response entity
     */
    @ApiOperation(value = "edit a message")
    @PutMapping("{messageId}")
    public ResponseEntity<Void> editMessage(
        @PathVariable Long conversationId,
        @PathVariable Long messageId,
        @AuthenticatedUser UserDetails userDetails,
        @RequestBody MessageUpsertDTO messageDTO
    ) {
        messageService.editMessage(userDetails.getId(), conversationId, messageId, messageDTO);
        return ResponseEntity.ok().build();
    }

    /** unpin a message in a conversation
     *
     * @param conversationId the ID of the conversation
     * @param userDetails the authenticated user details
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

    @ApiOperation(value = "Get a page of messages around a specific message ID", response = MessageViewDTO.class)
    @GetMapping("/{messageId}")
    public ResponseEntity<Page<MessageViewDTO>> getMessagesAroundId(
            @PathVariable Long conversationId,
            @AuthenticatedUser UserDetails userDetails,
            @PathVariable Long messageId
    ) {
        Page<MessageViewDTO> messages = conversationService.getMessagePageById(messageId, conversationId, userDetails.getId());
        return new ResponseEntity<>(messages, HttpStatus.OK);
    }

    @ApiOperation(value = "Get a page of participants who read the message", response = UserBasicViewDTO.class)
    @GetMapping("{messageId}/seen-by")
    public ResponseEntity<Page<UserBasicViewDTO>> getMessageSeenGroupParticipants(
            @PathVariable Long conversationId,
            @PathVariable Long messageId,
            @AuthenticatedUser UserDetails userDetails,
            Pageable pageable
    ) {
        Page<UserBasicViewDTO> userBasicViewDTOs = conversationService.getMessageSeenGroupParticipants(conversationId, messageId, userDetails.getId(), pageable);
        return new ResponseEntity<>(userBasicViewDTOs, HttpStatus.OK);
    }

    @PatchMapping("/{messageId}/mark-unread")
    public ResponseEntity<ConversationReadInfo> markMessageAsUnread(
            @PathVariable Long conversationId,
            @PathVariable Long messageId,
            @AuthenticatedUser UserDetails userDetails) {
        
        ConversationReadInfo readInfo = messageService.markMessageAsUnread(
            conversationId,
            userDetails.getId(),
            messageId
        );
        
        return ResponseEntity.ok(readInfo);
    }

    @GetMapping("/links")
    public ResponseEntity<Page<MessageViewDTO>> getMessagesWithLinks(
        @PathVariable Long conversationId,
        Pageable pageable
    ) {
        Page<MessageViewDTO> messages = messageService.getMessagesWithLinks(conversationId, pageable);
        return ResponseEntity.ok(messages);
    }
}
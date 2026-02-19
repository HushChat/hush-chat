package com.platform.software.chat.conversation.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.platform.software.chat.conversation.service.ConversationUtilService;
import com.platform.software.chat.message.attachment.dto.MessageAttachmentDTO;
import com.platform.software.chat.message.attachment.service.AttachmentFilterCriteria;
import com.platform.software.chat.message.attachment.service.MessageAttachmentService;
import com.platform.software.config.security.AuthenticatedUser;
import com.platform.software.config.security.model.UserDetails;
import io.swagger.annotations.ApiOperation;

import java.util.Map;

@RestController
@RequestMapping("/conversations/{conversationId}/attachments")
public class ConversationAttachmentController {
    private final MessageAttachmentService messageAttachmentService;
    private final ConversationUtilService conversationUtilService;

    public ConversationAttachmentController(
        MessageAttachmentService messageAttachmentService,
        ConversationUtilService conversationUtilService
    ) {
        this.messageAttachmentService = messageAttachmentService;
        this.conversationUtilService = conversationUtilService;
    }

    /**
     * Get attachments of a specific conversation.
     *
     * @param conversationId the ID of the conversation
     * @param filterCriteria the criteria used to filter attachments by type
     * @param pageable       pagination information 
     * @return ResponseEntity containing a Page of MessageAttachmentDTO
     */
    @ApiOperation(value = "Get conversation attachments", response = MessageAttachmentDTO.class)
    @GetMapping
    public ResponseEntity<Page<MessageAttachmentDTO>> getConversationAttachments(
        @PathVariable Long conversationId,
        AttachmentFilterCriteria filterCriteria,
        Pageable pageable,
        @AuthenticatedUser UserDetails userDetails
    ) {
        conversationUtilService.getConversationParticipantOrThrow(conversationId, userDetails.getId());
        Page<MessageAttachmentDTO> attachments = messageAttachmentService.getAttachments(conversationId, filterCriteria,
                pageable);
        return new ResponseEntity<>(attachments, HttpStatus.OK);
    }

    @ApiOperation(value = "Get a fresh download URL for an attachment")
    @GetMapping("/{attachmentId}/download-url")
    public ResponseEntity<Map<String, String>> getAttachmentDownloadUrl(
        @PathVariable Long conversationId,
        @PathVariable Long attachmentId,
        @AuthenticatedUser UserDetails userDetails
    ) {
        conversationUtilService.getConversationParticipantOrThrow(conversationId, userDetails.getId());
        String downloadUrl = messageAttachmentService.getAttachmentDownloadUrl(conversationId, attachmentId);
        return new ResponseEntity<>(Map.of("downloadUrl", downloadUrl), HttpStatus.OK);
    }
}

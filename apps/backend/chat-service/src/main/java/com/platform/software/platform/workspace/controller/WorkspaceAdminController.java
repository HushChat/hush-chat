package com.platform.software.platform.workspace.controller;

import com.platform.software.chat.conversation.dto.ConversationAdminViewDTO;
import com.platform.software.chat.conversation.service.ConversationService;
import io.swagger.annotations.ApiOperation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/workspace")
public class WorkspaceAdminController {

    private final ConversationService conversationService;

    public WorkspaceAdminController(ConversationService conversationService) {
        this.conversationService = conversationService;
    }

    @ApiOperation(value = "Get all group conversations in a workspace", response = ConversationAdminViewDTO.class)
    @GetMapping("/conversations")
    public ResponseEntity<Page<ConversationAdminViewDTO>> getAllGroupConversations( Pageable pageable )
    {
        return new ResponseEntity<>(conversationService.getAllGroupConversations(pageable), HttpStatus.OK);
    }

    @ApiOperation(value = "Delete conversation by id", response = ConversationAdminViewDTO.class)
    @DeleteMapping("/conversations/{conversationId}")
    public ResponseEntity<Void> deleteGroupConversation(
            @PathVariable Long conversationId
    ) {
        conversationService.deleteConversationById(conversationId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @ApiOperation(value = "Approve group conversation by id", response = ConversationAdminViewDTO.class)
    @PatchMapping("/conversations/{conversationId}")
    public ResponseEntity<Void> approveGroupConversation(
            @PathVariable Long conversationId
    ) {
        conversationService.approveConversationById(conversationId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}

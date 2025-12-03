package com.platform.software.platform.workspace.controller;

import com.platform.software.chat.conversation.dto.ConversationAdminViewDTO;
import com.platform.software.chat.conversation.service.ConversationService;
import io.swagger.annotations.ApiOperation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/workspaces")
public class WorkspaceAdminController {

    private final ConversationService conversationService;

    public WorkspaceAdminController(ConversationService conversationService) {
        this.conversationService = conversationService;
    }

    @ApiOperation(value = "Get all group conversations in a workspace")
    @GetMapping("/group-conversations")
    public ResponseEntity<Page<ConversationAdminViewDTO>> getAllGroupConversations( Pageable pageable )
    {
        return new ResponseEntity<>(conversationService.getAllGroupConversations(pageable), HttpStatus.OK);
    }
}

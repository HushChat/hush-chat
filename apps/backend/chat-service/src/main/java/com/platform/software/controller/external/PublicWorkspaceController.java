package com.platform.software.controller.external;

import com.platform.software.chat.message.dto.MessageUpsertDTO;
import com.platform.software.chat.message.dto.MessageViewDTO;
import com.platform.software.platform.workspace.service.WorkspaceService;
import io.swagger.annotations.ApiOperation;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/protected/workspaces")
public class PublicWorkspaceController {

    private final WorkspaceService workspaceService;

    public PublicWorkspaceController(WorkspaceService workspaceService) {
        this.workspaceService = workspaceService;
    }

    @ApiOperation(value = "Get all workspaces", response = List.class)
    @GetMapping
    public ResponseEntity<List<String>> getWorkspaces() {
        return ResponseEntity.ok(workspaceService.getAllWorkspaces());
    }

    @ApiOperation(value = "Approve new workspace creation")
    @PostMapping("{workspaceId}/approve")
    public ResponseEntity<Void> approveCreateWorkspaceRequest(
            @PathVariable Long workspaceId
    ){
        workspaceService.approveCreateWorkspaceRequest(workspaceId);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @ApiOperation(value = "create bot messages for a conversation", response = MessageViewDTO.class)
    @PostMapping("{conversationId}/message")
    public ResponseEntity<MessageViewDTO> createBotMessages(
            @PathVariable Long conversationId,
            @RequestBody MessageUpsertDTO messageDTO
    ) {
        MessageViewDTO newMessage = workspaceService.createBotMessage(
                messageDTO, conversationId
        );
        return new ResponseEntity<>(newMessage, HttpStatus.OK);
    }
}

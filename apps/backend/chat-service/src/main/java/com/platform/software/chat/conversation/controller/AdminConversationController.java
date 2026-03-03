package com.platform.software.chat.conversation.controller;

import com.platform.software.chat.conversation.dto.GroupAdminListDTO;
import com.platform.software.chat.conversation.service.ConversationService;
import com.platform.software.config.interceptors.WorkspaceAdminRestrictedAccess;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@WorkspaceAdminRestrictedAccess
@RestController
@RequestMapping("/admin/conversations")
@RequiredArgsConstructor
public class AdminConversationController {

    private final ConversationService conversationService;

    @GetMapping("/groups")
    public ResponseEntity<Page<GroupAdminListDTO>> getAdminGroupsList(
            @RequestParam(required = false, defaultValue = "") String keyword,
            Pageable pageable
    ) {
        return new ResponseEntity<>(conversationService.getGroupsForAdminList(keyword, pageable), HttpStatus.OK);
    }

    @PatchMapping("/groups/{conversationId}/disabled")
    public ResponseEntity<Void> toggleGroupDisabled(
            @PathVariable Long conversationId,
            @RequestBody Map<String, Boolean> body
    ) {
        conversationService.toggleGroupDisabled(conversationId, body.get("disabled"));
        return ResponseEntity.noContent().build();
    }
}

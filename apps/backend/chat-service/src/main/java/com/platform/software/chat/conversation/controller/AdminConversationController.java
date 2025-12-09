package com.platform.software.chat.conversation.controller;

import com.platform.software.config.interceptors.WorkspaceAdminRestrictedAccess;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@WorkspaceAdminRestrictedAccess
@RestController
@RequestMapping("/admin/conversations")
public class AdminConversationController {
}

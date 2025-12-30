package com.platform.software.chat.conversation.typingstatus;

import com.platform.software.chat.conversation.typingstatus.dto.UserTypingStatusDTO;
import com.platform.software.config.workspace.WorkspaceContext;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class TypingStatusWSService {

    private final SimpMessagingTemplate template;


    public TypingStatusWSService(SimpMessagingTemplate template) {
        this.template = template;
    }

    @Async
    public void invokeUserIsTyping(UserTypingStatusDTO userTypingStatusDTO){
        WorkspaceContext.setCurrentWorkspace(userTypingStatusDTO.getWorkspaceId());

        //send to users who opened the conversation
    }
}

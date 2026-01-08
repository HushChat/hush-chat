package com.platform.software.chat.conversation.typingstatus;

import com.platform.software.chat.conversation.typingstatus.dto.UserTypingStatusUpsertDTO;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Map;

@Controller
public class TypingStatusWSController {

    private final TypingStatusWSService typingStatusWSService;

    public TypingStatusWSController(TypingStatusWSService typingStatusWSService) {
        this.typingStatusWSService = typingStatusWSService;
    }

    @MessageMapping("/typing")
    public void handleTypingIndicator(
            UserTypingStatusUpsertDTO userTypingStatusUpsertDTO,
            @Header(SimpMessageHeaderAccessor.SESSION_ATTRIBUTES)
            Map<String, Object> sessionAttrs
    ) {
        typingStatusWSService.invokeUserIsTyping(userTypingStatusUpsertDTO, sessionAttrs);
    }
}

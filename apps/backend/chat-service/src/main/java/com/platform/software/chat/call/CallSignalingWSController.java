package com.platform.software.chat.call;

import com.platform.software.chat.call.dto.CallSignalDTO;
import com.platform.software.chat.call.service.CallSignalingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
public class CallSignalingWSController {

    private static final Logger logger = LoggerFactory.getLogger(CallSignalingWSController.class);

    private final CallSignalingService callSignalingService;

    public CallSignalingWSController(CallSignalingService callSignalingService) {
        this.callSignalingService = callSignalingService;
    }

    @MessageMapping("/call-signal")
    public void handleCallSignal(
            CallSignalDTO callSignalDTO,
            @Header(SimpMessageHeaderAccessor.SESSION_ATTRIBUTES)
            Map<String, Object> sessionAttrs
    ) {
        logger.info("[CALL DEBUG] Controller received call signal: type={}, callId={}, conversationId={}",
                callSignalDTO.getType(), callSignalDTO.getCallId(), callSignalDTO.getConversationId());
        callSignalingService.handleCallSignal(callSignalDTO, sessionAttrs);
    }
}

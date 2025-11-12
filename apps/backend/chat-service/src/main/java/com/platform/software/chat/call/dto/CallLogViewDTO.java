package com.platform.software.chat.call.dto;

import com.platform.software.chat.call.entity.CallStatusEnum;
import com.platform.software.chat.user.dto.UserViewDTO;
import lombok.Getter;
import lombok.Setter;

import java.time.ZonedDateTime;
import java.util.List;

@Getter
@Setter
public class CallLogViewDTO {
    private Long callLogId;
    private Long conversationId;
    private UserViewDTO initiator;
    private Boolean isVideo;
    private CallStatusEnum status;
    private ZonedDateTime callStartedAt;
    private ZonedDateTime callEndedAt;
    private List<CallParticipantViewDTO> participants;

    public CallLogViewDTO(
            Long callLogId,
            Long conversationId,
            UserViewDTO initiator,
            Boolean isVideo,
            CallStatusEnum callStatusEnum,
            ZonedDateTime callStartedAt,
            ZonedDateTime callEndedAt
    ) {
        this.callLogId = callLogId;
        this.conversationId = conversationId;
        this.initiator = initiator;
        this.isVideo = isVideo;
        this.status = callStatusEnum;
        this.callStartedAt = callStartedAt;
        this.callEndedAt = callEndedAt;
    }
}

package com.platform.software.chat.call.dto;

import com.platform.software.chat.call.entity.CallLog;
import com.platform.software.chat.call.entity.CallStatusEnum;
import lombok.Data;

import java.time.ZonedDateTime;
import java.util.List;

@Data
public class CallLogUpsertDTO {
    private Boolean isVideo = false;
    private ZonedDateTime callStartedAt;
    private ZonedDateTime callEndedAt;
    private CallStatusEnum status;
    private List<CallParticipantUpsertDTO> participants;

    public CallLog getCallLog() {
        CallLog callLog = new CallLog();
        callLog.setCallStartedAt(this.getCallStartedAt());
        callLog.setCallEndedAt(this.getCallEndedAt());
        callLog.setIsVideo(this.getIsVideo());
        callLog.setStatus(this.getStatus());

        return callLog;
    }
}

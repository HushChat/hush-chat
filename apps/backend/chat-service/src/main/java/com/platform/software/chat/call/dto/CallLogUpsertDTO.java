/**
 * Copyright (c) 2025, HushChat (https://gethush.chat)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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

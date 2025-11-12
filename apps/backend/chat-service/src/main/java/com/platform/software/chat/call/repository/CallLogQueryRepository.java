package com.platform.software.chat.call.repository;

import com.platform.software.chat.call.dto.CallLogViewDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CallLogQueryRepository {
    Page<CallLogViewDTO> findCallLogsByParticipantUserId(Long userId, Pageable pageable);
}

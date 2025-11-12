package com.platform.software.chat.call.repository;

import com.platform.software.chat.call.entity.CallLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CallLogRepository extends JpaRepository<CallLog, Long>, CallLogQueryRepository {
}

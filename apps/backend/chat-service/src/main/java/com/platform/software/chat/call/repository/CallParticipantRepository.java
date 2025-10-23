package com.platform.software.chat.call.repository;

import com.platform.software.chat.call.entity.CallParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CallParticipantRepository extends JpaRepository<CallParticipant, Long> {
}

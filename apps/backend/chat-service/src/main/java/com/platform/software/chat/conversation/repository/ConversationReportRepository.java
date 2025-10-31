package com.platform.software.chat.conversation.repository;

import com.platform.software.chat.conversation.entity.ConversationReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConversationReportRepository extends JpaRepository<ConversationReport, Long> {
}

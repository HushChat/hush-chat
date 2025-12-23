package com.platform.software.chat.notification.repository;

import com.platform.software.chat.notification.entity.ChatNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChatNotificationRepository extends JpaRepository<ChatNotification, Long>, ChatNotificationQueryRepository {

    Optional<ChatNotification> findByToken(String token);
    void deleteChatNotificationsByChatUser_Email(String email);
}

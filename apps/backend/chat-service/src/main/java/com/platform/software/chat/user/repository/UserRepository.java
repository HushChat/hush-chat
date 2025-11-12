package com.platform.software.chat.user.repository;

import com.platform.software.chat.user.entity.ChatUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<ChatUser, Long>, ChatUserQueryRepository {
    Optional<ChatUser> findByEmail(String email);

    List<ChatUser> findByIdInAndActiveTrueAndDeletedFalse(Collection<Long> ids);

    List<ChatUser> findByUsernameIn(Collection<String> usernames);

    long countByIdIn(List<Long> ids);
}

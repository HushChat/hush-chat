package com.platform.software.chat.user.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.platform.software.chat.user.entity.ChatUser;

public interface UserRepository extends JpaRepository<ChatUser, Long>, ChatUserQueryRepository {
    Optional<ChatUser> findByEmail(String email);

    List<ChatUser> findByIdInAndActiveTrueAndDeletedFalse(Collection<Long> ids);

    Optional<ChatUser> findByIdAndActiveTrueAndDeletedFalse(Long id);

    List<ChatUser> findByUsernameIn(Collection<String> usernames);

    long countByIdIn(List<Long> ids);
}

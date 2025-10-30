package com.platform.software.chat.user.repository;

import com.platform.software.chat.user.entity.UserBlock;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserBlockRepository extends JpaRepository<UserBlock, Long>, UserBlockQueryRepository {
    boolean existsByBlockerIdAndBlockedId(Long blockerId, Long blockedId);

    Optional<UserBlock> findByBlockerIdAndBlockedId(Long blockerId, Long blockedId);
}

package com.platform.software.chat.message.repository;

import com.platform.software.chat.message.entity.FavouriteMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FavoriteMessageRepository extends JpaRepository<FavouriteMessage, Long>, FavoriteMessageQueryRepository {
    boolean existsByUserIdAndMessageId(Long userId, Long messageId);

    Optional<FavouriteMessage> findByUserIdAndMessageId(Long userId, Long messageId);
}

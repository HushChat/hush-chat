package com.platform.software.chat.message.dto;

import lombok.Getter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import java.util.List;

@Getter
public class MessagePageResult<T> extends PageImpl<T> {
    private final boolean isFirstPage;
    private final boolean isLastPage;

    public MessagePageResult(List<T> content, Pageable pageable, long total, boolean isFirstPage, boolean isLastPage) {
        super(content, pageable, total);
        this.isFirstPage = isFirstPage;
        this.isLastPage = isLastPage;
    }

    public static <T> MessagePageResult<T> from(Page<T> page, boolean isFirstPage, boolean isLastPage) {
        return new MessagePageResult<>(
                page.getContent(),
                page.getPageable(),
                page.getTotalElements(),
                isFirstPage,
                isLastPage
        );
    }
}
package com.platform.software.chat.message.dto;

import lombok.Getter;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Getter
public class MessageWindowPage<T> extends PageImpl<T> {
    private final boolean hasMoreBefore;
    private final boolean hasMoreAfter;

    public MessageWindowPage(List<T> content, Pageable pageable, long total, boolean hasMoreBefore, boolean hasMoreAfter) {
        super(content, pageable, total);
        this.hasMoreBefore = hasMoreBefore;
        this.hasMoreAfter = hasMoreAfter;
    }
}
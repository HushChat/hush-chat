package com.platform.software.common.model;

import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;

public class CustomPageImpl<T> extends PageImpl<T> {
    private final int numberOfElements;
    private final long totalPages;
    private final boolean isEmpty;
    private final boolean isFirst;
    private final boolean isLast;

    public CustomPageImpl(List<T> content, Pageable pageable, long total,
                          int numberOfElements, long totalPages, boolean isEmpty,
                          boolean isFirst, boolean isLast) {
        super(content, pageable, total);
        this.numberOfElements = numberOfElements;
        this.totalPages = totalPages;
        this.isEmpty = isEmpty;
        this.isFirst = isFirst;
        this.isLast = isLast;
    }

    @Override
    public int getNumberOfElements() {
        return numberOfElements;
    }

    @Override
    public int getTotalPages() {
        return (int) totalPages;
    }

    @Override
    public boolean isEmpty() {
        return isEmpty;
    }

    @Override
    public boolean isFirst() {
        return isFirst;
    }

    @Override
    public boolean isLast() {
        return isLast;
    }
}

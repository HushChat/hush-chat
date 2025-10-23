package com.platform.software.controller.external;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OffsetBasedPageRequest implements Pageable {

    private int offset = 0;
    private int size = 10;

    @JsonIgnore
    private Sort sort = Sort.unsorted();

    public OffsetBasedPageRequest(int offset, int size) {
        this.offset = offset;
        this.size = size;
        this.sort = Sort.unsorted();
    }

    @JsonIgnore
    public Pageable getPageable() {
        return this;
    }

    @Override
    @JsonIgnore
    public int getPageNumber() {
        return offset / size;
    }

    @Override
    @JsonIgnore
    public int getPageSize() {
        return size;
    }

    @Override
    @JsonIgnore
    public long getOffset() {
        return offset;
    }

    @Override
    @JsonIgnore
    public Sort getSort() {
        return sort;
    }

    @Override
    @JsonIgnore
    public Pageable next() {
        return new OffsetBasedPageRequest(offset + size, size, sort);
    }

    @Override
    @JsonIgnore
    public Pageable previousOrFirst() {
        return hasPrevious() ?
            new OffsetBasedPageRequest(Math.max(0, offset - size), size, sort) : this;
    }

    @Override
    @JsonIgnore
    public Pageable first() {
        return new OffsetBasedPageRequest(0, size, sort);
    }

    @Override
    @JsonIgnore
    public Pageable withPage(int pageNumber) {
        return new OffsetBasedPageRequest(pageNumber * size, size, sort);
    }

    @Override
    @JsonIgnore
    public boolean hasPrevious() {
        return offset > 0;
    }
}


/**
 * Copyright (c) 2025, HushChat (https://gethush.chat)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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

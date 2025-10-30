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

package com.platform.software.config.aws;

import lombok.Data;

@Data
public class SignedURLDTO {
    private String originalFileName;
    private String indexedFileName;
    private String url;
    private String filePath;

    public SignedURLDTO(String url, String originalFileName, String indexedFileName) {
        this.url = url;
        this.originalFileName = originalFileName;
        this.indexedFileName = indexedFileName;
    }

    @Override
    public String toString() {
        return "SignedURLDTO{" +
                "originalFileName='" + originalFileName + '\'' +
                ", indexedFileName='" + indexedFileName + '\'' +
                ", url='" + url + '\'' +
                ", filePath='" + filePath + '\'' +
                '}';
    }
}
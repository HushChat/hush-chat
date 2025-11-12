package com.platform.software.config.aws;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class DocUploadRequestDTO {
    @NotNull(message = "file names are mandatory")
    private List<String> fileNames;
    private Boolean isGroup;

    @Override
    public String toString() {
        return "DocUploadRequestDTO{" +
                ", fileNames=" + fileNames +
                ", isGroup=" + isGroup +
                '}';
    }
}

package com.platform.software.config.aws;

import java.util.List;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotNull;

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

package com.platform.software.config.aws;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class SignedURLResponseDTO {
    private List<SignedURLDTO> signedUrls;

    public List<SignedURLDTO> getSignedURLs() {
        if (signedUrls == null) {
            signedUrls = new ArrayList<>();
        }
        return signedUrls;
    }

    public void setSignedURLs(List<SignedURLDTO> signedUrls) {
        this.signedUrls = signedUrls;
    }

    @Override
    public String toString() {
        return "SignedURLResponseDTO{" +
                ", signedUrls=" + signedUrls +
                '}';
    }
}

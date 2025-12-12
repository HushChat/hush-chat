package com.platform.software.chat.message.tenor.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class TenorService {

    @Value("${tenor.api.key}")
    private String tenorApiKey;

    @Value("${tenor.api.base-url}")
    private String tenorBaseUrl;

    private final RestTemplate restTemplate;

    public TenorService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public Object searchGifs(String query, int limit) {
        String url = UriComponentsBuilder.fromHttpUrl(tenorBaseUrl + "/search")
                .queryParam("q", query)
                .queryParam("key", tenorApiKey)
                .queryParam("limit", limit)
                .queryParam("media_filter", "gif,tinygif")
                .toUriString();

        return restTemplate.getForObject(url, Object.class);
    }

    public Object getFeaturedGifs(int limit) {
        String url = UriComponentsBuilder.fromHttpUrl(tenorBaseUrl + "/featured")
                .queryParam("key", tenorApiKey)
                .queryParam("limit", limit)
                .queryParam("media_filter", "gif,tinygif")
                .toUriString();

        return restTemplate.getForObject(url, Object.class);
    }
}

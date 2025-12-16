package com.platform.software.chat.message.tenor.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.platform.software.exception.ServiceUnavailableException;

@Service
public class TenorService {

    private static final Logger logger = LoggerFactory.getLogger(TenorService.class);

    @Value("${tenor.api.key}")
    private String tenorApiKey;

    @Value("${tenor.api.base-url}")
    private String tenorBaseUrl;

    private final RestTemplate restTemplate;

    private static final String MEDIA_FILTER = "gif,tinygif";

    public TenorService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public Object searchGifs(String query, int limit, String pos) {
         try {
            UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(tenorBaseUrl + "/search")
                    .queryParam("q", query)
                    .queryParam("key", tenorApiKey)
                    .queryParam("limit", limit)
                    .queryParam("media_filter", MEDIA_FILTER);

            if (pos != null && !pos.isEmpty()) {
                builder.queryParam("pos", pos);
            }

            return restTemplate.getForObject(builder.toUriString(), Object.class);

        } catch (RestClientException e) {
            logger.error("error searching Tenor GIFs for query: {}", query, e);
            throw new ServiceUnavailableException("Failed to search GIFs from Tenor", e);
        }
    }

    public Object getFeaturedGifs(int limit, String pos) {
        try {
            UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(tenorBaseUrl + "/featured")
                    .queryParam("key", tenorApiKey)
                    .queryParam("limit", limit)
                    .queryParam("media_filter", MEDIA_FILTER);

            if (pos != null && !pos.isEmpty()) {
                builder.queryParam("pos", pos);
            }

            return restTemplate.getForObject(builder.toUriString(), Object.class);

        } catch (RestClientException e) {
            logger.error("error fetching featured Tenor GIFs", e);
            throw new ServiceUnavailableException("Failed to fetch featured GIFs from Tenor", e);
        }
    }
}

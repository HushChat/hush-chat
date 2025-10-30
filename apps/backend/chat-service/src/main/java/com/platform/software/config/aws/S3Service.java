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

import com.amazonaws.AmazonServiceException;
import com.amazonaws.HttpMethod;
import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.GeneratePresignedUrlRequest;
import com.platform.software.exception.CustomInternalServerErrorException;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.net.URL;
import java.time.Instant;

@Service
public class S3Service {
    Logger logger = LoggerFactory.getLogger(S3Service.class);

    @Value("${cloud.aws.credentials.accessKey}")
    private String accessKey;

    @Value("${cloud.aws.credentials.secretKey}")
    private String secretKey;

    @Value("${private.bucket.name}")
    private String privateBucketName;

    private AmazonS3 s3Client;


    public S3Service() {}

    public String getPrivateBucketSignedURL(String objectKey, HttpMethod httpMethod) {
        return getSignedURL(objectKey, httpMethod);
    }

    public String getSignedURL(String objectKey, HttpMethod httpMethod) {

        try {
            // Set the pre-signed URL to expire after 3 minutes
            java.util.Date expiration = new java.util.Date();
            long expTimeMillis = Instant.now().toEpochMilli();
            expTimeMillis += 1000 * 60 * 3;
            expiration.setTime(expTimeMillis);

            GeneratePresignedUrlRequest generatePresignedUrlRequest =
                new GeneratePresignedUrlRequest(privateBucketName, objectKey)
                    .withMethod(httpMethod)
                    .withExpiration(expiration);
            URL url = s3Client.generatePresignedUrl(generatePresignedUrlRequest);
            return url.toString();
        } catch (AmazonServiceException e) {
            logger.error(e.getErrorMessage());
            throw new CustomInternalServerErrorException("failed to get image!");
        }
    }

    // This method are called after Spring starts AmazonClientService into your container.
    @PostConstruct
    private void init() {
        AWSCredentials credentials = new BasicAWSCredentials(
            accessKey,
            secretKey
        );
        s3Client = AmazonS3ClientBuilder
            .standard()
            .withCredentials(new AWSStaticCredentialsProvider(credentials))
            .withRegion(Regions.AP_SOUTH_1)
            .build();
    }

    public String getPrivateBucketViewSignedURL(String objectKey) {
        return getPrivateBucketSignedURL(objectKey, HttpMethod.GET);
    }
}

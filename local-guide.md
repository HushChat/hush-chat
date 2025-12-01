# HushChat — Local Setup Guide

> Comprehensive step-by-step guide to configure and run HushChat locally (backend + frontend) for new contributors.

---

## Table of contents

1. Overview
2. Prerequisites
3. Repo — clone & branches
4. Environment files (`.env`) — structure & explanation
5. Backend (Spring Boot) setup
   * PostgreSQL
   * Redis
6. Docker Compose for local services (example)
7. Seeding & `SEEDERSERVICE_SEED` flags
8. Frontend (React Native / Expo) setup
9. Running the full stack (step-by-step)

---

## 1. Overview

This guide walks you through running HushChat locally for development: how to set up the backend (Spring Boot), required local services (Postgres, Redis), necessary environment variables, Docker Compose examples, seeding the database, and starting the frontend (React Native using Expo). Use this guide to onboard new contributors and to reproduce a consistent local environment.

## 2. Prerequisites

* Git
* Java 17+ (or version required by the project — check `pom.xml`)
* Maven
* Node.js (LTS) + yarn
* Expo CLI if using React Native + Expo
* Docker & Docker Compose 

Check `README.md` in the repo for any additional project-specific requirements.

## 3. Repo — clone & branches

```bash
git clone https://github.com/HushChat/hush-chat.git
cd hush-chat
# checkout main or the recommended development branch
git checkout main
```

Look for subprojects (e.g., `backend/`, `frontend/` or similarly named directories) and read their local READMEs as needed.

## 4. Environment files (`.env`) — structure & explanation

Place .env files in the backend root (or where Spring Boot reads them). Keep a `.env.example` in Git (without secrets). Below is an annotated `.env` (see Appendix for a copy-ready sample):

* `SPRING_DATASOURCE_URL`: JDBC URL for Postgres. Use `sslmode=disable` for local dev.
* `SPRING_DATASOURCE_USERNAME`/`_PASSWORD`: DB credentials.
* `SEEDERSERVICE_SEED` and `SEEDERSERVICE_SEED_GENERATED`: toggle DB seeding.
* AWS/S3 keys: required when app interacts with S3.
* Redis host/port: for session/caching.
* Swagger JSON URL: if frontend or other services need to fetch API docs.
* Health check secrets: used by health endpoints.
* Test users: used in test environment.


## 5. Backend (Spring Boot) setup

First Need to set a env file for a backend on the following path: /hush-chat/apps/backend/chat-service

### 5.1. Build

Maven:

```bash
mvn clean package -DskipTests
```

### 5.2. Database (PostgreSQL)

You can run Postgres via docker-compose (recommended for consistency).it has explained in the method 6. 

### 5.3. Redis

Start a Redis instance through docker-compose.it has explained in the method 6. 

### 5.4. AWS S3 (local development)

For local development you can use MinIO (S3-compatible) or localstack. Configure the `CLOUD_AWS_*` keys in `.env` and set the `PRIVATE_BUCKET_NAME`.

### 5.5. AWS Cognito

If the backend validates JWTs from Cognito, set `AWS_COGNITO_REGION`, `AWS_COGNITO_USERPOOL_ID`, `AWS_COGNITO_JWKS_URL`, and `AWS_COGNITO_CLIENT_ID`. For local development you can:

* use test tokens from Cognito
* mock authentication (if the project provides a mock profile)

### 5.6. ELK Logging

ELK (Elastic + Logstash + Kibana) is optional for local development. If you must forward logs to an ELK host, set `LOG_ELK_HOST` and `LOG_ELK_PORT` in `.env`.

### 5.7. Swagger

Set `SWAGGER_BACKEND_MAIN_JSON_URL` to the backend swagger JSON if needed by frontend tools.

### 5.8. Health checks

The app exposes health endpoints protected by secrets. Configure `HEALTH_CHECK_REDIS_SECRET_KEY` and `HEALTH_CHECK_COMMIT_INFO_SECRET_KEY`.

## 6. Docker Compose for local services (example)

Need to up the `docker-compose.yml` in the /hush-chat/infra/db-docker by using the command :
```
docker-compose up -d
```
 it will runs Postgres, Redis.

Can verfify whether the postgres and redis is running:
```
docker ps -a 
```


## 7. Seeding & `SEEDERSERVICE_SEED` flags

The project uses seeder flags to populate initial data. Environment variables:

* `SEEDERSERVICE_SEED`: `true` to enable seeding on startup.
* `SEEDERSERVICE_SEED_GENERATED`: `false`

## Start the backend after these process: `Run and debug the chatservice`


## 8. Frontend (React Native / Expo) setup

First Need to set a env file for a frontend on the following path: /hush-chat/apps/frontend/hushchat-mobile

### 8.1. Install dependencies 

Create `.env` in the frontend root with keys the app expects (Mainly need to set the firebase and more.). Example:

```
EXPO_PUBLIC_API_HOST='192.xx.xx.xx'
EXPO_PUBLIC_FIREBASE_PROJECT_ID='xxx-xxxx-xxx'
```

```bash
cd apps/frontend/hushchat-mobile

yarn global add expo
yarn install
yarn start

```


Below is the `.env` you provided, included here (remove any placeholder values and replace with real values for your environment):

```
SPRING_DATASOURCE_URL=jdbc:postgresql://<localhost>:<5432>/<DB_NAME>?sslmode=disable
SPRING_DATASOURCE_USERNAME=<DB_USERNAME>
SPRING_DATASOURCE_PASSWORD=<DB_PASSWORD>
SPRING_DATASOURCE_DEFAULT_SCHEMA=<DEFAULT_SCHEMA>
SPRING_DATASOURCE_GLOBAL_SCHEMA=<GLOBAL_SCHEMA>

# ===========================
# SEEDER CONFIG
# ===========================
# Required for: PROD
SEEDERSERVICE_SEED=<true_or_false>
SEEDERSERVICE_SEED_GENERATED=<true_or_false>

# ===========================
# AWS / S3
# ===========================
# Required for: LOCAL | PROD | TEST
CLOUD_AWS_ACCESS_KEY=<AWS_ACCESS_KEY>
CLOUD_AWS_SECRET_KEY=<AWS_SECRET_KEY>
PRIVATE_BUCKET_NAME=<PRIVATE_BUCKET_NAME>

# ===========================
# ELK LOGGING
# ===========================
# Required for: PROD
LOG_ELK_HOST=<ELK_HOST>
LOG_ELK_PORT=<ELK_PORT>

# ===========================
# REDIS
# ===========================
# Required for: PROD
SPRING_DATA_REDIS_HOST=<REDIS_HOST>
SPRING_DATA_REDIS_PORT=<REDIS_PORT>

# ===========================
# SWAGGER
# ===========================
SWAGGER_BACKEND_MAIN_JSON_URL=<SWAGGER_JSON_URL>

# ===========================
# HEALTH CHECK SECRETS
# ===========================
# Required for: LOCAL | PROD | TEST
HEALTH_CHECK_REDIS_SECRET_KEY=<HEALTH_CHECK_REDIS_SECRET_KEY>
HEALTH_CHECK_COMMIT_INFO_SECRET_KEY=<HEALTH_CHECK_COMMIT_INFO_SECRET_KEY>

# ===========================
# AWS COGNITO
# ===========================
# Required for: LOCAL | PROD | TEST
AWS_COGNITO_REGION=<AWS_COGNITO_REGION>
AWS_COGNITO_USERPOOL_ID=<AWS_COGNITO_USERPOOL_ID>
AWS_COGNITO_JWKS_URL=<AWS_COGNITO_JWKS_URL>
AWS_COGNITO_CLIENT_ID=<AWS_COGNITO_CLIENT_ID>

# ===========================
# TEST USERS
# ===========================
# Required for: TEST
TEST_CHAT_ADMIN_EMAIL=<TEST_CHAT_ADMIN_EMAIL>
TEST_CHAT_ADMIN_PASSWORD=<TEST_CHAT_ADMIN_PASSWORD>
TEST_CHAT_PARTICIPANT_EMAIL=<TEST_CHAT_PARTICIPANT_EMAIL>
TEST_CHAT_PARTICIPANT_PASSWORD=<TEST_CHAT_PARTICIPANT_PASSWORD>

# ===========================
# FIREBASE
# ===========================
# Required for: LOCAL | PROD
FIREBASE_SERVICE_ACCOUNT_PATH=<FIREBASE_SERVICE_ACCOUNT_PATH>
```

---


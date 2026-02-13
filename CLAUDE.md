# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HushChat is an open-source, self-hostable chat platform with a Java Spring Boot backend and a React Native (Expo) mobile/web frontend. The repo is structured as a monorepo using Yarn workspaces.

## Repository Layout

```
apps/
  backend/chat-service/     # Java 21, Spring Boot 3.1, Maven
  frontend/hushchat-mobile/ # React Native (Expo 54), TypeScript
infra/
  db-docker/                # Local PostgreSQL + Redis via Docker Compose
  db-migrations/            # Liquibase migration changelogs (platform + per-workspace)
scripts/                    # k6 load testing
```

## Build & Development Commands

### Root-level (from repo root)

| Task | Command |
|------|---------|
| Install frontend deps | `yarn install` |
| Start full stack | `yarn run:stack` |
| Start backend only | `yarn start:backend` |
| Start frontend (Expo) | `yarn start:hush-chat` |
| Build backend | `yarn build:backend` |
| Build backend (prod) | `yarn build:backend:prod` |
| Run backend tests | `yarn test:backend` |
| Lint (ESLint, whole repo) | `yarn lint` |
| Lint + fix | `yarn lint:fix` |
| Prettier check | `yarn prettier:check` |
| Format all | `yarn format` |
| Build web | `yarn build:web` |
| Build Android | `yarn build:android` |

### Backend (Maven)

All Maven commands target `apps/backend/chat-service/pom.xml`. You can also run Maven directly:

```bash
# Run a single test class
mvn -f apps/backend/chat-service/pom.xml test -Dtest=ClassName

# Run a single test method
mvn -f apps/backend/chat-service/pom.xml test -Dtest=ClassName#methodName
```

Backend runs on port **3092**. Spring profiles: `local` (default), `prod`. The local profile uses `application-local.properties` which expects PostgreSQL on localhost:5432 and Redis on localhost:6379.

Tests use **Testcontainers** (PostgreSQL + Redis containers) and H2 in-memory DB. Test base classes are in `src/test/` root: `UnitTest.java`, `BaseAccessTest.java`, `TestcontainerTest.java`.

### Frontend (Expo)

Run from `apps/frontend/hushchat-mobile/` or use root yarn scripts:

```bash
yarn start:hush-chat     # Expo dev server
yarn android:hush-chat   # Run on Android
yarn web:hush-chat        # Run on web
yarn lint:hush-chat       # Lint frontend only
```

## Architecture

### Backend (Spring Boot)

Base package: `com.platform.software`

- **Multi-tenant workspace isolation**: Uses dynamic schema resolution per workspace. Key classes in `config/workspace/` — `WorkspaceContext` holds tenant context, `WorkspaceSchemaResolver` and `WorkspaceConnectionProvider` switch DB schemas at runtime. There is also a `platform` (global) schema.
- **Domain modules** under `chat/`: `conversation`, `conversationparticipant`, `message`, `user`, `call`, `notification`, `email`, `search`, `settings`. Each follows `entity/dto/repository/service/controller` layering.
- **Platform modules** under `platform/`: `workspace`, `workspaceuser` — manage workspace creation and user-workspace relationships.
- **Auth**: AWS Cognito JWT-based authentication. Security config in `config/security/`.
- **Real-time**: WebSocket (STOMP) for messaging. Config in `config/` package.
- **Data access**: JPA + QueryDSL for type-safe queries. QueryDSL Q-classes are generated at compile time via annotation processing.
- **Database migrations**: Liquibase changelogs in `infra/db-migrations/` (disabled by default locally; `spring.liquibase.enabled=false`).
- **External integrations**: AWS S3 (file storage via CloudFront), SendGrid/AWS SES (email), Firebase (push notifications), Tenor (GIFs), Elasticsearch (search), Prometheus/Micrometer (metrics).
- Uses **Lombok** for boilerplate reduction and **JaCoCo** for test coverage.

### Frontend (React Native / Expo)

- **Routing**: Expo Router (file-based) — `app/` directory. Auth screens under `(auth)/`, main tabs under `(tabs)/` with conversations, call history, profile, settings.
- **State management**: Zustand stores in `store/` (auth, conversation, user).
- **Server state**: TanStack React Query — hooks in `query/` directory. Mutations in `query/post/`, `query/patch/`, `query/delete/`.
- **API layer**: Axios-based API services in `apis/` (conversation, message, photo-upload, user).
- **WebSocket**: STOMP client via `@stomp/stompjs`. WebSocket context in `contexts/WebSocketContext.tsx`, event hooks in `hooks/ws/`.
- **Styling**: NativeWind (TailwindCSS for React Native) + `global.css`. Custom theme via `useAppTheme`/`useColorScheme` hooks.
- **Contexts**: `WebSocketContext` (connection management), `ConversationNotificationsContext` (notification state), `ModalProvider` (modal management).

## Lint Rules & Conventions

- **Pre-commit hook** (Husky): runs `lint-staged` which applies ESLint + Prettier to staged `.js/.jsx/.ts/.tsx` files.
- **Custom ESLint rules enforced**:
  - Use `<AppText>` instead of `<Text>` from React Native.
  - Use `<AppTextInput>` instead of `<TextInput>` from React Native.
  - `react-native/no-unused-styles`: error
  - `react-native/no-inline-styles`: warn
  - `react-native/no-color-literals`: warn
  - `max-lines`: warn at 300 lines per file
  - `no-console`: warn
- Commit messages follow **Conventional Commits**: `<type>(scope): short description` (e.g., `feat(auth): add Google login`).
- Branch naming: `feature/<desc>`, `fix/<desc>`, `docs/<desc>`, `refactor/<desc>`.

## Environment Configuration

Copy `.env.example` to `.env`. Key groups: Database, AWS/S3, Redis, AWS Cognito, Firebase, SendGrid/SES, Tenor API. The `.env.example` file documents which vars are needed for LOCAL vs PROD vs TEST profiles.

## Docker

- `docker-compose.yml` — production (backend + frontend containers on `infra_network`)
- `docker-compose.staging.yml` — staging variant
- `infra/db-docker/docker-compose.yml` — local PostgreSQL + Redis
- Backend runs on port 3092, frontend on port 8081 (Nginx)


## Critical Rules

- Never bypass workspace schema resolution.
- Never access the database without WorkspaceContext set.
- Never write raw SQL unless necessary.
- Always use DTOs in controllers (never return entities directly).
- Always prefer QueryDSL over custom JPQL.
- Never introduce inline styles in React Native.
- Use existing components before creating new ones.

## Performance Considerations

- Avoid N+1 queries (always consider fetch joins).
- Index high-frequency columns.
- Avoid loading full message history without pagination.
- Be mindful of WebSocket broadcast scope.

## Security

- All endpoints must require authentication unless explicitly public.
- Never trust client-provided workspace IDs.
- Always derive workspace from token context.
- Validate file uploads and enforce size limits.

---
name: run-stack
description: Start the full HushChat development stack (backend + frontend)
disable-model-invocation: true
---

Start the full HushChat development stack.

## Steps

1. **Stop any existing stack processes** first by killing processes matching `yarn run:stack`, `spring-boot:run`, `expo start`, and `mvn.*chat-service`:
```
pkill -f "yarn run:stack" 2>/dev/null; pkill -f "spring-boot:run" 2>/dev/null; pkill -f "expo start" 2>/dev/null; pkill -f "mvn.*chat-service" 2>/dev/null
```

2. **Ensure PostgreSQL and Redis are running**. Check with `docker ps`. If they are not running, start them with:
```
docker compose -f infra/db-docker/docker-compose.yml up -d
```

3. **Start the stack** by running `yarn run:stack` from the repo root (in background). This starts both services concurrently:
   - **Backend**: Spring Boot on http://localhost:3092 (`mvn spring-boot:run`)
   - **Frontend**: Expo dev server (`yarn start:hush-chat`)

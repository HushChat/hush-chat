---
name: stop-stack
description: Stop the full HushChat development stack (backend + frontend)
disable-model-invocation: true
---

Stop the full HushChat development stack.

## Steps

1. **Kill all stack processes** by stopping processes matching `yarn run:stack`, `spring-boot:run`, `expo start`, and `mvn.*chat-service`:
```
pkill -f "yarn run:stack" 2>/dev/null; pkill -f "spring-boot:run" 2>/dev/null; pkill -f "expo start" 2>/dev/null; pkill -f "mvn.*chat-service" 2>/dev/null
```
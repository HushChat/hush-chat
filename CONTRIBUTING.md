# Contributing to HushChat

First off — thank you for taking the time to contribute to **HushChat**!  
Your help makes this project better for everyone. Whether it’s fixing a bug, improving documentation, or building a new feature — we’d love to have you on board.

---

## Project Overview

**HushChat** is a modern, workspace-based chat platform built with:

- **Frontend:** React Native + Expo
- **Backend:** Java Spring Boot
- **Database:** PostgreSQL + Redis
- **Auth:** AWS Cognito

We aim to provide teams a **lightweight, self-hostable communication platform** that’s simple to deploy and easy to extend.

---

## How to Contribute

### 1. Fork & Clone

```bash
# Fork the repo first, then clone your fork
git clone https://github.com/<your-username>/hush-chat.git
cd hush-chat
```

### 2. Create a Branch

Follow the naming convention below:

| Type     | Format                         | Example                          |
| -------- | ------------------------------ | -------------------------------- |
| Feature  | `feature/<short-description>`  | `feature/add-message-reactions`  |
| Bug Fix  | `fix/<short-description>`      | `fix/websocket-connection-error` |
| Docs     | `docs/<short-description>`     | `docs/update-readme`             |
| Refactor | `refactor/<short-description>` | `refactor/cleanup-chat-service`  |

```bash
git checkout -b feature/add-message-reactions
```

---

### 4. Code Guidelines

- Follow existing code style
- Keep commits small and meaningful
- Add comments where logic is non-trivial
- Update or add **tests** when fixing bugs or adding features
- For UI changes, include **before/after screenshots** in the PR

---

### 5. Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) style:

```
<type>(scope): short description
```

**Examples:**

- `feat(auth): add Google login support`
- `fix(socket): reconnect on token refresh`
- `docs: update contributing guide`

---

### 6. Submit a Pull Request

1. Push your branch to your fork:
   ```bash
   git push origin feature/add-message-reactions
   ```
2. Open a Pull Request to the `main` branch of [HushChat/hush-chat](https://github.com/HushChat/hush-chat)
3. Fill out the PR template:
   - What you changed
   - Why you changed it
   - Screenshots (if applicable)
   - Linked issue (if any)

> All PRs require at least **one review** before merging.

---

## Code of Conduct

Please review our [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).  
Be kind, inclusive, and respectful — we’re all here to build something great together.

---

### Thanks for being part of HushChat!

Your contributions make this project thrive.  
Together, let’s build the modern way for teams to stay connected.

---
paths:
  - 'apps/frontend/src/lib/features/assistant/**'
  - 'apps/frontend/src/routes/**/chat/**'
  - 'apps/api/src/features/chat/**'
---

<!-- Loads when Claude touches the chat or its tools. Rule text, not @imports: an @import here loads at session start whatever `paths` says (Claude Code 2.1.325). -->

You are working on the chat. Before changing code here, read `docs/explanation/chat.md`: which tools run in the app and which on the server, and how chats and photos are saved.

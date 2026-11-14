---
paths:
  - 'apps/frontend/src/lib/services/account/**'
  - 'apps/frontend/src/lib/components/account/**'
  - 'apps/frontend/src/routes/login/**'
  - 'apps/frontend/src/routes/*/+layout.*'
  - 'apps/frontend/src/routes/*/*/+layout.ts'
  - 'apps/frontend/src/hooks.client.ts'
---

<!-- Loads when Claude touches account, login, logout or the tab lock. Rule text, not @imports: an @import here loads at session start whatever `paths` says (Claude Code 2.1.325). -->

You are working on accounts, login, logout or the tab lock. Before changing code here, read `docs/explanation/accounts.md`: why the account root lives outside the router, and the order in which the account is decided.

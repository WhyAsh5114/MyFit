# Chat

The chat logs and edits food in conversation. It follows one rule: **a tool runs where its data is.**

## Tools over user data run in the app

The user's diary lives on the device (see [Local-first data](local-first.md)), so the server declares these tools without an `execute`, and the app answers them: `chat/components/chat.svelte.ts` routes each call, and the handlers that read the diary are in `lib/features/chat/tools/`:

- `readFoodEntries` reads the local diary from `onToolCall`. The server sees only the result.
- `createFoodEntry` waits for the user to confirm its card and pick the meal. The entry is logged at `eatenAt` (the model's local time) or now.
- `deleteFoodEntries` shows the entries it names, read from the device, for one confirm.
- `updateFoodEntries` shows each entry with its old and new values, for one confirm.

## Tools over public data run on the server

`searchFoods` (the Open Food Facts table) and `webSearch` (Exa, only while `EXA_API_KEY` is set) run on the server. One request can take several steps (`stopWhen`).

The app sends the user's local date and time and their meal names with each request, because the server's clock can be on another day.

## Chats are saved locally and synced

`Chat` and `ChatMessage` are ordinary synced models. A message is stored as the AI SDK message, with `parts` as JSON. A `ChatSession` saves after a send, after each tool answer, and when a response finishes. It writes only the messages that changed.

A new chat is named by a separate call, `POST /api/chat/title`, which the app makes beside the first message and saves when it returns. If the call fails, the chat keeps the default title.

## Photos are stored outside the message

The app uploads a photo to `POST /api/chat/images` (S3-compatible storage; SeaweedFS in `docker-compose.yml`), and the message part keeps `chat-image:<id>`. The API turns that into image data for the model and serves the image back to the app.

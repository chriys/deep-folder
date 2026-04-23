# PRD: Deep Folder v0.1 Frontend

## Problem Statement

I have a Google Drive folder full of documents. When I need to find information across those documents, I have to open files one by one and read them manually. There is no way to ask a question and get an answer that cites exactly where in the folder the information came from. I need a web app that lets me paste a Drive folder URL, wait for it to be indexed, and then have a real conversation with its contents — where every answer tells me precisely which file, page, or heading it came from.

## Solution

Deep Folder v0.1 is a web app with three capabilities:

1. **Connect** a Google account via OAuth and paste a Drive folder URL to kick off background indexing
2. **Monitor** indexing progress without blocking, then browse what was indexed and what was skipped
3. **Converse** with the indexed folder — ask questions, receive streamed answers, and click any citation to open the exact location in Google Drive

Citations are first-class UI elements, not footnotes. The trust story of the product depends on making sources feel immediate and specific.

---

## User Stories

### Auth

1. As a tester, I want a "Connect Google" button on the landing screen so that I can authenticate with my Google account in one click.
2. As a tester, I want to be redirected back to the app after OAuth completes so that I don't have to navigate manually.
3. As a tester, I want a visible connected/disconnected indicator so that I always know whether my Google account is linked.
4. As a tester, I want a legible error message if my Google account is not on the allowlist so that I understand why I can't access the app.
5. As a tester, I want a disconnect option that is reachable but not prominent so that I can log out without accidentally triggering it.
6. As a tester, I want my session to persist across page refreshes so that I don't have to re-authenticate every visit.

### Folder Ingestion

7. As a tester, I want a single text input where I can paste any Google Drive folder URL so that I don't have to learn a specific URL format.
8. As a tester, I want the app to reject Shared Drive URLs with a clear message so that I understand why my link didn't work.
9. As a tester, I want a confirmation prompt when a folder has more than 500 files so that I can decide whether to proceed before a long ingest starts.
10. As a tester, I want the ingest to run in the background so that I can keep using the app while my folder is indexed.
11. As a tester, I want to see a progress indicator while ingest is running so that I know it hasn't stalled.
12. As a tester, I want the progress indicator to reflect the ingest state (queued, indexing, done, failed) so that I have accurate information.
13. As a tester, I want a clear failure state with a retry option if ingest fails so that I don't have to guess what went wrong.
14. As a tester, I want to see which files were skipped after a successful ingest so that I know what the folder chat cannot answer questions about.
15. As a tester, I want skipped files to be shown in a collapsible section so that they don't dominate the UI when skipping is expected.
16. As a tester, I want to delete a folder with a confirmation step so that I can't accidentally remove an ingested folder.

### Folder List & Detail

17. As a tester, I want to see all my ingested folders in a sidebar so that I can switch between them.
18. As a tester, I want the sidebar to show the ingest state of each folder so that I know which ones are ready to chat with.
19. As a tester, I want to click a folder in the sidebar to open its detail view so that I can inspect what was indexed.
20. As a tester, I want the detail view to list all indexed files so that I can verify my folder was fully ingested.
21. As a tester, I want the detail view to separately list skipped files so that I understand the coverage of answers.
22. As a tester, I want to collapse the sidebar with a keyboard shortcut (cmd+B) so that I can focus on the chat pane.
23. As a tester, I want the sidebar collapse state to persist across sessions so that I don't have to re-collapse every time.

### Conversation

24. As a tester, I want to start a new conversation with a folder so that I can ask questions about its contents.
25. As a tester, I want to see a list of my previous conversations with a folder so that I can resume past sessions.
26. As a tester, I want the conversation list to re-scope automatically when I switch folders so that I only see relevant conversations.
27. As a tester, I want to open a conversation by a direct URL so that I can share it with another tester for debugging.
28. As a tester, I want the conversation view to show an "Ask anything about [folder name]" prompt when empty so that I know the chat is ready.
29. As a tester, I want messages to appear immediately after I send them so that the interface feels responsive.

### Streaming Messages

30. As a tester, I want to see the assistant's answer appear token by token as it streams so that I don't wait for the full response before reading.
31. As a tester, I want citations to appear as they arrive during streaming, not only at the end so that I can start evaluating sources before the answer finishes.
32. As a tester, I want a "Connection lost" notice inline in the chat if the stream drops so that I know the answer is incomplete.
33. As a tester, I want a Retry button on a failed stream so that I can recover without reloading the page.
34. As a tester, I want a retried message to replace the partial message in-place so that the thread stays clean.
35. As a tester, I want backend error events to appear as inline error cards in the thread so that errors are visible in context and can be screenshotted.

### Citations

36. As a tester, I want each citation to appear as a numbered superscript chip inline in the answer text so that I can see exactly which claim it supports.
37. As a tester, I want to click a citation chip to open the citation panel so that I can inspect the source without leaving the chat.
38. As a tester, I want the citation panel to show the file name, a quote excerpt, and the page or heading so that I have enough context to evaluate the source.
39. As a tester, I want clicking the citation's Drive link to open Google Drive at the exact page or heading in a new tab so that I can read the full source.
40. As a tester, I want the citation panel to stay open after I open it so that I can review multiple citations without re-clicking.
41. As a tester, I want the citation panel to close when I start a new message so that it doesn't clutter the view during a new turn.
42. As a tester, I want the citation panel to slide in with an animation so that the transition feels polished.

### Empty, Loading & Error States

43. As a tester, I want skeleton screens on every view while data loads so that the layout doesn't jump.
44. As a tester, I want an empty state on the folders screen with an ingest input so that I know what to do on first use.
45. As a tester, I want the ingest input to be replaced by a progress card when ingest is running and it is my only folder so that the UI stays focused.
46. As a tester, I want a retry option on every error state so that I can recover without a full page reload.
47. As a tester, I want an empty state in the conversation list showing "No conversations yet" so that the sidebar doesn't look broken.

---

## Implementation Decisions

### Routes

```
/                     → auth check → redirect
/auth/callback        → OAuth return handler → redirect to /folders
/folders              → authenticated shell, folder list / zero-folder empty state
/folders/:id          → folder detail (indexed files + skipped files)
/chat/:convId         → conversation view (shell loads folder context from convo's folder_id)
```

### Shell Layout

- Two-panel layout: left sidebar (260px) + main content area
- Sidebar contains: folder switcher at top, conversation list scoped to active folder below
- Sidebar is collapsible via `cmd+B`; width animates via Framer Motion; state persisted to `localStorage`
- Shell mounts once for all authenticated routes; navigation between folders/conversations is client-side

### State Management (Zustand slices)

- **auth slice**: session status, disconnect action
- **folder slice**: folder list, active folder, ingest polling lifecycle
- **chat slice**: active conversation, message list, optimistic message, stream state, citation list
- **ui slice**: sidebar open/closed, citation panel open/closed, active citation index

Message shape is designed for v0.2 extensibility: `{ id, role, content, citations[], tool_calls[] }` — `tool_calls` is empty array in v0.1 but present in the type.

### Ingest Polling

- Poll `GET /folders/:id` every 2 seconds while `ingest_state` is `pending` or `running`
- Stop polling on `done` or `failed`
- API is assumed to return state enum only (no file count or percentage)
- Progress renders as indeterminate spinner + state label ("Queued…" / "Indexing…")

### SSE Stream Handling

- Raw `EventSource` (no library) — typed event dispatcher pattern: each event type (`text_delta`, `citation`, `done`, `error`) maps to a dedicated handler. New event types in v0.2 slot in without modifying existing handlers.
- Optimistic message insert on send (pending state), replaced in-place on stream completion or retry
- Implicit `done` if stream closes with no `done` event after 3 seconds of silence
- No auto-reconnect in v0.1 — manual Retry only (tech debt, non-negotiable in v0.2 for Tool Loop)

### Citation Panel

- Citation state is scoped to `messageId`, not global — required for v0.2 multi-turn tool call citations
- Panel is dormant until first chip click; slides in from right via Framer Motion
- Panel collapses when user sends a new message
- All Drive links open in a new tab — no inline preview in v0.1

### Ingest Edge Cases

- Shared Drive URLs: reject with inline error on the input, clear message
- >500 files: generic confirmation modal ("This folder has more than 500 files. Indexing may take a while. Continue?") — no preflight count fetch
- Failed ingest: red badge on sidebar folder card; error banner + "Try again" CTA in detail view; ingest input reappears on the folders screen if it was the only folder

### Stack

- **Framework**: Next.js App Router
- **State**: Zustand
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion (all transitions)
- **Data fetching**: raw `fetch` + `EventSource` — no React Query (fights SSE)

---

## Testing Decisions

A good test verifies observable behaviour from the outside — what the user sees or what leaves the system — not internal implementation details like Zustand slice shape or component hierarchy.

### Modules to test

- **SSE event dispatcher**: unit-testable in isolation. Given a sequence of raw SSE events, assert the correct message/citation state is produced. This is the most critical logic in the app.
- **Ingest polling controller**: unit-testable. Given a sequence of `ingest_state` values returned by a mock fetch, assert polling starts, stops, and surfaces the correct UI state at each phase.
- **Auth gate**: integration test. Assert that unauthenticated routes redirect to `/`, authenticated routes render, and allowlist rejection renders an error (not a blank screen).
- **Citation panel**: component test. Assert panel is hidden initially, appears on chip click, scrolls to the correct citation, and collapses on new message send.

### Modules not tested in v0.1

- Framer Motion animations (visual, not logic)
- Sidebar collapse persistence (trivial localStorage read/write)
- Skeleton screens (presentational only)

---

## Out of Scope

- Task mode UI
- Tool Loop / `tool_call_*` SSE event rendering
- Slides, Sheets, Office file rendering
- Contradiction / theme views
- Usage dashboard
- Sync status UI (sync does not exist in v0.1 — re-ingest is manual)
- Multi-folder chat
- Inline Drive file preview (citations open Drive in a new tab only)
- Auto-reconnect on SSE drop (manual Retry only)
- Exact file count in >500-file confirmation prompt

---

## Further Notes

**v0.2 compatibility commitments baked into v0.1:**
- Message type includes `tool_calls: []` to avoid a breaking schema change
- Citation state is scoped to `messageId`, not a global singleton
- SSE event dispatcher is a typed map, not a monolithic switch — new event types extend without modification
- SSE reconnect absence is explicitly marked as tech debt in the chat slice

**Ubiquitous language:** see `UBIQUITOUS_LANGUAGE.md` for canonical term choices. Key: use **Ingest** not sync, **Skipped File** not failed file, **Conversation** not chat/thread/session, **Session** reserved for auth identity only.

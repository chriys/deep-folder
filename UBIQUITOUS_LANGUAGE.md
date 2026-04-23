# Ubiquitous Language

## Core domain

| Term | Definition | Aliases to avoid |
|------|-----------|-----------------|
| **Folder** | A Google Drive folder that has been or is being ingested into Deep Folder | Drive folder, directory, collection |
| **Ingest** | The background process of crawling a **Folder** and indexing its files for retrieval | Sync, import, index, crawl |
| **Ingest Job** | The server-side background task that executes an **Ingest** | Job, task, worker |
| **Ingest State** | The lifecycle phase of an **Ingest Job**: `pending`, `running`, `done`, or `failed` | Status, progress, state |
| **Skipped File** | A file inside a **Folder** that the **Ingest Job** deliberately excluded (unsupported type) | Ignored file, failed file, rejected file |
| **Conversation** | A persistent chat session bound to exactly one **Folder** | Chat, thread, session |
| **Message** | A single user query or assistant reply within a **Conversation** | Turn, exchange, prompt, response |
| **Stream** | The SSE connection that delivers an assistant **Message** token-by-token | Response stream, SSE, socket |
| **Citation** | A reference attached to an assistant **Message** that identifies the source file, location, and quote | Source, reference, footnote, link |
| **Primary Unit** | The location within a cited file: a PDF page number or a Docs heading | Location, anchor, position |
| **Deep Link** | A URL that opens Google Drive at the exact **Primary Unit** of a **Citation** | Drive link, source link |

## Auth & access

| Term | Definition | Aliases to avoid |
|------|-----------|-----------------|
| **Session** | The authenticated identity of a user, maintained via server-side cookie | Token, login, auth state |
| **Allowlist** | The server-side list of Google accounts permitted to use Deep Folder | Whitelist, approved users |
| **Allowlist Rejection** | The error state when a Google account completes OAuth but is not on the **Allowlist** | Auth error, forbidden error |

## SSE event types

| Term | Definition | Aliases to avoid |
|------|-----------|-----------------|
| **text_delta** | An SSE event carrying a token fragment to append to the current **Message** | chunk, token, delta |
| **citation** (event) | An SSE event carrying a **Citation** to attach to the current **Message** | source event, reference event |
| **done** (event) | An SSE event signalling the **Stream** has completed successfully | end, finish, complete |
| **error** (event) | An SSE event signalling the **Stream** failed with a reason | failure event |

## Relationships

- A **Folder** has exactly one **Ingest State** at any time
- A **Folder** produces zero or more **Skipped Files** after **Ingest**
- A **Conversation** belongs to exactly one **Folder**
- A **Message** belongs to exactly one **Conversation**
- A **Message** carries zero or more **Citations**
- A **Citation** has exactly one **Primary Unit** and exactly one **Deep Link**
- A **Stream** delivers one **Message** via a sequence of **text_delta**, **citation**, **done**, and/or **error** events

## Flagged ambiguities

- **"sync"** was used loosely in scope notes ("no sync UI in v0.1"). Avoid using "sync" — it implies bidirectional or scheduled update. The correct term is **re-ingest** (manual, user-triggered) for v0.1. A sync feature may exist in v0.2 but is not defined yet.
- **"session"** could mean auth session (cookie) or a Conversation. Always qualify: **Session** = auth identity, **Conversation** = chat context.
- **"failed"** applies to both **Ingest State** (`failed` whole job) and individual **Skipped Files** (excluded by design). These are distinct: a **failed** ingest is an error; a **Skipped File** is expected behaviour.
- **"progress"** was used informally during ingest discussion. Avoid it as a noun — prefer **Ingest State** (for the enum) or "indexing indicator" (for the UI element).

## Example dialogue

> **Dev:** "When a **Conversation** is open and the user re-ingests the **Folder**, does the **Conversation** break?"

> **Domain expert:** "Re-ingest in v0.1 is manual — there's no sync. The **Conversation** stays open. If the **Ingest State** transitions to `running`, we surface a warning banner but don't close the **Conversation**."

> **Dev:** "And if a **Citation** references a file that was a **Skipped File** in the new ingest?"

> **Domain expert:** "The **Deep Link** still points to Drive — the file exists in Drive regardless of **Ingest State**. The link doesn't break; the file just won't appear in future answers."

> **Dev:** "So **Skipped Files** and **Citation** validity are independent?"

> **Domain expert:** "Exactly. **Citations** come from what was indexed at the time the **Message** was generated. **Skipped Files** only affect future **Messages**, not past **Citations**."

 # TODO

- [x] ~~*Set up Sandcastle*~~
- [x] Pick project: Talk to a folder MVP

## Starting prompt - backend
Through this interface, a user should be able to authenticate a GSuite account, which should be used to give google drive access.

Then, a user should be able to copy and paste any link from Google Drive into the interface, which should kick off an agent conversation. This agent should be able to answer any questions about any of the files in the folder. Optimally, citations should be included.


## Starting prompt - frontend
I'm designing the frontend for Deep Folder v0.1 — a single-user web app that lets me talk to a Google Drive folder.
Use Framer Motion for all transitions. Use your skills to make it feel premium.
The backend is spec'd in PRD_BACKEND.md, don't read it unless necessary.

  v0.1 surface area the frontend must cover (and nothing beyond):

  1. Auth — "Connect Google" button → OAuth redirect → session cookie. GET /auth/status drives a connected/disconnected indicator. POST /auth/disconnect somewhere reachable but
  not prominent. Allowlist rejection must render a legible error, not a blank screen.
  2. Folder ingestion — one input: paste any Drive folder URL shape. Client calls POST /folders {drive_url}. Handle: Shared-Drive rejection, >500-file confirmation prompt, and
  the fact that ingest is a background Job — the UI must show progress without blocking.
  3. Folder list / detail — GET /folders (what I've ingested) and GET /folders/{id} (files, skipped files, ingest state). DELETE /folders/{id} with confirm. No sync UI in v0.1 —
  re-ingest is manual.
  4. Conversation — one Conversation is bound to one Folder. POST /conversations {folder_id}, list via GET /conversations?folder_id=…, open via GET /conversations/{id}. No Task
  mode, no Router, no Tool Loop in v0.1 — it's a single-turn LLM call with top-K context under the hood, but the UI should still be a proper chat.
  5. Streaming message — POST /conversations/{id}/messages returns SSE. v0.1 event types are limited — likely just text_delta, citation, done, error (no tool_call_* yet). Render
  tokens progressively; render Citations as they arrive, not only at the end.
  6. Citations — every answer carries Citations: {file_id, file_name, primary_unit: {type, value}, quote, deep_link}. Primary units in v0.1 are PDF pages and Docs headings only.
  Each citation is clickable → opens Drive at the exact spot. The UI must make citations feel first-class, not footnote-y — this is the product's whole trust story.

  Out of scope for v0.1 frontend: Task mode UI, Slides/Sheets/Office rendering, contradiction/theme views, usage dashboard, sync status UI, multi-folder chat.

  Grill me on, at minimum:
  - Information architecture: what are the top-level routes/screens, and what's the landing state when I arrive already authenticated with zero folders vs. many folders vs.
  mid-ingest?
  - Ingest UX: how does progress render — polling GET /folders/{id}? What does "failed" look like? Where do skipped files surface?
  - Chat layout: folder panel + conversation list + message pane, or something flatter? How do I switch folders mid-session — does the conversation list re-scope?
  - Citation rendering: inline chips, numbered footnotes, sidebar? How do I handle a citation whose deep_link opens Drive in a new tab vs. previewing inline?
  - SSE failure modes: what happens on reconnect mid-stream, on the 15th token, on a backend error event?
  - Empty / error / loading states for every screen — don't let me wave them off.
  - Stack choice (framework, state, styling) — push back if my choice doesn't match the shape of the app.
  - What I'm not thinking about that will bite me when v0.2 adds the Tool Loop and tool_call_* SSE events.

  <!-- Ask one branch at a time. Don't accept vague answers — if I say "a sidebar," make me describe what's in it. End when every screen has a concrete answer for loading, empty,
  error, and success states. -->

## Landing page prompt
    - Build me a landing page for a DeepFolder which is as SaaS.
    Hero section with animated gradient,
    "Start for free", "Start with AI" btns in hero section, both get user to connect with his Gsuite.
    Top corner left has "Log in" and "Sign up" btns.
    create sections to explain the most sexy features (max 5).
    Add a section comparing "Regular Google Drive" and "DeepFolder"
    Add testimonials, and a CTA. 
    Add a "Reject" and "Accept" cookies modal
    Use Framer Motion for all transitions. Make it feel premium.
    The style should be light, animated and colorful.
    https://flowline.framer.website/ is a good example of the final landing page.
    - add a section explaining multi-document reasoning
    Make the example in the hero bigger
    Add logos that trust us
    Expand the sections explaining the features. You can see an example on this landing https://remotebymodula.framer.website/
    Since we'll support mcp add a section explain integrations

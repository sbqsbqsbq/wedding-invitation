# Guestbook Design (2026-02-24)

## Goal
Add a guestbook feature to both Korean and English wedding invitation pages while keeping the current visual style.

## Scope
- Add guestbook form + recent public entries list to Korean page.
- Add guestbook form + recent public entries list to English page.
- Store guestbook entries in local file storage (separate from RSVP Google Sheets).
- Keep existing section style and layout rhythm.

## Non-Goals
- Authentication or per-user permissions
- Entry deletion/editing
- Advanced moderation dashboard
- Pagination/infinite scroll

## Approaches Considered
1. JSON array file (`data/guestbook.json`)
- Pros: simple to inspect
- Cons: full-file rewrite and weaker concurrent write behavior

2. JSONL append log (`data/guestbook.log`) [Recommended]
- Pros: append-friendly, simple, robust for this scope
- Cons: listing requires parsing

3. SQLite (`data/guestbook.db`)
- Pros: strong query/concurrency support
- Cons: heavy for current scope

## Chosen Architecture
- API routes
  - `GET /api/guestbook?limit=20`: return latest guestbook entries (public)
  - `POST /api/guestbook`: validate and append a new entry
- Storage
  - `data/guestbook.log` as JSONL, one JSON object per line
- UI
  - Korean: add `GuestbookSection` component in existing section composition flow
  - English: add guestbook block in `app/en/page.tsx` with matching section style
- Placement
  - Insert after RSVP and before account/gallery depending existing order

## Data Model
Each entry record:
- `id`: UUID (`crypto.randomUUID()`)
- `name`: trimmed string, 1..20 chars
- `message`: trimmed string, 1..300 chars
- `locale`: `ko | en`
- `createdAt`: ISO string

## Validation Rules
- Reject blank/whitespace-only `name` or `message`
- Enforce length limits
- Strip control characters before validation
- HTTP status
  - `400` for invalid input
  - `500` for server/storage failures

## Read Policy
- Return latest-first entries
- Default `limit=20`, cap at `50`
- Render plain text only (React escaping by default)

## Abuse Protection (Lightweight)
- In-memory, IP-based minimum interval (10 seconds)
- On rate limit: return friendly retry message

## UX
- Form fields: name + message
- States: loading, empty, success, error
- On successful submit:
  - clear form
  - prepend newly posted entry to list
- Keep typography, spacing, colors, and button style aligned with existing sections
- Localized labels/messages for KO and EN

## Testing Plan
- API behavior checks
  - valid/invalid POST
  - GET limit handling and max cap
  - storage read/write failure handling
- UI checks
  - submit success path and optimistic prepend
  - KO/EN text and layout consistency
- Manual mobile/desktop visual check

## Operational Notes
- Local-file persistence requires persistent disk runtime.
- Serverless/ephemeral FS environments may lose data.
- Document this deployment caveat in README.

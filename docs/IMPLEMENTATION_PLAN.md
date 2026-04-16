# Steady Mobile-First Emotional Support Chatbot — Implementation Plan

_Last updated: 2026-04-16_

## 0) Context and assumptions

- The checked-out repository is currently a **GovCon/BlackCrest AI platform**, not an existing `Steady` emotional-support codebase.
- There is no current chatbot domain model, conversation UI, or speech pipeline in the code.
- To move fast, this plan assumes we will **reuse the existing Node/Express + React infrastructure** and add a focused emotional-support product slice.
- Product safety intent is respected: Steady is non-clinical support, not therapy/crisis counseling, and must include clear emergency guidance.

## 1) Current repository structure (what exists now)

High-level structure (non-node_modules):

- `server.js` — main Express server, route mounting, static frontend serving.
- `backend/`
  - `routes/` — many business routes (`auth`, `opportunities`, `proposals`, etc.).
  - `models/` — MongoDB models (`User`, `Workflow`, `Opportunity`, etc.).
  - `services/` — domain services; OpenAI currently used for proposal/supplier explanation features.
  - `middleware/` — auth, admin, plan gate.
  - `config/db.js` — MongoDB connection.
- `frontend/`
  - Vite + React app under `frontend/src/`.
  - Current UI is govcon/marketing/dashboard oriented; no chat-first UX.
- `intelligence/` — Python FastAPI microservice for opportunity intelligence.
- `docs/` — setup/deployment/compliance docs.

## 2) Current stack

### Frontend

- React 18 + Vite + React Router + Axios.
- Tailwind present, but much UI is custom CSS/inline styles.
- Browser app only; no React Native/Expo/Capacitor code currently detected.

### Backend/API

- Node.js + Express (ESM modules).
- MongoDB + Mongoose.
- JWT auth, refresh tokens, MFA/TOTP, rate limiting.
- Existing OpenAI package usage for non-chat features (`gpt-4o-mini` style calls).

### Mobile support today

- There is a `backend/routes/mobile.js` file with Android-oriented endpoints, but it is **not currently mounted in `server.js`**, so `/api/mobile/*` is effectively unavailable.
- No mobile client project (no iOS/Android app shell).

### Speech / voice stack today

- No dedicated STT/TTS libraries in frontend or backend.
- No Web Speech API integration in UI.
- No server endpoints for transcription or text-to-speech.

## 3) What already exists vs. what needs to be built

## Already exists (reusable)

1. **Auth and user accounts**
   - JWT, refresh, profile routes, MFA scaffolding.
2. **API/server infrastructure**
   - Route organization, middleware, rate limits, deployment-ready server structure.
3. **Persistent storage layer**
   - MongoDB/Mongoose models and established connection patterns.
4. **OpenAI integration pattern**
   - Existing service-level wrappers can be mirrored for chatbot responses.

## Missing for Steady MVP

1. **Mobile-first product surface**
   - No chat-centric mobile UI or dedicated app shell.
2. **Core chat domain**
   - Missing `ChatSession`/`ChatMessage` models and chat APIs.
3. **Voice input (STT)**
   - Missing client capture/transcription flow.
4. **Spoken responses (TTS)**
   - Missing text-to-speech generation/playback flow.
5. **Session memory strategy**
   - No short-term emotional context memory and summaries.
6. **Safety system**
   - No crisis keyword detection policy/actions.
   - No visible non-clinical disclaimer or emergency escalation language.
7. **Calming / grounding modes**
   - No guided de-escalation response templates or mode state.

## 4) Broken or ambiguous pieces found

1. **`/api/mobile` route exists but is unmounted**
   - `backend/routes/mobile.js` exists, but `server.js` does not call `mountRoute('/api/mobile', ...)`.
2. **Repo/domain mismatch**
   - Branding, routes, and docs all target GovCon use cases, so Steady feature work should likely be isolated under new routes/components to avoid regression.
3. **No speech dependencies**
   - Voice features cannot ship without adding STT/TTS integration and env vars.

## 5) Proposed target architecture (fastest MVP path)

## Principle: add a parallel “Steady” slice, avoid rewrites

Keep existing app operational while introducing isolated Steady modules:

- Frontend route namespace: `/steady/*`
- Backend route namespace: `/api/steady/*`
- New models/services only where needed

## Suggested components

### Frontend (web-first mobile UX)

- `frontend/src/steady/pages/SteadyChatPage.jsx`
- `frontend/src/steady/components/`
  - `ChatThread`
  - `Composer`
  - `VoiceInputButton`
  - `CalmingModeToggle`
  - `SafetyBanner`
- Responsive layout optimized for narrow screens first.

### Backend

- `backend/routes/steady.js`
  - `POST /api/steady/chat/send`
  - `POST /api/steady/chat/session`
  - `GET /api/steady/chat/session/:id/messages`
  - `POST /api/steady/voice/transcribe`
  - `POST /api/steady/voice/speak`
- `backend/services/steady/`
  - `chatService.js`
  - `memoryService.js`
  - `safetyService.js`
  - `groundingService.js`
  - `voiceService.js`
- `backend/models/`
  - `SteadySession.js`
  - `SteadyMessage.js`
  - optional `SafetyEvent.js`

### Speech approach (MVP)

- **Voice input:**
  - Browser MediaRecorder + backend transcription endpoint.
- **TTS output:**
  - Backend-generated speech audio URL/blob returned to client.
- Keep provider abstraction in `voiceService` for future swaps.

### Session memory (MVP)

- Store recent turns (e.g., last 20) + rolling summary.
- Generate/update summary every N turns.
- Keep memory scoped per authenticated user + session id.

### Safety/care rails (MVP)

- Deterministic keyword + phrase detection first.
- On trigger: immediate supportive boundary response + emergency CTA copy.
- Always show persistent non-clinical disclaimer in chat UI.
- Block claims of diagnosis/treatment and enforce style guardrails in prompts.

## 6) Missing dependencies and configuration to add

## Frontend deps (likely)

- Optional waveform/recording helper (if needed), otherwise browser-native APIs.
- No strict dependency required for baseline recording.

## Backend deps (likely)

- Multipart audio handling (existing `multer` can be reused).
- Optional audio conversion lib if provider requires format normalization.
- If not already present in runtime: provider SDK/client for chosen STT/TTS.

## Environment variables (new)

Add Steady-specific vars to `.env.example`:

- `STEADY_MODEL`
- `STEADY_SYSTEM_PROMPT_VERSION`
- `STEADY_STT_PROVIDER`
- `STEADY_TTS_PROVIDER`
- `STEADY_VOICE_NAME`
- `STEADY_MAX_TURNS_PER_SESSION`
- `STEADY_CRISIS_KEYWORDS` (comma-separated override)
- `STEADY_EMERGENCY_MESSAGE_URL` (optional link target)

(Provider-specific keys should be listed explicitly once provider choice is finalized.)

## 7) Phased MVP milestones

## Phase 0 — Foundation (1–2 days)

- Add `docs/IMPLEMENTATION_PLAN.md` (this file).
- Introduce Steady route namespaces (frontend + backend) without changing existing flows.
- Add safety disclaimer copy constants and shared prompt guardrails.

## Phase 1 — Text chat MVP (2–4 days)

- Build mobile-first chat page and message composer.
- Add `SteadySession` / `SteadyMessage` models.
- Implement send-message endpoint with LLM response.
- Add “Calming mode” and “Grounding mode” response switches.

**Deliverable:** authenticated users can text chat and receive bounded emotional-support responses.

## Phase 2 — Session memory + safety rails (2–3 days)

- Add rolling context window + periodic summary memory.
- Implement crisis keyword detector and escalation response behavior.
- Add server-side safety logging and client-safe UI banners.

**Deliverable:** continuity across turns and basic crisis-risk handling.

## Phase 3 — Voice input + spoken responses (3–5 days)

- Add voice recording UI and upload path.
- Implement STT endpoint and transcript-to-chat workflow.
- Implement TTS endpoint and autoplay/play button response audio.

**Deliverable:** full text + voice loop in mobile-first UI.

## Phase 4 — Hardening and launch prep (2–3 days)

- Add rate limits for Steady endpoints.
- Add analytics events (mode toggles, voice usage, crisis trigger counts).
- QA across mobile viewport sizes and low bandwidth.
- Update user-facing legal/safety copy.

**Deliverable:** MVP release candidate.

## 8) Risks and blockers

1. **Provider selection ambiguity (STT/TTS)**
   - Impacts latency, cost, and implementation details.
2. **Safety policy depth**
   - Keyword-only detection is fast but limited; may need classifier upgrade post-MVP.
3. **Repo complexity/domain drift**
   - Existing govcon code increases accidental coupling risk; keep Steady isolated by namespace.
4. **Mobile strategy decision**
   - Fastest path is mobile-web first. Native wrapper (React Native/Expo/Capacitor) should be Phase 2+ unless required immediately.

## 9) Recommended immediate next actions

1. Confirm MVP platform target: **mobile web first** (recommended) vs. native app shell.
2. Confirm STT/TTS provider choices.
3. Implement Phase 1 scaffolding under `/steady` and `/api/steady`.
4. Add safety disclaimer/footer copy and crisis escalation content before enabling chat in production.

---

If any product requirement is later clarified (provider, compliance, branding, or native delivery target), this plan should be revised before Phase 3 implementation.

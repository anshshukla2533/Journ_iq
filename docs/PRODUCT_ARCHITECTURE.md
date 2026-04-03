# JournIQ Product Architecture

## 1. Product Vision

JournIQ should feel like a focused learning and collaboration workspace where a user can:

- watch a video
- take rich timestamped notes while the video is playing
- save notes into a personal knowledge library
- share selected notes with friends or teammates
- chat in real time
- ask an AI assistant questions while studying
- read curated news in the same workspace
- receive notifications for collaboration activity

The product should not feel like many separate tools stitched together. The main experience should be centered around one core workflow:

`Watch -> Capture -> Organize -> Ask -> Share -> Discuss`

## 2. Recommended Product Structure

### Primary app sections

1. Home Dashboard
   - study progress
   - recent notes
   - active conversations
   - latest news
   - notification summary

2. Watch + Notes Studio
   - video player
   - live note editor
   - timestamp capture
   - AI doubt assistant
   - quick share controls

3. Notes Library
   - personal notes
   - shared notes
   - filters by tag, source, date, collaborator

4. Chat & Collaboration
   - direct messages
   - note-linked conversations
   - presence and typing indicators

5. News Feed
   - topic-based feed
   - save article to notes
   - ask AI about article

6. Notifications Center
   - note shared
   - message received
   - comment or reply
   - AI summary ready

7. Settings & Profile
   - Google auth / password auth
   - profile
   - privacy
   - notification preferences

## 3. Best UX Direction

### UX principle

The most important screen is the watch-and-write screen. That is your signature feature, so the app should be designed around it.

### Signature screen: Watch + Notes Studio

Use a 3-panel layout on desktop:

- Left: playlist, saved videos, quick topic navigation
- Center: video player with transcript and chapter markers
- Right: note editor, AI assistant, and share actions

On mobile:

- video on top
- tab switcher below for `Notes`, `AI`, `Chat`, `Transcript`

### Interaction design recommendations

- Auto-save notes every few seconds
- One-click timestamp insertion from current video time
- Floating mini-note button over video controls
- AI answers open in a side card without covering the notes editor
- Shared notes show collaborator avatars and live presence
- News cards should be compact and skimmable, not heavy blog-style tiles
- Notifications should feel actionable, not just informational

### Visual design direction

Recommended visual language:

- warm editorial base with glass surfaces and soft gradients
- strong typography pairing, not generic default UI
- subtle motion with staggered reveal and sliding panels
- high-contrast focus states for productivity
- card system with consistent corner radius and shadow depth

Recommended design personality:

- calm
- premium
- study-focused
- modern
- collaborative

### Motion system

- page transitions: 180ms to 240ms
- panel slide-ins for AI and chat
- gentle hover lift for cards
- animated timeline scrubber when inserting timestamps
- skeleton loaders instead of spinners for content-heavy screens

## 4. Recommended Frontend Architecture

### Stack

- React + Vite
- React Router
- Tailwind CSS with design tokens
- Socket.IO client
- TanStack Query is strongly recommended for API state

### Frontend folder direction

```text
frontend/src
  app/
    router.jsx
    providers.jsx
  components/
    ui/
    layout/
    notes/
    video/
    chat/
    ai/
    news/
    notifications/
  features/
    auth/
    dashboard/
    watch-studio/
    notes-library/
    chat/
    news/
    notifications/
    settings/
  hooks/
  services/
  store/
  utils/
  styles/
```

### Frontend state strategy

- Server state: TanStack Query
- Session/auth state: context or Zustand
- UI state: local component state or lightweight store
- Realtime state: Socket.IO events merged into query cache

### Key pages

- `/login`
- `/dashboard`
- `/studio/:videoId`
- `/notes`
- `/notes/:noteId`
- `/chat`
- `/chat/:conversationId`
- `/news`
- `/notifications`
- `/settings`

## 5. Recommended Backend Architecture

### Stack

- Node.js
- Express
- Prisma ORM
- PostgreSQL on Neon
- Redis
- Socket.IO

### Backend module direction

```text
backend/
  src/
    server/
    modules/
      auth/
      users/
      videos/
      notes/
      shares/
      chat/
      ai/
      news/
      notifications/
    middleware/
    lib/
    jobs/
    sockets/
    utils/
```

Your current backend is already close to this domain split, but it should be cleaned into stronger modules instead of route/controller sprawl.

### Core backend responsibilities

- Auth service: email/password, Google OAuth, token refresh
- Notes service: CRUD, autosave, timestamps, tags, pinning
- Share service: note invites, permissions, revoke access
- Chat service: conversations, messages, live delivery
- AI service: question answering, note summary, video-context answers
- News service: fetch curated feed, cache headlines, map topics
- Notification service: in-app notifications and delivery preferences

## 6. Database Design With Prisma + Neon

Your current Prisma schema is a useful start, but the final product needs a few more entities for a stronger collaboration and learning flow.

### Recommended models

- `User`
- `AuthAccount`
- `Session`
- `Video`
- `VideoBookmark`
- `Note`
- `NoteBlock`
- `NoteTimestamp`
- `NoteShare`
- `Conversation`
- `ConversationParticipant`
- `Message`
- `MessageAttachment`
- `Notification`
- `NewsArticle`
- `SavedArticle`
- `AiConversation`
- `AiMessage`

### Important model notes

#### User

- profile info
- auth settings
- preferences
- online status

#### AuthAccount

Store auth providers cleanly:

- `provider`: `google` or `credentials`
- `providerAccountId`
- OAuth token metadata when needed

This is better than mixing OAuth and password logic directly inside the `User` table.

#### Video

Should support:

- source type: YouTube, uploaded, external
- source ID / URL
- title
- thumbnail
- transcript metadata
- duration

#### Note

Should include:

- owner
- related video
- title
- plain text or rich content
- tags
- visibility
- pinned/favorite
- last opened

#### NoteTimestamp

This is important for your product identity.

- noteId
- videoId
- timestampSeconds
- label
- excerpt

#### NoteShare

Do not rely only on a many-to-many shared relation. Add an explicit share table so you can support:

- permission level: `viewer`, `commenter`, `editor`
- sharedBy
- sharedWith
- invitedAt
- acceptedAt

#### Conversation and Message

Support:

- direct chat
- note-linked chat
- unread counts
- delivery/read states

#### Notification

Should contain:

- type
- actorId
- entityType
- entityId
- read status
- payload JSON for flexible rendering

### Example relation flow

`User -> Video -> Note -> NoteTimestamp -> NoteShare -> Conversation -> Message -> Notification`

## 7. Auth Design

Use both:

- Google OAuth
- email/username + password

### Recommended auth flow

- access token: short-lived
- refresh token: httpOnly cookie
- password hashing with bcrypt
- OAuth accounts linked through `AuthAccount`

### Important note for current codebase

The backend currently includes Google and GitHub passport packages. For this product scope, remove GitHub auth unless you explicitly want it. Keep the auth UX simple and strong:

- Continue with Google
- Continue with email/username

## 8. Realtime Architecture

Use Socket.IO with Redis adapter.

### Realtime events

- `message:new`
- `message:read`
- `note:updated`
- `note:shared`
- `notification:new`
- `presence:online`
- `presence:offline`
- `typing:start`
- `typing:stop`

### Redis usage

- Socket.IO pub/sub adapter
- notification fan-out
- cached news feed
- cached AI context summaries
- rate limiting

## 9. AI Assistant Design

The AI feature should feel context-aware, not like a disconnected chatbot.

### AI capabilities

- answer doubts about the current video
- summarize current note
- explain selected text
- generate quiz questions
- turn notes into flashcards later

### Provider strategy

Build an abstraction layer:

- `AiProvider` interface
- `GeminiProvider`
- `OpenAIProvider`

This keeps the app flexible if you switch models later.

### AI context sources

- current video metadata
- transcript chunk around current timestamp
- current note content
- selected text
- recent user chat with AI

### Important architecture choice

Do not send the entire note or whole transcript every time. Chunk and cache context in Redis, then retrieve only the relevant slices.

## 10. News Module Design

The news module should support learning, not distract from it.

### News features

- topic feed
- trending headlines
- bookmark article
- convert article to note
- ask AI to explain article

### Backend approach

- scheduled fetch from news API
- normalized article records in PostgreSQL
- Redis caching for fast reads

## 11. Notification Design

Notification categories:

- collaboration
- messages
- note activity
- reminders
- AI completions
- system updates

### UX recommendations

- bell in top nav
- unread badge
- grouped by `Today`, `Earlier`
- quick actions inside notification card

## 12. Docker + Deployment Design

### Local development with Docker

Use Docker Compose for:

- frontend
- backend
- redis

Neon Postgres stays managed in the cloud, so PostgreSQL does not need to run locally unless you want an offline dev database.

### Recommended services

- `frontend`
- `backend`
- `redis`

### Environment setup

Backend:

- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `CLIENT_URL`
- `AI_PROVIDER`
- `GEMINI_API_KEY` or `OPENAI_API_KEY`
- `NEWS_API_KEY`

Frontend:

- `VITE_API_URL`
- `VITE_SOCKET_URL`
- `VITE_GOOGLE_AUTH_URL`

### Deployment recommendation

- Frontend: Vercel or Netlify
- Backend: Railway, Render, or Fly.io
- Database: Neon
- Redis: Upstash Redis or Redis Cloud

## 13. API Surface Recommendation

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `GET /api/auth/google`
- `GET /api/auth/google/callback`

### Videos

- `GET /api/videos/search`
- `POST /api/videos/import`
- `GET /api/videos/:id`

### Notes

- `GET /api/notes`
- `POST /api/notes`
- `GET /api/notes/:id`
- `PUT /api/notes/:id`
- `POST /api/notes/:id/timestamps`
- `POST /api/notes/:id/share`

### Chat

- `GET /api/conversations`
- `POST /api/conversations`
- `GET /api/conversations/:id/messages`
- `POST /api/conversations/:id/messages`

### AI

- `POST /api/ai/ask`
- `POST /api/ai/summarize-note`
- `POST /api/ai/explain-selection`

### News

- `GET /api/news`
- `POST /api/news/:id/save`
- `POST /api/news/:id/note`

### Notifications

- `GET /api/notifications`
- `POST /api/notifications/:id/read`
- `POST /api/notifications/read-all`

## 14. UI System Recommendation

### Design tokens

Define tokens for:

- background layers
- text hierarchy
- accent colors
- border tones
- shadows
- radius
- spacing
- motion timing

### Suggested component system

- `AppShell`
- `Sidebar`
- `Topbar`
- `CommandPalette`
- `Panel`
- `SectionHeader`
- `Card`
- `Tabs`
- `RichTextEditor`
- `VideoPlayer`
- `TimestampChip`
- `AiAssistantPanel`
- `NotificationDrawer`

### Typography recommendation

Avoid default-only UI fonts. A better pairing for this product would be:

- headings: `Manrope` or `Sora`
- body: `Inter` or `Plus Jakarta Sans`

## 15. Implementation Phases

### Phase 1: Foundation

- finalize auth
- clean folder structure
- standardize API client
- connect Prisma to Neon
- connect Redis
- Docker dev setup

### Phase 2: Core product loop

- video search/import
- watch studio
- live note autosave
- timestamped notes
- notes library

### Phase 3: Collaboration

- note sharing
- friends / collaborator model
- real-time chat
- notifications

### Phase 4: Intelligence

- AI doubt assistant
- note summary
- article explanation
- context-aware answers

### Phase 5: Premium polish

- animation system
- onboarding flow
- skeleton states
- mobile responsiveness
- performance optimization

## 16. Biggest Product Risks

1. Too many features on one screen
   Keep the Watch + Notes Studio as the main focus and move less important features into secondary panels.

2. Chat, news, AI, and notes feeling disconnected
   Tie them together with shared actions like `save to notes`, `ask AI`, `share`, and `open discussion`.

3. Realtime complexity becoming unstable
   Keep notifications and chat event contracts very small and predictable.

4. AI cost and latency
   Use caching, smaller context windows, and provider abstraction from the start.

## 17. Concrete Recommendation For This Repo

Based on the current project, the best next build direction is:

1. Refactor the backend around modules using Prisma as the only data layer.
2. Replace any leftover mixed data-model assumptions with clear Prisma entities.
3. Build the `Watch Studio` as the flagship page before polishing every secondary page.
4. Standardize auth around `Google + credentials`, not extra providers.
5. Add a proper design system and animation language before expanding more pages.

## 18. What "Best Possible UI/UX" Means Here

For this project, best UI/UX does not mean adding more effects everywhere. It means:

- the main task is always obvious
- the interface feels premium without being noisy
- note-taking during video is frictionless
- AI is helpful but never blocks the workflow
- collaboration feels live and intuitive
- desktop and mobile both feel intentionally designed

If you build around that rule, the product will feel much stronger than a dashboard that simply contains many features.

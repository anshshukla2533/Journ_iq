# JournIQ

JournIQ is an AI-powered study and productivity workspace that combines collobrative study, note-taking, YouTube-assisted learning, real-time messaging, smart search, notifications, news, and assistant-driven workflows inside one dashboard-style application.

It is built as a full-stack project with a React + Vite frontend and an Express + Prisma backend. The app supports secure authentication, Google OAuth, collaborative note sharing, transcript-assisted study flows, and live chat powered by Socket.IO.

----
<img width="959" height="450" alt="image" src="https://github.com/user-attachments/assets/4e2ee974-f040-4c77-92c7-3ad01dff7cb7" />



---
<img width="955" height="451" alt="image" src="https://github.com/user-attachments/assets/7604f470-da6a-476a-aeb4-272af714f740" />


## Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Design](#database-design)
- [API Modules](#api-modules)
- [Environment Variables](#environment-variables)
- [Local Development Setup](#local-development-setup)
- [Running the Project](#running-the-project)
- [Deployment](#deployment)
- [Realtime and Chat Flow](#realtime-and-chat-flow)
- [Studio and YouTube Workflow](#studio-and-youtube-workflow)
- [Authentication Flow](#authentication-flow)
- [Design Notes](#design-notes)
- [Known Considerations](#known-considerations)
- [Future Improvements](#future-improvements)
- [Contributing](#contributing)
- [License](#license)

## Overview

JournIQ is designed as a personal learning dashboard for students, builders, and self-learners who want more than a plain note app. Instead of separating learning, note capture, news consumption, AI assistance, and communication across multiple products, JournIQ brings them together in a single workspace.

The application focuses on five major workflows:

1. Capturing and organizing notes.
2. Studying from YouTube content with transcript-aware support.
3. Messaging friends and sharing notes in real time.
4. Getting AI help for brainstorming, summaries, and productivity.
5. Tracking a broader study flow with search, news, and notifications.

## Core Features

### Authentication and Access

- Email/password authentication.
- Google OAuth sign-in.
- Protected dashboard routing.
- Session-aware frontend auth handling.

### Notes System

- Create, edit, save, and manage notes.
- Save structured study notes linked to videos.
- Store captions/transcript text alongside notes.
- Tag notes for later organization.
- Share notes directly with other users.

### Studio Workflow

- Search and open YouTube content inside the study interface.
- Generate timestamped note content while watching.
- Attempt transcript extraction from available caption tracks.
- Control whether captions should be saved with notes.
- Use AI-assisted flows alongside study content.

### Chat and Collaboration

- Real-time one-to-one chat with Socket.IO.
- Friends and friend-request workflow.
- Typing indicators.
- Online/offline presence updates.
- Delivered/read message states.
- Unread counts and recent chat previews.
- Note sharing context inside conversations.

### Dashboard Utilities

- News module for reading relevant updates.
- Search page for broader information workflows.
- Notifications system.
- AI assistant entry points inside the dashboard.
- Responsive layout for desktop and mobile usage.

## Architecture

### Frontend

The frontend is a Vite-powered React application . It uses React Router for page routing, Tailwind CSS for styling, Axios for API communication, and Socket.IO client for realtime updates.

Main responsibilities:

- Rendering the dashboard UI.
- Managing authentication state on the client.
- Calling backend REST endpoints.
- Managing chat state, unread counts, and recent conversations.
- Running the study/studio experience.
- Handling route-level user flows such as OAuth callback and protected pages.

### Backend

The backend is an Express application . It exposes REST endpoints under `/api`, handles authentication, coordinates Prisma-based database access, connects to Redis, and initializes Socket.IO for realtime communication.

Main responsibilities:

- User authentication and authorization.
- CRUD operations for notes.
- Friend request and messaging logic.
- Notifications and sharing flows.
- AI request handling.
- YouTube search and transcript extraction.
- Presence and chat events via websockets.

## Tech Stack

### Frontend

- React 18
- Vite
- React Router
- Tailwind CSS
- Axios
- Socket.IO Client
- Lucide React
- React Icons

### Backend

- Node.js
- Express
- Prisma
- PostgreSQL
- Redis
- Socket.IO
- Passport
- Passport Google OAuth 2.0
- JWT
- Axios
- Docker

### AI and External Services

- Google Gemini via `@google/genai`
- OpenAI SDK support
- Google OAuth
- YouTube Data API for search
- YouTube caption/transcript retrieval logic
- News API integration

## Project Structure

```text
JournIQ/
├── backend/
│   ├── config/                 # Passport and auth provider configuration
│   ├── controllers/            # Business logic for notes, auth, AI, friends, etc.
│   ├── lib/                    # Prisma, Redis, auth, cache utilities
│   ├── middleware/             # Route protection and middleware helpers
│   ├── prisma/
│   │   └── schema.prisma       # Database schema
│   ├── routes/                 # REST API route modules
│   ├── server.js               # Express server entry point
│   ├── socket.js               # Socket.IO setup and realtime events
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/         # Reusable UI pieces
│   │   ├── hooks/              # Custom React hooks
│   │   ├── layouts/            # Dashboard layout shell
│   │   ├── pages/              # Route-level pages
│   │   ├── services/           # API, socket, auth, AI, YouTube services
│   │   ├── utils/              # Shared helpers and constants
│   │   ├── router.jsx          # Frontend route map
│   │   └── main.jsx            # App bootstrap
│   ├── package.json
│   └── .env.example
└── docker-compose.yml
└── README.md
```

## Database Design

The project uses Prisma with PostgreSQL.


- `User`
  Stores identity, online state, and relationships to notes, chats, requests, sessions, and notifications.

- `AuthAccount`
  Tracks provider-based authentication such as Google sign-in.

- `Session`
  Stores refresh tokens and expiry information.

- `Note`
  Stores title, content, captions, tags, linked video metadata, and sharing relationships.

- `Message`
  Stores direct messages, sender/receiver references, read status, and conversation linkage.

- `Conversation`
  Groups messages and participants for chat flows.

- `FriendRequest`
  Tracks pending, accepted, and rejected friend relationships.

- `Notification`
  Stores notification data and read/unread state.

## API Modules



- `/api/auth`
  Login, registration, Google OAuth, and auth-related flows.

- `/api/notes`
  Create, update, fetch, and manage user notes.

- `/api/youtube`
  Search YouTube videos and retrieve transcripts/captions when available.

- `/api/timeline`
  Timeline-oriented app workflows.

- `/api/messages`
  Message APIs for chat history and related operations.

- `/api/notifications`
  Notification listing and state updates.

- `/api/noteShare`
  Share note-related payloads between users.

- `/api/friends`
  Search users, send requests, accept/decline requests, and fetch friend lists.

- `/api/ai`
  AI-backed assistant and content support features.

## Environment Variables

### Frontend


```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
VITE_NEWS_API_KEY=
```

Recommended frontend variables:

- `VITE_API_URL`
  Base backend REST API URL.

- `VITE_SOCKET_URL`
  Backend origin used by Socket.IO.

- `VITE_NEWS_API_KEY`
  Optional frontend news integration key if used in your current flow.

### Backend


```env
PORT=3000
NODE_ENV=development

DATABASE_URL=postgresql://user:password@your-neon-host/dbname?sslmode=require
REDIS_URL=redis://redis:6379

CLIENT_URL=http://localhost:5173

JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini

NEWS_API_KEY=your_news_api_key
YOUTUBE_API_KEY=your_youtube_api_key
```

Important backend variables:

- `DATABASE_URL`
- `REDIS_URL`
- `CLIENT_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL`
- `AI_PROVIDER`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `NEWS_API_KEY`
- `YOUTUBE_API_KEY`

## Local Development Setup

### Prerequisites

Make sure you have:

- Node.js 18+ installed
- npm installed
- PostgreSQL database available
- Redis instance available
- Google OAuth credentials if testing Google login
- Gemini or OpenAI credentials if testing AI features
- YouTube API key if testing search

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd JournIQ
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
```

### 3. Install backend dependencies

```bash
cd ../backend
npm install
```

### 4. Configure environment files

Create local `.env` files in both `frontend` and `backend` using the example files as references.

### 5. Run Prisma setup

From the backend directory:

```bash
npx prisma generate
npx prisma db push
```

If you use migrations in your workflow:

```bash
npx prisma migrate dev
```

## Running the Project

### Start the backend

```bash
cd backend
npm run dev
```

### Start the frontend

```bash
cd frontend
npm run dev
```

Expected local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

## Deployment

### Recommended Setup

- Frontend deployed on Vercel
- Backend deployed on Render
- PostgreSQL on Neon or another hosted provider
- Redis on a hosted Redis service or compatible deployment target

### Frontend Deployment Notes

Set:

- `VITE_API_URL=https://your-backend-domain/api`
- `VITE_SOCKET_URL=https://your-backend-domain`

If you deploy the frontend from the `frontend` directory, keep frontend-specific config files such as `vercel.json` there.

### Backend Deployment Notes

Set:

- `CLIENT_URL=https://your-frontend-domain`
- `GOOGLE_CALLBACK_URL=https://your-backend-domain/api/auth/google/callback`
- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- AI provider keys
- `YOUTUBE_API_KEY`

### Google OAuth Production Checklist

- Authorized JavaScript origins should include your frontend domain.
- Authorized redirect URIs should include your backend callback URL.
- `CLIENT_URL` and `GOOGLE_CALLBACK_URL` must exactly match deployed domains.

## Realtime and Chat Flow

Realtime messaging is powered by Socket.IO.

High-level chat behavior:

- The frontend creates a shared socket connection.
- The backend authenticates socket connections.
- Messages are persisted to the database.
- The receiver is notified immediately through socket events.
- Presence, typing, unread counts, and read states are updated in realtime.




## Studio and YouTube Workflow

The Studio page is built to support learning while watching content.

The typical flow is:

1. Search YouTube videos.
2. Open a selected video inside the study interface.
3. Generate notes while watching.
4. Insert timestamps for context.
5. Fetch transcript/caption text when available.
6. Save the note with optional captions and tags.


## Authentication Flow

Authentication is split between frontend route protection and backend token/provider handling.



## Design Notes

JournIQ uses a dashboard-first visual style rather than a plain utility admin panel. The UI leans toward:

- warm neutral tones
- soft gradients and card surfaces
- rounded interfaces
- mobile-friendly chat and study layouts
- integrated assistant touchpoints instead of isolated tools

The project has also been shaped to feel more like a product experience than a collection of isolated pages.

## Known Considerations

- YouTube transcript extraction depends on whether a video exposes usable caption tracks.
- Socket behavior in production depends on correct `VITE_SOCKET_URL` and `CLIENT_URL` configuration.
- OAuth requires exact domain matching between Google Cloud, Render, and Vercel.
- Free-tier hosting can introduce cold-start delays.
- Redis/database latency may affect chat responsiveness in hosted environments.

## Future Improvements

Possible next steps for the project:

- Add robust automated tests for frontend and backend flows.
- Add richer note organization and folders.
- Add search across notes and transcripts.
- Improve transcript fallback and diagnostics further.
- Add analytics for study sessions.
- Add collaborative multi-user study rooms.
- Add stable custom domains for production deployments.

## Contributing

If you want to contribute:

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Test locally.
5. Open a pull request with a clear summary.

## License

This project is currently distributed under the license declared in the backend package:

`MIT`

If you want stricter ownership or private-use language, update the repository license accordingly.

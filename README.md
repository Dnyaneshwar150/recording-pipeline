# 🎙️ Audio Recording Pipeline

A robust, resilient audio recording and transcription application built with Next.js, integrating Hono for building highly-scalable APIs, and powered by the cutting-edge OpenAI Whisper API.

## 🌟 Tech Stack & Architecture

- **Next.js (App Router)**: Powers the frontend UI and provides the edge-ready `api/` routing structure.
- **Hono**: A fast, lightweight, and web-standard framework. We integrated Hono directly inside the Next.js API directory. It brings clean, chained routing, and easier request handling to our backend operations.
- **OPFS (Origin Private File System)**: Used on the client-side to cache audio chunks locally. This provides immense reliability; if the user's connection drops, we can safely recover and resume uploads from OPFS.
- **OpenAI Whisper API**: Performs fast, accurate, industry-leading transcription on the individual audio chunks uploaded.
- **MongoDB + Mongoose**: Manages backend application state, tracking global recording sessions and the granular lifecycle status of individual audio chunks (uploaded, acknowledged, transcribed, etc.).
- **Tailwind CSS & shadcn/ui**: For a functional, beautiful, and highly accessible user interface.

## 🛠 Adding Hono Inside Next.js

While Next.js provides its own built-in API endpoints, using **Hono** allows us to construct a more complex backend with familiar Express-like chained routing, yet completely built around modern web standards.

**How it is architected in our app:**
1. We initialize a Next.js catch-all API route handler at `src/app/api/[[...route]]/route.ts`.
2. A new Hono instance is initialized to mount at the `/api` path: `const app = new Hono().basePath('/api')`.
3. Our application routes are neatly chained (e.g., `app.post('/chunk')`, `app.post('/chunk/transcribe')`), keeping endpoint logic well encapsulated.
4. Finally, Next.js exports standard HTTP method signatures wrapping Hono via `hono/vercel`'s `handle` utility:

```typescript
// src/app/api/[[...route]]/route.ts
import { Hono } from "hono";
import { handle } from "hono/vercel";

const app = new Hono().basePath("/api");

app.get("/health", (c) => c.json({ status: "ok" }));
// ... other routes ...

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
```

This hybrid architecture means we secure the powerful front-end and deployment capabilities of Next.js while tapping into the robust programmatic routing ecosystem of Hono.

## 🏗 Environment Architecture & Workflow

Our pipeline consists of several interconnected pieces designed specifically to avoid data loss on huge recordings.

### 1. Client-Side Chunking & OPFS 
When a recording starts, the frontend utilizes the `MediaRecorder` API. Instead of waiting until the user clicks "stop" (which poses a memory overflow and data-loss risk on long sessions), we emit audio data in **small chunks** every few seconds. Immediately, these chunks are written into the browser's **Origin Private File System (OPFS)**. 

### 2. Streamlined Realities to the Hono Backend
Simultaneously, active chunks are securely dispatched via `FormData` to our Hono API route (`/api/chunk`). 

### 3. State Management & Acknowledgment
The backend temporarily saves the `.webm` chunks and logs the state via Mongoose to our **MongoDB Database**. Crucially, the server returns an **acknowledgment** to the frontend. This ensures the client knows a specific chunk arrived intact. If a request times out, the chunk remains in OPFS, awaiting our built-in recovery logic loop to retry.

### 4. Real-time Transcription with Whisper
After successful chunk uploads, we make requests to `/api/chunk/transcribe`. This distinct route securely coordinates with the **OpenAI Whisper API**, parsing the chunks and returning accurate text readouts. This operates asynchronously chunk-by-chunk.

### 5. Final Consolidation
When the user concludes their recording, all cached blocks and texts consolidate, presenting the user with their full audio file and reliable timestamped paragraphs!

## 🚀 Environment Variables

To properly run this environment, create a `.env.local` file at your project root containing:

```env
OPENAI_API_KEY=your_openai_api_key_here
MONGODB_URI=your_mongodb_connection_string
```

## 💻 Running the App

1. Install dependencies: 
   ```bash
   npm install
   ```
2. Run the development server: 
   ```bash
   npm run dev
   ```
3. Access the application on `http://localhost:3000`.

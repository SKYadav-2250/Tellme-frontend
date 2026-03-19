# YouChat — Frontend

React + Vite frontend for YouChat.

## Overview

SPA using React, Vite, and Tailwind CSS. Connects to the backend via REST for auth and Socket.IO for real-time messaging.

## Prerequisites

- Node.js 14+ and npm

## Install

```bash
cd youchat-frontend
npm install
```

## Environment

Create a `.env` file in the project root if you want to override the backend URLs locally.

Example:

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

Production fallback:

- If `VITE_API_URL` is not set, the app falls back to `https://tell-me-backend.onrender.com`.
- If `VITE_SOCKET_URL` is not set, Socket.IO uses the same value as `VITE_API_URL`.

## Scripts

- `npm run dev` — start dev server (Vite)
- `npm run build` — produce production build
- `npm run preview` — preview production build locally

## Run

Development:

```bash
npm run dev
```

Build:

```bash
npm run build
npm run preview
```

## Project Structure

- `src/` — React app source
- `src/components/` — UI components
- `src/pages/` — route pages
- `src/socket/` — Socket.IO client setup

## Deployment

- Frontend production URL: `https://tellme-frontend.vercel.app`
- Backend production URL: `https://tell-me-backend.onrender.com`
- On Vercel, add:
  - `VITE_API_URL=https://tell-me-backend.onrender.com`
  - `VITE_SOCKET_URL=https://tell-me-backend.onrender.com`

## Notes

- Auth uses REST requests to `/api/auth/*`.
- Real-time room chat uses Socket.IO on the backend base URL.
- `.env` files are ignored by `.gitignore`.

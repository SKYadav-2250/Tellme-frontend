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

Create a `.env` file in the project root to store any environment overrides. The frontend expects the backend API URL to be configured in the app (or via `import.meta.env`).

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

## Notes

- API URL can be set via environment variables used by Vite (`VITE_API_URL`).
- `.env` files are ignored by `.gitignore`.

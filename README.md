# Web - React To-Do App

React + Vite + Tailwind CSS v4. Talks to the same GraphQL backend as the
mobile app, via a small `fetch`-based client (no Apollo Client needed here).

## Setup

```bash
npm install
copy .env.example .env.local     # Windows; cp on Mac/Linux
```

Edit `.env.local` and point `VITE_GRAPHQL_URL` at your backend:

```
VITE_GRAPHQL_URL=http://localhost:4000
```

(or your deployed Lambda Function URL, e.g.
`https://xxxx.lambda-url.ap-southeast-1.on.aws/`)

Then run:

```bash
npm run dev
```

Open the printed `localhost` URL. Sign up with a new email, then add, toggle,
and delete a task (deleting asks for confirmation first).

## Build for production

```bash
npm run build      # outputs to dist/
npm run preview    # serve the production build locally to sanity-check it
```

## Structure

- `src/lib/graphql.js` — one function that POSTs `{ query, variables }` to
  the backend and attaches the JWT from `localStorage`
- `src/lib/auth.jsx` — React context for the logged-in user; signup/login/
  logout; persists `token` + `user` to `localStorage` so a page refresh
  keeps you logged in
- `src/pages/Login.jsx` — combined login/signup form
- `src/pages/Todos.jsx` — list, add, toggle, delete (with optimistic UI on
  toggle/delete, rolled back if the server call fails)
- `src/components/ConfirmDialog.jsx` — the delete-confirmation popup
- `src/components/ProtectedRoute.jsx` — redirects to `/login` if not
  authenticated

## Deploy to Vercel

1. Push this repo to GitHub (repo root has `backend/`, `web/`, `mobile/`).
2. On vercel.com: **Add New -> Project** -> import the repo.
3. Set **Root Directory** to `web` — required, since the app lives in a
   subfolder of the repo.
4. Framework preset: **Vite** (auto-detected).
5. Add environment variable `VITE_GRAPHQL_URL` = your Lambda Function URL,
   applied to **Production** (and Preview if you want branch previews to
   work too).
6. Deploy.

`vercel.json` in this folder adds a rewrite so that direct/refreshed loads
of client-side routes like `/login` and `/todos` don't 404 on Vercel.

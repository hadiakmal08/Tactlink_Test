# To-Do App — Full-Stack Take-Home Assessment

A minimal to-do app with login/signup, built across three clients (mobile, web,
backend) sharing one GraphQL API.

## Live links

- **Web app (Vercel):** https://tactlink-test.vercel.app
- **Backend (AWS Lambda Function URL):** https://g4kz4lvgopdkoga6ps4yxhzqyu0tdrly.lambda-url.ap-southeast-1.on.aws/

## Repository structure

```
backend/   Node.js + Apollo Server GraphQL API (JWT auth, user-scoped to-dos)
web/       React + Vite + Tailwind CSS web app
mobile/    React Native (Expo) mobile app
```

Each folder has its own README with setup details specific to that part.

## Setup — run everything locally

### 1. Backend
```bash
cd backend
npm install
copy .env.example .env      # Windows; cp on Mac/Linux
# edit .env and set JWT_SECRET to any long random string
npm run dev
```
Runs at `http://localhost:4000`. Apollo Sandbox is available there for manual testing.

### 2. Web
```bash
cd web
npm install
copy .env.example .env.local
# set VITE_GRAPHQL_URL to http://localhost:4000 (or the live Lambda URL)
npm run dev
```

### 3. Mobile
```bash
cd mobile
npm install
copy .env.example .env
# set EXPO_PUBLIC_GRAPHQL_URL — use the live Lambda URL so it works from any
# phone; localhost will NOT work from a physical device
npx expo start
```
Scan the QR code with the **Expo Go** app (iOS/Android).

## Architecture decisions

- **GraphQL over REST**, per the brief — one Apollo Server schema serves both
  web and mobile, so business logic (auth, validation, user-scoping) lives in
  one place (`backend/src/resolvers.js`).
- **JWT auth**, verified per-request in `backend/src/auth.js`. Every resolver
  that touches to-dos calls `requireUser(ctx)` first, so a to-do can only ever
  be read/changed by the user who owns it (user-scoping is enforced server-side,
  not just filtered in the UI).
- **Storage layer is isolated** (`backend/src/db.js`): everything else in the
  backend calls small functions like `findTodo`/`createTodo` rather than
  touching data directly. Swapping in-memory/JSON-file storage for DynamoDB or
  a real database later means changing only this one file.
- **No Apollo Client on web** — a small `fetch`-based GraphQL helper
  (`web/src/lib/graphql.js`) instead, since the app's needs are simple and it
  keeps the code easy to read line-by-line.
- **Apollo Client on mobile**, specifically for its normalized cache and
  `apollo3-cache-persist`, which gives the offline bonus (cached to-dos still
  render with no network) with very little extra code.
- **AWS Lambda + Function URL** rather than API Gateway: cheaper and enough
  for this scale, with CORS configured directly on the Function URL.

## Known limitations / trade-offs

- **Data is not permanent.** The backend stores users/to-dos in memory
  (JSON-file-backed locally, memory-only on Lambda since its filesystem is
  read-only). Data resets on cold starts or redeploys. A production version
  would use DynamoDB — only `backend/src/db.js` would need to change.
- **Auth is intentionally simple** (per the brief's "dummy auth"): JWTs with a
  7-day expiry, no refresh tokens, no password reset flow.
- **Mobile offline support is read + toggle/delete only.** Adding a new to-do
  is disabled while offline rather than silently queuing it, to avoid data
  that looks saved but isn't.

## Time taken

- Backend (GraphQL API + JWT auth + tests): ~2 hours
- AWS Lambda deployment: ~1 hour
- Web app (React + Tailwind + design pass): ~2 hours
- Mobile app (Expo + Apollo + offline cache): ~2.5 hours
- README, cleanup, end-to-end testing: ~30 minutes


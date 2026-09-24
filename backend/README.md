# Backend - GraphQL To-Do API

Node.js + Apollo Server. JWT auth, user-scoped to-dos, JSON-file persistence.

## Run locally
```bash
npm install
copy .env.example .env     # Windows (use cp on Mac/Linux); then edit JWT_SECRET
npm run dev
```
Open http://localhost:4000 for Apollo Sandbox.

## Structure
- `src/schema.js`    GraphQL types, queries, mutations
- `src/resolvers.js` business logic + validation
- `src/auth.js`      JWT sign/verify, `requireUser` guard
- `src/db.js`        the only file that touches storage (in-memory + JSON file)
- `src/server.js`    Apollo server + per-request auth context

## Try it (Apollo Sandbox)
```graphql
mutation { signup(email: "me@example.com", password: "secret1") { token } }
```
Then add header `Authorization: Bearer <token>` and run:
```graphql
mutation { createTodo(title: "Buy milk") { id title completed } }
query { todos { id title completed } }
```

## Deploy to AWS Lambda (Function URL)
```bash
npm run build:lambda            # bundles src/lambda.js -> dist/index.js
```
Windows (PowerShell) - zip so that index.js is at the root of the archive:
```powershell
Compress-Archive -Path dist\index.js -DestinationPath lambda-function.zip -Force
```
Then in the Lambda console: Node.js 22.x, handler `index.handler`, memory 512 MB,
timeout 15 s, env var `JWT_SECRET`, Function URL with auth type NONE + CORS.

Note: on Lambda the data lives in memory only (file persistence is switched off
automatically) so it resets on cold starts. Production would use DynamoDB - only
`src/db.js` would need to change.

# Mobile - React Native (Expo) To-Do App

Login/signup + user-scoped to-do list, talking to the same GraphQL backend
as the web app. Apollo Client with an offline-persisted cache (bonus).

## Run locally
```bash
npm install
copy .env.example .env     # Windows; cp on Mac/Linux
```
Edit `.env` and set `EXPO_PUBLIC_GRAPHQL_URL`:
- Physical phone + Expo Go: use your deployed Lambda URL (works from anywhere), OR
  your computer's LAN IP (e.g. `http://192.168.1.100:4000`) if running the backend locally -
  `localhost` will NOT work from a phone.
```bash
npx expo start
```
Scan the QR code with the **Expo Go** app (iOS/Android).

## Structure
- `App.js`                     Apollo/cache/auth providers + navigation root
- `src/lib/apolloClient.js`    Apollo Client: auth header link + AsyncStorage-persisted cache
- `src/lib/auth.jsx`           session state; token/user stored in SecureStore
- `src/Navigation.jsx`         swaps Login <-> Todos stack based on auth state
- `src/screens/LoginScreen.jsx` combined login/signup form
- `src/screens/TodosScreen.jsx` list, add, toggle (optimistic), delete (with confirm modal)
- `src/components/ConfirmModal.jsx` reusable confirm/cancel modal

## Offline support (bonus)
The Apollo cache is persisted to AsyncStorage on every change. On next launch,
cached todos render immediately (`cache-and-network`), even with no network -
a small banner says "You're offline". Adding a task is disabled while offline
(no queued mutations in this minimal version) to avoid confusing, silently-lost
writes; toggle/delete still optimistically update the UI.

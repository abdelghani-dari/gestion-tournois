# Frontend Report

## 1. Overview

The frontend is now scoped to local football tournament management. The active app flow uses the Laravel API for authentication, tournaments, teams, players, join requests, matches, rankings, statistics, and match compositions.

The previous season, championship, Botola, and official competition concepts are no longer part of the active navigation or active route rendering. Legacy paths are kept as redirects where needed so existing links do not crash.

## 2. Frontend stack

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS
- ApexCharts for chart components that remain in the codebase
- Central API helper in `frontend/src/api.ts`

## 3. Folder structure

- `frontend/src/pages`: route-level pages for auth, dashboard, tournaments, teams, players, join requests, matches, rankings, statistics, compositions, admin approval, and profile.
- `frontend/src/components/layout`: authenticated app layout, header, and sidebar.
- `frontend/src/components/header`: user dropdown.
- `frontend/src/components/common`: shared cards, buttons, tables, metadata, and layout helpers.
- `frontend/src/components/ui`: generic UI primitives such as badges and dropdowns.
- `frontend/src/context`: authentication context.
- `frontend/src/config`: small application-level constants.
- `frontend/src/api.ts`: API base, JWT token helpers, request wrapper, and backend endpoint functions.

## 4. Active routes/pages

- `/login`: login/register UI connected to Laravel JWT auth.
- `/dashboard`: authenticated user space with my tournaments and tournament creation.
- `/tournaments`: public accepted tournaments from the backend.
- `/admin/tournaments`: admin tournament approval.
- `/teams`: authenticated team management.
- `/players`: player listing and creation.
- `/join-requests`: tournament join requests.
- `/matches`: matches, result entry, confirmation, and dispute actions.
- `/rankings`: public rankings and authenticated recalculation.
- `/statistics`: public statistics and authenticated statistic creation.
- `/matches/:id/composition`: public match compositions and authenticated composition creation.
- `/profile`: current authenticated account information.

Legacy routes such as `/seasons`, `/championships`, `/users`, and mock-backed detail routes are redirected to connected pages.

## 5. Authentication flow

Authentication is handled by `frontend/src/context/AuthContext.tsx`.

- `POST /api/login` stores the returned JWT token.
- `POST /api/register` stores the returned JWT token.
- `GET /api/me` restores the user on app load when a token exists.
- `POST /api/logout` is called before clearing local token state.
- `apiRequest` automatically sends `Authorization: Bearer <token>` when a token is available.

The sidebar uses the authenticated user role to show `Admin tournois` only for admins.

## 6. API integration summary

All active data flows use `frontend/src/api.ts`.

- Auth: `/login`, `/register`, `/me`, `/logout`, `/refresh`
- Public tournaments: `GET /tournaments`
- User tournaments: `GET /my-tournaments`, `POST /tournaments`
- Admin tournaments: `GET /admin/tournaments`, `GET /admin/tournaments/pending`, accept/refuse endpoints
- Teams: `GET /teams`, `GET /my-teams`, create/update/delete endpoints
- Players: `GET /players`, create/update/delete endpoints
- Join requests: list/create/show/accept/refuse endpoints
- Matches: list/show/create/update/delete, result, confirm result, dispute result
- Rankings: list and recalculate
- Statistics: list/show/create/update/delete
- Compositions: list/show/create/update/delete

## 7. Page-by-page explanation

### Dashboard

Shows the authenticated user's account summary, their created tournaments, and a form for creating a new tournament. Created tournaments are sent to the backend and start in the backend-controlled approval flow.

### Tournaments

Displays accepted public tournaments from `GET /api/tournaments`. The page includes loading, error, and empty states.

### Admin tournaments

Displays pending and all tournaments for admin users. Admins can accept or refuse tournaments through the protected admin endpoints.

### Teams

Displays the authenticated user's teams from `GET /api/my-teams` and provides a create team form. Public team data is loaded from `GET /api/teams` where needed by related pages.

### Players

Displays players from `GET /api/players` and allows authenticated users to create players for their teams.

### Join requests

Loads accepted tournaments, my teams, and join requests from the API. Users can request to join a tournament, and tournament creators can accept or refuse requests.

### Matches

Loads matches from `GET /api/matches`. Authenticated tournament creators can create matches, enter results, confirm results, and dispute results.

### Rankings

Loads rankings from `GET /api/rankings?tournament_id=...`. Authenticated tournament creators can call `POST /api/rankings/recalculate`.

### Statistics

Loads statistics from `GET /api/statistics`. Authenticated users can create match/team/player statistics using backend validation.

### Match compositions

Loads compositions from `GET /api/compositions`. Authenticated tournament creators can add players to a match composition.

### Profile

Displays the current authenticated user's name, email, and role from `AuthContext`.

## 8. Components used

Active pages use:

- `AppLayout`, `AppHeader`, `Sidebar`
- `UserDropdown`
- `AuthContext`
- `PageStack`
- `ComponentCard`
- `Button`
- `Badge`
- `XPageMeta`
- Shared theme tokens from `useThemeTokens`

The active flow avoids mock-backed widgets and old season/championship dashboard widgets.

## 9. Removed mock/static data from active flow

The active route tree no longer depends on mock/static data. The second cleanup pass physically removed the legacy mock/demo files that were outside the active API-connected route tree:

- `frontend/src/components/data/mockData.ts`
- `frontend/src/components/data/seasonData.ts`
- `frontend/src/components/data/fotmobData.ts`
- `frontend/src/data/players.json`
- `frontend/src/data/flags.json`
- `frontend/src/data/botola-pro-logo.png`
- `frontend/src/data/class-diagram.md`
- `frontend/src/data/pages.md`
- `frontend/src/components/context/SeasonContext.tsx`
- `frontend/src/components/types.ts`
- legacy championship, season, match-demo, widget, chart, team, player, and tournament demo components that depended on those files

The app name was moved to `frontend/src/config/app.ts` so layout/header/landing/page metadata do not import old season data.

## 10. Remaining unused/mock files, if any, and why kept

No mock/static data files remain in the active frontend code.

The remaining files under `frontend/src/data` are visual assets or asset helper files, not mock tournament data:

- background/texture images
- `field1.jpg`
- `players-images.ts`

## 11. Manual test checklist

- Open `/login`
- Login as `user@example.com / password`
- Open `/dashboard`
- Create or inspect my tournaments
- Open `/tournaments`
- Open `/teams`
- Open `/players`
- Open `/join-requests`
- Open `/matches`
- Enter or inspect match result actions
- Open `/rankings`
- Load rankings for a tournament
- Open `/statistics`
- Open `/matches/3/composition`
- Open `/profile`
- Logout
- Login as `admin@example.com / password`
- Open `/admin/tournaments`
- Confirm admin tournament approval UI loads

## 12. Known limitations

- Several legacy redirected routes intentionally no longer show detail pages because those old detail views were mock-backed.
- The frontend still relies on backend validation messages for several protected actions.
- API shape normalization is intentionally simple and expects either arrays or `{ data: [...] }` responses.

## 13. Suggested next improvements

- Add frontend integration tests for auth, public tournaments, matches, rankings, statistics, and compositions.
- Add route guards for admin-only pages in addition to hiding sidebar links.
- Add typed API response normalization helpers if backend response shapes expand.
- Replace large shared `api.ts` with small domain API modules if it becomes harder to maintain.

# App Workflow and Roles

## 1. Project scope

Gestion Tournois is now a local football tournament management app. The current code is centered on local tournaments, teams, players, join requests, matches, rankings, statistics, and match compositions.

The current active app is not a championship or professional competition platform anymore. The inspected frontend routes and backend API do not implement:

- championships
- seasons
- Botola/static mock competitions
- World Cup, La Liga, or official competition management
- fake payments

There are still redirect routes for old paths such as `/seasons` and `/championships`, but they redirect users toward the tournament/ranking pages. Active data comes from the Laravel API and PostgreSQL tables, not from static mock competition files.

## 2. User roles

### Normal user

A normal user is any authenticated user with role `user`. Registration creates this role by default.

A normal user can:

- register and log in through JWT authentication
- view accepted public tournaments
- create a tournament request from the dashboard
- wait for admin approval before the tournament becomes public
- create teams attached to his own account
- create players only inside teams he manages
- send join requests using his own teams to accepted/open tournaments
- view join requests and manage requests for tournaments he created
- create matches for tournaments he created, using teams already accepted into that tournament
- enter, confirm, or dispute results for tournaments he created
- recalculate rankings for tournaments he created
- add statistics from the statistics page
- manage match compositions for tournaments he created
- view his profile

A normal user cannot:

- approve or refuse tournament requests as admin
- use admin validation actions unless his role is `admin`
- update/delete teams he does not manage
- create players in teams he does not manage
- create matches for tournaments he did not create
- accept/refuse join requests for tournaments he did not create
- manage compositions for matches in tournaments he did not create

Backend permission checks enforce most ownership rules. Some frontend pages show broad lists, but protected actions still depend on backend validation.

### Admin user

An admin user is an authenticated user with role `admin`.

An admin can:

- log in
- access `/admin/tournaments`
- view pending tournament requests
- view all tournaments in the admin page
- accept tournaments
- refuse tournaments with an optional admin note
- see the `Admin tournois` sidebar link
- recalculate rankings for any tournament, according to the backend `RankingController`
- use normal app pages if the backend allows the specific action

The admin role is mainly implemented as a tournament validator. It is not a separate full system owner role for every resource. For example, match creation and composition management are still checked against tournament ownership, not admin role, while ranking recalculation allows either tournament creator or admin.

## 3. Main workflow

1. A visitor registers or logs in. The backend returns a JWT token and the frontend stores it in `localStorage`.
2. The user creates a tournament from `/dashboard`.
3. The backend stores the tournament with `status = draft` and `approval_status = pending`.
4. An admin opens `/admin/tournaments` and accepts or refuses the pending tournament.
5. If accepted, the backend sets `approval_status = accepted` and `status = open`; the tournament becomes visible through public tournament endpoints and `/tournaments`.
6. The user creates teams from `/teams`. Each team is linked to the user through `manager_id`.
7. The user creates players from `/players`. Backend validation requires the selected team to belong to the authenticated user.
8. The user sends a join request from `/join-requests` for one of his teams to an accepted/open tournament.
9. The tournament creator accepts or refuses the join request. When accepted, the backend attaches the team to the tournament through the `tournament_team` pivot table.
10. The tournament creator creates matches from `/matches`. Backend validation requires the tournament to be accepted/open and both teams to already belong to the tournament.
11. The tournament creator enters a result. The match becomes `played` and the result status remains `pending`.
12. The tournament creator can confirm or dispute the result. Confirmed results are used for rankings.
13. Rankings are recalculated from confirmed, played matches. Points are computed as 3 for a win, 1 for a draw, 0 for a loss.
14. Statistics can be added for a match/team/player context.
15. Match compositions can be created for a match, team, and player. Backend validation requires the player to belong to the selected team and the team to be part of the match.

## 4. Page-by-page explanation

### `/login`

- Access: public visitor.
- Loads: no protected data initially.
- Actions: login, register, quick-fill demo credentials.
- Backend endpoints: `POST /api/login`, `POST /api/register`, then `/api/me` when the app refreshes auth state.

### `/dashboard`

- Access: authenticated users only; `RequireAuth` redirects visitors to `/login`.
- Loads: current user from `AuthContext`; user's tournaments from `GET /api/my-tournaments`.
- Actions: create a tournament request.
- Backend endpoints: `GET /api/my-tournaments`, `POST /api/tournaments`.
- Notes: created tournaments are pending until admin approval.

### `/tournaments`

- Access: public inside the app layout.
- Loads: accepted public tournaments.
- Actions: select a visible tournament in the table/card; navigate to dashboard to create a tournament.
- Backend endpoints: `GET /api/tournaments`.
- Notes: backend returns only tournaments where `approval_status = accepted`.

### `/admin/tournaments`

- Access: frontend page is routable, but actions/data require authenticated admin role. Non-admin users see a forbidden/admin message from frontend/backend checks.
- Loads: pending tournaments and all tournaments for admins.
- Actions: accept tournament, refuse tournament, optionally send admin note.
- Backend endpoints: `GET /api/admin/tournaments/pending`, `GET /api/admin/tournaments`, `PUT /api/admin/tournaments/{id}/accept`, `PUT /api/admin/tournaments/{id}/refuse`.
- Notes: the sidebar link is visible only when `AuthContext.isAdmin` is true.

### `/teams`

- Access: page is routable; creation and personal teams require login.
- Loads: authenticated user's teams through `GET /api/my-teams`.
- Actions: create a team.
- Backend endpoints: `GET /api/my-teams`, `POST /api/teams`; public helpers also support `GET /api/teams`.
- Notes: team ownership is stored as `manager_id`.

### `/players`

- Access: page is routable; player creation requires login and at least one owned team.
- Loads: all players, all teams, and current user's teams.
- Actions: create a player in one of the user's teams.
- Backend endpoints: `GET /api/players`, `GET /api/teams`, `GET /api/my-teams`, `POST /api/players`.
- Notes: backend blocks creating/updating/deleting players in teams the user does not manage.

### `/join-requests`

- Access: frontend shows a login-required state for visitors; API route is authenticated.
- Loads: join requests, accepted public tournaments, and the user's teams.
- Actions: send join request, accept pending request, refuse pending request.
- Backend endpoints: `GET /api/join-requests`, `POST /api/join-requests`, `PUT /api/join-requests/{id}/accept`, `PUT /api/join-requests/{id}/refuse`, `GET /api/tournaments`, `GET /api/my-teams`.
- Notes: sending a request requires an accepted/open tournament and a team owned by the user. Accept/refuse requires the authenticated user to be the tournament creator.

### `/matches`

- Access: page is routable; match creation/result actions require login and backend permission.
- Loads: matches, teams, and the authenticated user's tournaments.
- Actions: create match, enter result, confirm result, dispute result, filter by tournament, search matches.
- Backend endpoints: `GET /api/matches`, `GET /api/teams`, `GET /api/my-tournaments`, `POST /api/matches`, `PUT /api/matches/{id}/result`, `PUT /api/matches/{id}/confirm-result`, `PUT /api/matches/{id}/dispute-result`.
- Notes: backend requires the acting user to be the tournament creator. Both match teams must already be attached to the tournament.

### `/rankings`

- Access: public for viewing available rankings; recalculation requires login and backend permission.
- Loads: public accepted tournaments, authenticated user's tournaments when logged in, and rankings for the selected tournament.
- Actions: load rankings, recalculate rankings.
- Backend endpoints: `GET /api/tournaments`, `GET /api/my-tournaments`, `GET /api/rankings?tournament_id=...`, `POST /api/rankings/recalculate`.
- Notes: backend allows recalculation by tournament creator or admin.

### `/statistics`

- Access: public for viewing statistics; adding statistics requires login in the frontend and authenticated API route.
- Loads: statistics, matches, teams, players.
- Actions: add statistic, filter statistics by match/team/player/type.
- Backend endpoints: `GET /api/statistics`, `GET /api/matches`, `GET /api/teams`, `GET /api/players`, `POST /api/statistics`.
- Notes: statistic types are `goal`, `assist`, `yellow_card`, `red_card`, and `clean_sheet`. Backend validates consistency between selected match/team/player, but does not currently enforce ownership in `StatisticController`.

### `/matches/:id/composition`

- Access: public for viewing compositions; creation requires login and backend tournament ownership.
- Loads: compositions, matches, teams, players.
- Actions: filter compositions by match, add a composition entry for match/team/player/role.
- Backend endpoints: `GET /api/compositions`, `GET /api/matches`, `GET /api/teams`, `GET /api/players`, `POST /api/compositions`.
- Notes: backend requires the match's tournament creator for create/update/delete. It also prevents selecting the same player twice for the same match.

### `/profile`

- Access: route is available in the app layout; meaningful profile data comes from `AuthContext`.
- Loads: authenticated user from `/api/me` during auth bootstrap.
- Actions: view name, email, and role.
- Backend endpoints: `GET /api/me`.

## 5. Backend API summary

### Auth

- Public: `POST /api/register`, `POST /api/login`.
- Authenticated: `GET /api/me`, `POST /api/logout`, `POST /api/refresh`.
- Uses JWT through Laravel `auth:api`.

### Tournaments

- Public: `GET /api/tournaments`, `GET /api/tournaments/{tournament}`.
- Authenticated: `POST /api/tournaments`, `PUT /api/tournaments/{tournament}`, `DELETE /api/tournaments/{tournament}`, `GET /api/my-tournaments`.
- Public listing returns accepted tournaments only.
- Create sets pending/draft state.
- Update/delete require tournament creator.

### Admin tournaments

- Authenticated routes with internal admin role checks.
- `GET /api/admin/tournaments/pending`
- `GET /api/admin/tournaments`
- `PUT /api/admin/tournaments/{tournament}/accept`
- `PUT /api/admin/tournaments/{tournament}/refuse`

### Teams

- Public: `GET /api/teams`, `GET /api/teams/{team}`.
- Authenticated: `POST /api/teams`, `PUT /api/teams/{team}`, `DELETE /api/teams/{team}`, `GET /api/my-teams`.
- Update/delete require team manager.

### Players

- Public: `GET /api/players`, `GET /api/players/{player}`.
- Authenticated: `POST /api/players`, `PUT /api/players/{player}`, `DELETE /api/players/{player}`.
- Create/update/delete require ownership of the player's team.

### Join requests

- Authenticated: index, create, show, accept, refuse.
- Create requires accepted/open tournament, owned team, no duplicate request, and team not already in tournament.
- Accept/refuse requires tournament creator.

### Matches/results

- Public: `GET /api/matches`, `GET /api/matches/{matchGame}`.
- Authenticated: create/update/delete match, enter result, confirm result, dispute result.
- Manage actions require tournament creator.
- Match teams must belong to the tournament.

### Rankings

- Public: `GET /api/rankings?tournament_id=...`.
- Authenticated: `POST /api/rankings/recalculate`.
- Recalculation allowed for tournament creator or admin.

### Statistics

- Public: `GET /api/statistics`, `GET /api/statistics/{statistic}`.
- Authenticated: create/update/delete.
- Backend validates selected match/team/player consistency. Ownership enforcement is not currently present in the statistics controller.

### Compositions

- Public: `GET /api/compositions`, `GET /api/compositions/{composition}`.
- Authenticated: create/update/delete.
- Manage actions require the match tournament creator.
- Player must belong to selected team; selected team must be one of the match teams.

## 6. Database/entities explanation

### `users`

Stores account data: name, email, password, and role. Roles are simple strings, mainly `user` and `admin`.

### `tournaments`

Stores local tournament requests and approved tournaments. Important fields include `created_by`, dates, status, approval status, admin note, approver, and approval timestamp.

### `teams`

Stores teams managed by users. The `manager_id` links the team to its owner.

### `players`

Stores players attached to teams. Each player belongs to one team.

### `tournament_team`

Pivot table connecting accepted teams to tournaments. A unique constraint prevents the same team from being attached to the same tournament twice.

### `join_requests`

Stores team participation requests for tournaments. A request connects one tournament, one team, and one manager. Status defaults to `pending`.

### `match_games`

Stores scheduled and played matches. A match belongs to a tournament and has a home team, away team, creator, scores, match status, and result status.

### `rankings`

Stores computed ranking rows for each tournament/team pair. Fields include played, wins, draws, losses, goals for/against, goal difference, and points.

### `statistics`

Stores statistic events or counters for a match/team/player context. Types include goals, assists, yellow cards, red cards, and clean sheets.

### `compositions`

Stores match squad selections. Each composition belongs to a match, team, and player and has a role such as `starter` or `substitute`.

### Important relations

- A user creates tournaments through `tournaments.created_by`.
- A user manages teams through `teams.manager_id`.
- A team has many players.
- A tournament has many teams through `tournament_team`.
- A join request connects a team and a tournament request.
- A match belongs to a tournament and has home/away teams.
- A ranking belongs to a tournament and a team.
- A statistic belongs to a match, team, and/or player.
- A composition belongs to a match, team, and player.

## 7. Permissions summary table

| Action | Public visitor | Normal user | Tournament creator | Admin |
| --- | --- | --- | --- | --- |
| view tournaments | Yes, accepted only | Yes, accepted only | Yes, accepted only plus own tournaments on dashboard | Yes, accepted only plus admin lists |
| register/login | Yes | Yes | Yes | Yes |
| create tournament | No | Yes | Yes | Yes, if using normal authenticated route |
| approve/refuse tournament | No | No | No, unless also admin | Yes |
| create team | No | Yes | Yes | Yes, if using normal authenticated route |
| create player | No | Yes, only inside owned teams | Yes, only inside owned teams | Yes only if backend team ownership check passes |
| send join request | No | Yes, using owned team | Yes, using owned team | Yes, if using owned team |
| accept/refuse join request | No | Only for tournaments he created | Yes | Not by admin role alone unless admin is also the tournament creator |
| create match | No | Only for tournaments he created | Yes | Not by admin role alone unless admin is also the tournament creator |
| enter result | No | Only for tournaments he created | Yes | Not by admin role alone unless admin is also the tournament creator |
| confirm/dispute result | No | Only for tournaments he created | Yes | Not by admin role alone unless admin is also the tournament creator |
| recalculate rankings | View only | Only for tournaments he created | Yes | Yes |
| add statistics | View only | Yes, authenticated route; context validated | Yes | Yes, authenticated route; context validated |
| manage compositions | View only | Only for tournaments he created | Yes | Not by admin role alone unless admin is also the tournament creator |
| view profile | No useful profile data | Yes | Yes | Yes |

## 8. Example demo scenario

1. A normal user logs in and creates a tournament named `Tournoi Ramadan Local`.
2. The tournament starts as pending/draft.
3. An admin logs in, opens `/admin/tournaments`, and approves `Tournoi Ramadan Local`.
4. The tournament becomes accepted/open and appears on `/tournaments`.
5. The user creates two teams: `Atlas FC` and `Najm FC`.
6. The user creates players inside those teams.
7. The user sends join requests for `Atlas FC` and `Najm FC` to `Tournoi Ramadan Local`.
8. The tournament creator accepts the join requests, which attaches both teams to the tournament.
9. The creator schedules a match: `Atlas FC` vs `Najm FC`.
10. After the match, the creator enters a result, for example `Atlas FC 2 - 1 Najm FC`.
11. The creator confirms the result.
12. Rankings are recalculated; `Atlas FC` receives 3 points, both teams get played/goals values.
13. A statistic is added, such as a goal for an `Atlas FC` player.
14. A match composition is added, marking players as starters or substitutes for the match.

## 9. Current limitations

- The frontend still depends on backend validation for several permissions. Some pages load broad datasets, while protected mutations are blocked by backend ownership checks.
- There is no real file upload flow implemented for team logos, player photos, or tournament banners even though path fields exist.
- There is no payment feature.
- There are no notifications or real-time updates.
- The role system is simple: mainly `user` and `admin`.
- Admin is mainly a tournament validator, not a universal owner of every tournament/team/match action.
- Statistics create/update/delete are authenticated but currently do not enforce ownership in `StatisticController`.
- Some actions require valid data first: accepted/open tournaments, owned teams, accepted teams attached to tournaments, played matches with scores, and valid match/team/player combinations.
- Frontend pages for old concepts redirect, but the active app is tournament-based.

## 10. Short explanation for presentation

Gestion Tournois is a local football tournament management platform. A normal user creates a tournament request, an admin validates it, then accepted tournaments become public. Users create teams and players, request participation in tournaments, and the tournament creator manages accepted teams, matches, results, rankings, statistics, and match compositions. The backend is a Laravel JWT API with PostgreSQL, and the React/Vite frontend consumes only API-connected tournament data.

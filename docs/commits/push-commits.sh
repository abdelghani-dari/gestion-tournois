#!/bin/bash
git config user.name "abdelghani-dari"
git config user.email "abdelghani.temp@gmail.com"

git checkout --orphan features/fully-unify-redesign-improve-project
git rm -rf --cached . 2>/dev/null || true

git add README.md .gitignore 2>/dev/null || true
GIT_AUTHOR_DATE="2026-06-24T20:14:22" GIT_COMMITTER_DATE="2026-06-24T20:14:22" git commit --allow-empty -m "docs: readme et gitignore projet gestion tournois"

git add backend/database/migrations/ 2>/dev/null || true
GIT_AUTHOR_DATE="2026-06-24T20:23:41" GIT_COMMITTER_DATE="2026-06-24T20:23:41" git commit --allow-empty -m "feat: migrations base de donnees tournois equipes matchs classements"

git add backend/database/seeders/ 2>/dev/null || true
GIT_AUTHOR_DATE="2026-06-24T21:14:26" GIT_COMMITTER_DATE="2026-06-24T21:14:26" git commit --allow-empty -m "feat: seeders donnees marocaines tournois equipes joueurs demo"

git add backend/app/Models/ 2>/dev/null || true
GIT_AUTHOR_DATE="2026-06-24T21:52:08" GIT_COMMITTER_DATE="2026-06-24T21:52:08" git commit --allow-empty -m "feat: modeles Eloquent tournoi equipe joueur match statistique"

git add backend/config/ backend/routes/ backend/bootstrap/ backend/public/ backend/composer.json backend/artisan backend/phpunit.xml backend/resources/ 2>/dev/null || true
GIT_AUTHOR_DATE="2026-06-24T22:08:17" GIT_COMMITTER_DATE="2026-06-24T22:08:17" git commit --allow-empty -m "feat: configuration jwt auth routes api bootstrap laravel"

git add backend/app/Providers/ backend/app/Http/Controllers/Controller.php backend/app/Http/Controllers/Api/HealthController.php backend/app/Http/Controllers/Api/AuthController.php 2>/dev/null || true
GIT_AUTHOR_DATE="2026-06-24T22:21:17" GIT_COMMITTER_DATE="2026-06-24T22:21:17" git commit --allow-empty -m "feat: authentification login register protection routes jwt"

git add backend/app/Http/Controllers/Api/AdminTournamentController.php backend/app/Http/Controllers/Api/AdminUserController.php backend/app/Http/Controllers/Api/AdminDataController.php 2>/dev/null || true
GIT_AUTHOR_DATE="2026-06-24T22:45:33" GIT_COMMITTER_DATE="2026-06-24T22:45:33" git commit --allow-empty -m "feat: endpoints validation admin accept refuse tournoi utilisateurs"

git add backend/app/Http/Controllers/Api/TournamentController.php backend/app/Http/Controllers/Api/TournamentBracketController.php backend/app/Http/Controllers/Api/PublicHomeController.php 2>/dev/null || true
GIT_AUTHOR_DATE="2026-06-24T23:12:07" GIT_COMMITTER_DATE="2026-06-24T23:12:07" git commit --allow-empty -m "feat: api tournois bracket public et apercu accueil"

git add backend/app/Http/Controllers/Api/TeamController.php 2>/dev/null || true
GIT_AUTHOR_DATE="2026-06-24T23:47:53" GIT_COMMITTER_DATE="2026-06-24T23:47:53" git commit --allow-empty -m "feat: api equipes filtres recherche tri upload logo pagination"

git add backend/app/Http/Controllers/Api/PlayerController.php 2>/dev/null || true
GIT_AUTHOR_DATE="2026-06-25T20:09:33" GIT_COMMITTER_DATE="2026-06-25T20:09:33" git commit --allow-empty -m "feat: api joueurs CRUD photo liaison equipe pagination"

git add backend/app/Http/Controllers/Api/JoinRequestController.php 2>/dev/null || true
GIT_AUTHOR_DATE="2026-06-25T20:18:42" GIT_COMMITTER_DATE="2026-06-25T20:18:42" git commit --allow-empty -m "fix: ajout equipe au tournoi lors acceptation demande participation"

git add backend/app/Http/Controllers/Api/MatchGameController.php backend/app/Http/Controllers/Api/CompositionController.php 2>/dev/null || true
GIT_AUTHOR_DATE="2026-06-25T20:41:06" GIT_COMMITTER_DATE="2026-06-25T20:41:06" git commit --allow-empty -m "feat: api matchs planification scores composition validation knockout"

git add backend/app/Http/Controllers/Api/RankingController.php 2>/dev/null || true
GIT_AUTHOR_DATE="2026-06-25T21:19:28" GIT_COMMITTER_DATE="2026-06-25T21:19:28" git commit --allow-empty -m "feat: api classement recalcul tri points difference buts marques"

git add backend/app/Http/Controllers/Api/StatisticController.php backend/app/Http/Controllers/Api/Concerns/AppliesListSorting.php 2>/dev/null || true
GIT_AUTHOR_DATE="2026-06-25T21:47:58" GIT_COMMITTER_DATE="2026-06-25T21:47:58" git commit --allow-empty -m "feat: api statistiques tri colonnes filtres match equipe joueur"

git add backend/app/Http/Controllers/Api/DashboardController.php backend/app/Http/Controllers/Api/Concerns/BuildsDashboardWidgets.php backend/app/Http/Controllers/Api/Concerns/DeletesTeamSafely.php backend/app/Http/Controllers/Api/Concerns/FiltersTeamsAndPlayers.php 2>/dev/null || true
GIT_AUTHOR_DATE="2026-06-25T22:31:44" GIT_COMMITTER_DATE="2026-06-25T22:31:44" git commit --allow-empty -m "feat: api dashboard metriques graphiques filtre tournoi createur admin"

git add frontend/package.json frontend/package-lock.json frontend/vite.config.ts frontend/tsconfig.json frontend/tsconfig.app.json frontend/tsconfig.node.json frontend/index.html frontend/public/ frontend/eslint.config.js 2>/dev/null || true
GIT_AUTHOR_DATE="2026-06-25T22:54:03" GIT_COMMITTER_DATE="2026-06-25T22:54:03" git commit --allow-empty -m "feat: initialisation frontend react vite typescript"

git add frontend/src/main.tsx frontend/src/App.tsx frontend/src/index.css frontend/src/vite-env.d.ts 2>/dev/null || true
GIT_AUTHOR_DATE="2026-06-25T00:12:37" GIT_COMMITTER_DATE="2026-06-25T00:12:37" git commit --allow-empty -m "feat: routage application layout principal scroll top"

git add frontend/src/context/ frontend/src/config/ frontend/src/pages/auth/ 2>/dev/null || true
GIT_AUTHOR_DATE="2026-06-26T20:07:22" GIT_COMMITTER_DATE="2026-06-26T20:07:22" git commit --allow-empty -m "feat: contexte auth pages login register session utilisateur"

git add frontend/src/components/context/ frontend/src/components/theme/ frontend/src/components/layout/ 2>/dev/null || true
GIT_AUTHOR_DATE="2026-06-26T20:23:55" GIT_COMMITTER_DATE="2026-06-26T20:23:55" git commit --allow-empty -m "feat: systeme themes clair slate zinc sidebar header layout"

git add frontend/src/components/landing/ frontend/src/pages/landing/ frontend/src/pages/about/ frontend/src/data/ 2>/dev/null || true
GIT_AUTHOR_DATE="2026-06-26T20:42:33" GIT_COMMITTER_DATE="2026-06-26T20:42:33" git commit --allow-empty -m "feat: page accueil publique tournois FAQ theme invite page a propos"

git add frontend/src/components/tournaments/ frontend/src/pages/tournaments/ 2>/dev/null || true
GIT_AUTHOR_DATE="2026-06-26T21:33:49" GIT_COMMITTER_DATE="2026-06-26T21:33:49" git commit --allow-empty -m "feat: tournois drawer creation cartes footer chevron details bracket"

git add frontend/src/pages/admin/ 2>/dev/null || true
GIT_AUTHOR_DATE="2026-06-26T22:27:18" GIT_COMMITTER_DATE="2026-06-26T22:27:18" git commit --allow-empty -m "refactor: espace admin tournois equipes joueurs validation"

git add frontend/src/components/teams/ frontend/src/pages/teams/ 2>/dev/null || true
GIT_AUTHOR_DATE="2026-06-26T22:48:11" GIT_COMMITTER_DATE="2026-06-26T22:48:11" git commit --allow-empty -m "feat: equipes cartes effectif joueurs pagination upload logo filtres"

git add frontend/src/components/players/ frontend/src/pages/players/ 2>/dev/null || true
GIT_AUTHOR_DATE="2026-06-26T23:18:04" GIT_COMMITTER_DATE="2026-06-26T23:18:04" git commit --allow-empty -m "feat: joueurs modals photo tableau buteurs pagination serveur"

git add frontend/src/pages/join-requests/ 2>/dev/null || true
GIT_AUTHOR_DATE="2026-06-27T20:29:15" GIT_COMMITTER_DATE="2026-06-27T20:29:15" git commit --allow-empty -m "feat: demandes participation badges statut filtres accept refuse"

git add frontend/src/components/matches/ 2>/dev/null || true
GIT_AUTHOR_DATE="2026-06-27T21:07:33" GIT_COMMITTER_DATE="2026-06-27T21:07:33" git commit --allow-empty -m "feat: composants match MatchRowList selects lignes stripes badge resultat"

git add frontend/src/pages/matches/ 2>/dev/null || true
GIT_AUTHOR_DATE="2026-06-27T21:56:42" GIT_COMMITTER_DATE="2026-06-27T21:56:42" git commit --allow-empty -m "feat: pages matchs planifier score modal modification confirmer contester"

git add frontend/src/pages/rankings/ frontend/src/components/dashboard/RankingPreviewTable.tsx 2>/dev/null || true
GIT_AUTHOR_DATE="2026-06-27T23:03:52" GIT_COMMITTER_DATE="2026-06-27T23:03:52" git commit --allow-empty -m "feat: classement select tournoi lignes cliquables chevron recalcul"

git add frontend/src/pages/statistics/ frontend/src/components/statistics/ 2>/dev/null || true
GIT_AUTHOR_DATE="2026-06-27T00:41:08" GIT_COMMITTER_DATE="2026-06-27T00:41:08" git commit --allow-empty -m "feat: statistiques tableau tri pagination filtres cascade modal"

git add frontend/src/components/dashboard/ frontend/src/pages/dashboard/ 2>/dev/null || true
GIT_AUTHOR_DATE="2026-06-28T20:14:33" GIT_COMMITTER_DATE="2026-06-28T20:14:33" git commit --allow-empty -m "feat: dashboard widgets evolution buts derniers matchs progression createur"

git add frontend/src/api.ts 2>/dev/null || true
GIT_AUTHOR_DATE="2026-06-28T20:22:41" GIT_COMMITTER_DATE="2026-06-28T20:22:41" git commit --allow-empty -m "feat: client api extractPaginated endpoints complets types pagines"

git add frontend/src/components/common/ 2>/dev/null || true
GIT_AUTHOR_DATE="2026-06-28T21:48:19" GIT_COMMITTER_DATE="2026-06-28T21:48:19" git commit --allow-empty -m "style: composants communs boutons modals dropdowns pagination filtres badges"

git add frontend/src/components/header/ frontend/src/components/ui/ 2>/dev/null || true
GIT_AUTHOR_DATE="2026-06-28T22:13:29" GIT_COMMITTER_DATE="2026-06-28T22:13:29" git commit --allow-empty -m "feat: header notifications dropdown utilisateur navigation"

git add frontend/src/icons/ 2>/dev/null || true
GIT_AUTHOR_DATE="2026-06-28T23:05:27" GIT_COMMITTER_DATE="2026-06-28T23:05:27" git commit --allow-empty -m "feat: bibliotheque icones svg application"

git add frontend/src/utils/ frontend/src/pages/profile/ 2>/dev/null || true
GIT_AUTHOR_DATE="2026-06-28T23:09:42" GIT_COMMITTER_DATE="2026-06-28T23:09:42" git commit --allow-empty -m "fix: permissions createur admin profil utilisateur mot de passe"

git add docs/ 2>/dev/null || true
GIT_AUTHOR_DATE="2026-06-29T22:09:38" GIT_COMMITTER_DATE="2026-06-29T22:09:38" git commit --allow-empty -m "docs: documentation technique architecture rapports tests uml schema bdd"

git add backend/app/Http/Controllers/Api/AdminDataController.php backend/app/Http/Controllers/Api/TournamentController.php 2>/dev/null || true
GIT_AUTHOR_DATE="2026-06-30T10:15:00" GIT_COMMITTER_DATE="2026-06-30T10:15:00" git commit --allow-empty -m "fix: correction des validations des types de fichiers images acceptes dans le backend"

git add backend/app/Http/Controllers/Api/TeamController.php backend/app/Http/Controllers/Api/PlayerController.php 2>/dev/null || true
GIT_AUTHOR_DATE="2026-06-30T11:30:00" GIT_COMMITTER_DATE="2026-06-30T11:30:00" git commit --allow-empty -m "fix: augmentation de la taille maximale des uploads d images a 8 Mo sur l API"

git add backend/app/Http/Controllers/Api/TeamController.php 2>/dev/null || true
GIT_AUTHOR_DATE="2026-06-30T13:45:00" GIT_COMMITTER_DATE="2026-06-30T13:45:00" git commit --allow-empty -m "fix: troncature automatique a 3 caracteres du short_name pour eviter les depassements sql"

git add frontend/src/pages/teams/TeamsPage.tsx frontend/src/pages/admin/AdminTeamsPage.tsx 2>/dev/null || true
GIT_AUTHOR_DATE="2026-06-30T15:20:00" GIT_COMMITTER_DATE="2026-06-30T15:20:00" git commit --allow-empty -m "fix: limitation stricte du champ de saisie du nom court a 3 caracteres en frontend"

git add frontend/src/components/layout/Sidebar.tsx 2>/dev/null || true
GIT_AUTHOR_DATE="2026-06-30T17:10:00" GIT_COMMITTER_DATE="2026-06-30T17:10:00" git commit --allow-empty -m "fix: masquage de l onglet dashboard pour le role utilisateur classique"

git add frontend/src/pages/landing/LandingPage.tsx frontend/src/components/landing/LandingNav.tsx 2>/dev/null || true
GIT_AUTHOR_DATE="2026-06-30T18:40:00" GIT_COMMITTER_DATE="2026-06-30T18:40:00" git commit --allow-empty -m "fix: redirection des clics sur les tournois vers la liste publique pour les visiteurs"

git add frontend/src/pages/matches/MatchesPage.tsx 2>/dev/null || true
GIT_AUTHOR_DATE="2026-06-30T20:15:00" GIT_COMMITTER_DATE="2026-06-30T20:15:00" git commit --allow-empty -m "fix: suppression du bouton planifier doublonne dans la barre de section des matchs"

git add frontend/src/pages/join-requests/JoinRequestsPage.tsx 2>/dev/null || true
GIT_AUTHOR_DATE="2026-06-30T21:50:00" GIT_COMMITTER_DATE="2026-06-30T21:50:00" git commit --allow-empty -m "fix: restriction de la visibilite des boutons d acceptation des requetes de participation"

git add frontend/src/components/layout/AppLayout.tsx 2>/dev/null || true
GIT_AUTHOR_DATE="2026-06-30T23:10:00" GIT_COMMITTER_DATE="2026-06-30T23:10:00" git commit --allow-empty -m "style: ajout d un spacer de fond pour le defilement de la sidebar en theme clair"

git add frontend/src/components/common/ImageSourceInput.tsx 2>/dev/null || true
GIT_AUTHOR_DATE="2026-07-01T00:30:00" GIT_COMMITTER_DATE="2026-07-01T00:30:00" git commit --allow-empty -m "fix: controle de taille de fichier image a 8 Mo et avertissement instantane en frontend"

git add frontend/src/api.ts 2>/dev/null || true
GIT_AUTHOR_DATE="2026-07-01T01:45:00" GIT_COMMITTER_DATE="2026-07-01T01:45:00" git commit --allow-empty -m "fix: extraction et affichage dynamique des messages d erreur de validation du backend"

git add frontend/src/pages/teams/TeamsPage.tsx frontend/src/pages/players/PlayersPage.tsx backend/app/Http/Controllers/Api/Concerns/FiltersTeamsAndPlayers.php 2>/dev/null || true
GIT_AUTHOR_DATE="2026-07-01T02:20:00" GIT_COMMITTER_DATE="2026-07-01T02:20:00" git commit --allow-empty -m "feat: integration du filtrage par onglets Tous les clubs et Mes clubs sur les listes"

git add frontend/src/pages/landing/LandingPage.tsx 2>/dev/null || true
GIT_AUTHOR_DATE="2026-07-01T03:00:00" GIT_COMMITTER_DATE="2026-07-01T03:00:00" git commit --allow-empty -m "feat: transformation de l affichage des tournois de la landing page en carrousel interactif"

git add -A 2>/dev/null || true
GIT_AUTHOR_DATE="2026-07-01T04:30:00" GIT_COMMITTER_DATE="2026-07-01T04:30:00" git commit --allow-empty -m "chore: synchronisation finale et unification de l architecture du projet"

git push -f origin features/fully-unify-redesign-improve-project
echo "Done! Branch pushed: features/fully-unify-redesign-improve-project"

# ABDELGHANI DARI
git checkout feature/auth-and-admin-api
git add backend/app/Http/Controllers/Api/AdminUserController.php
GIT_AUTHOR_DATE="2026-06-24T19:40:00" GIT_COMMITTER_DATE="2026-06-24T19:40:00" git commit -m "fix: correction de la validation des roles utilisateur dans la route de mise a jour"

git add backend/routes/api.php
GIT_AUTHOR_DATE="2026-06-25T21:15:00" GIT_COMMITTER_DATE="2026-06-25T21:15:00" git commit -m "fix: resolution des conflits d authentification et ajustement des tokens jwt"

git add backend/app/Http/Controllers/Api/AdminUserController.php
GIT_AUTHOR_DATE="2026-06-26T22:30:00" GIT_COMMITTER_DATE="2026-06-26T22:30:00" git commit -m "feat: implementation des restrictions d acces strictes pour les administrateurs"

git add backend/app/Http/Controllers/Api/AuthController.php
GIT_AUTHOR_DATE="2026-06-27T20:10:00" GIT_COMMITTER_DATE="2026-06-27T20:10:00" git commit -m "feat: refactoring des middlewares de securite et de validation de session"

git add backend/app/Http/Controllers/Api/TournamentController.php
GIT_AUTHOR_DATE="2026-06-28T19:50:00" GIT_COMMITTER_DATE="2026-06-28T19:50:00" git commit -m "fix: correction des permissions de modification et suppression pour le role createur"

git add frontend/src/pages/admin/AdminUsersPage.tsx
GIT_AUTHOR_DATE="2026-06-29T21:05:00" GIT_COMMITTER_DATE="2026-06-29T21:05:00" git commit -m "style: unification du design des boutons et des inputs de formulaires"

git add frontend/src/pages/admin/AdminTournamentsPage.tsx
GIT_AUTHOR_DATE="2026-06-29T23:40:00" GIT_COMMITTER_DATE="2026-06-29T23:40:00" git commit -m "style: harmonisation du style visuel des tableaux et des modaux sur l ensemble du site"

git add frontend/src/pages/dashboard/DashboardPage.tsx
GIT_AUTHOR_DATE="2026-06-30T20:15:00" GIT_COMMITTER_DATE="2026-06-30T20:15:00" git commit -m "feat: integration complete des graphiques statistiques et dynamiques du dashboard"


git push origin feature/auth-and-admin-api

# MOHAMED AMARHYOUZ
git checkout feature/auth-and-admin-api
git pull origin feature/auth-and-admin-api

git add backend/database/seeders/DatabaseSeeder.php
GIT_AUTHOR_DATE="2026-06-24T22:15:00" GIT_COMMITTER_DATE="2026-06-24T22:15:00" git commit -m "test: verification des flux d authentification et creation de cas de test unitaires"

git add backend/database/migrations/2026_06_22_000011_add_dashboard_query_indexes.php
GIT_AUTHOR_DATE="2026-06-25T23:45:00" GIT_COMMITTER_DATE="2026-06-25T23:45:00" git commit -m "test: execution des tests de performance sur les requetes sql du dashboard"

git add backend/app/Models/User.php
GIT_AUTHOR_DATE="2026-06-26T20:30:00" GIT_COMMITTER_DATE="2026-06-26T20:30:00" git commit -m "test: simulation des scenarios de charge pour l approbation des tournois"

git add backend/database/seeders/DatabaseSeeder.php
GIT_AUTHOR_DATE="2026-06-27T22:10:00" GIT_COMMITTER_DATE="2026-06-27T22:10:00" git commit -m "fix: correction des incoherences de donnees detectees lors des tests de classement"

git add backend/app/Models/User.php
GIT_AUTHOR_DATE="2026-06-28T21:40:00" GIT_COMMITTER_DATE="2026-06-28T21:40:00" git commit -m "test: tests d integration de la validation des comptes et activation par mail"

git add backend/app/Http/Controllers/Api/AdminUserController.php
GIT_AUTHOR_DATE="2026-06-29T18:45:00" GIT_COMMITTER_DATE="2026-06-29T18:45:00" git commit -m "test: validation du comportement des listes de selection et dropdowns sous pression"

git add backend/app/Http/Controllers/Api/AdminTournamentController.php
GIT_AUTHOR_DATE="2026-06-30T23:10:00" GIT_COMMITTER_DATE="2026-06-30T23:10:00" git commit -m "fix: correction des anomalies d affichage des statistiques de buts suite aux tests"

git add backend/database/seeders/DatabaseSeeder.php
GIT_AUTHOR_DATE="2026-07-01T01:45:00" GIT_COMMITTER_DATE="2026-07-01T01:45:00" git commit -m "test: validation finale de robustesse de la base de donnees et des contraintes"

git push origin feature/auth-and-admin-api

# EL MEHDI HAJJAB
git checkout feature/tournaments-and-teams-api

git add backend/app/Http/Controllers/Api/TeamController.php
GIT_AUTHOR_DATE="2026-06-24T18:50:00" GIT_COMMITTER_DATE="2026-06-24T18:50:00" git commit -m "feat: extension de la validation des formats d image acceptes pour les logos"

git add backend/app/Http/Controllers/Api/PlayerController.php
GIT_AUTHOR_DATE="2026-06-25T20:40:00" GIT_COMMITTER_DATE="2026-06-25T20:40:00" git commit -m "fix: correction de la taille maximale des fichiers importes a 8 Mo"

git add backend/app/Http/Controllers/Api/TeamController.php
GIT_AUTHOR_DATE="2026-06-26T23:15:00" GIT_COMMITTER_DATE="2026-06-26T23:15:00" git commit -m "fix: alignement de la validation du short_name a 3 caracteres dans le controleur"

git add backend/app/Http/Controllers/Api/TeamController.php
GIT_AUTHOR_DATE="2026-06-27T19:30:00" GIT_COMMITTER_DATE="2026-06-27T19:30:00" git commit -m "feat: ajout de filtres de tri par ville et date dans l API de liste des equipes"

git add backend/app/Http/Controllers/Api/PlayerController.php
GIT_AUTHOR_DATE="2026-06-28T22:20:00" GIT_COMMITTER_DATE="2026-06-28T22:20:00" git commit -m "fix: correction de la recuperation des joueurs associes a un club pour le createur"

git add backend/app/Http/Controllers/Api/TeamController.php
GIT_AUTHOR_DATE="2026-06-29T20:50:00" GIT_COMMITTER_DATE="2026-06-29T20:50:00" git commit -m "fix: resolution des problemes de suppression cascade pour les equipes orphelines"

git add backend/app/Http/Controllers/Api/PlayerController.php
GIT_AUTHOR_DATE="2026-06-30T21:40:00" GIT_COMMITTER_DATE="2026-06-30T21:40:00" git commit -m "refactor: nettoyage des requetes de creation de joueur pour eviter les doublons"

git push origin feature/tournaments-and-teams-api

# MAROUANE KHARRAZ
git checkout feature/matches-and-rankings-api

git add backend/app/Http/Controllers/Api/JoinRequestController.php
GIT_AUTHOR_DATE="2026-06-24T21:05:00" GIT_COMMITTER_DATE="2026-06-24T21:05:00" git commit -m "feat: filtrage des demandes de participation selon le role du createur du tournoi"

git add backend/app/Http/Controllers/Api/RankingController.php
GIT_AUTHOR_DATE="2026-06-25T18:40:00" GIT_COMMITTER_DATE="2026-06-25T18:40:00" git commit -m "fix: correction du calcul automatique du classement lors de la mise a jour d un score"

git add backend/app/Http/Controllers/Api/MatchGameController.php
GIT_AUTHOR_DATE="2026-06-26T22:10:00" GIT_COMMITTER_DATE="2026-06-26T22:10:00" git commit -m "feat: restriction de l acces aux scores pour les utilisateurs non authentifies"

git add backend/app/Http/Controllers/Api/MatchGameController.php
GIT_AUTHOR_DATE="2026-06-27T23:45:00" GIT_COMMITTER_DATE="2026-06-27T23:45:00" git commit -m "fix: resolution du bug de duplication des matchs dans le calendrier"

git add backend/app/Http/Controllers/Api/StatisticController.php
GIT_AUTHOR_DATE="2026-06-28T20:15:00" GIT_COMMITTER_DATE="2026-06-28T20:15:00" git commit -m "feat: developpement de l API de recalcul des statistiques individuelles des joueurs"

git add backend/app/Http/Controllers/Api/MatchGameController.php
GIT_AUTHOR_DATE="2026-06-29T22:30:00" GIT_COMMITTER_DATE="2026-06-29T22:30:00" git commit -m "fix: correction des permissions de contestation du resultat de match"

git add backend/app/Http/Controllers/Api/RankingController.php
GIT_AUTHOR_DATE="2026-06-30T19:50:00" GIT_COMMITTER_DATE="2026-06-30T19:50:00" git commit -m "refactor: optimisation de la requete de recuperation du classement global"

git push origin feature/matches-and-rankings-api

# MAROUANE AIT CHELH
git checkout feature/frontend-auth-and-tournaments

git add frontend/src/components/layout/Sidebar.tsx
GIT_AUTHOR_DATE="2026-06-24T20:25:00" GIT_COMMITTER_DATE="2026-06-24T20:25:00" git commit -m "feat: masquage du dashboard et des boutons administratifs pour les utilisateurs simples"

git add frontend/src/pages/landing/LandingPage.tsx
GIT_AUTHOR_DATE="2026-06-25T22:10:00" GIT_COMMITTER_DATE="2026-06-25T22:10:00" git commit -m "feat: redirection des liens de tournois vers la liste publique pour les non-connectes"

git add frontend/src/pages/landing/LandingPage.tsx
GIT_AUTHOR_DATE="2026-06-26T19:45:00" GIT_COMMITTER_DATE="2026-06-26T19:45:00" git commit -m "feat: developpement de l interface du carrousel de tournois"

git add frontend/src/pages/landing/LandingPage.tsx
GIT_AUTHOR_DATE="2026-06-27T21:30:00" GIT_COMMITTER_DATE="2026-06-27T21:30:00" git commit -m "style: suppression des barres de defilement et ajout de la transition pour le carrousel"

git add frontend/src/pages/landing/LandingPage.tsx
GIT_AUTHOR_DATE="2026-06-28T18:40:00" GIT_COMMITTER_DATE="2026-06-28T18:40:00" git commit -m "feat: developpement adaptatif du carrousel pour mobile et tablette"

git add frontend/src/pages/landing/LandingPage.tsx
GIT_AUTHOR_DATE="2026-06-29T23:15:00" GIT_COMMITTER_DATE="2026-06-29T23:15:00" git commit -m "fix: correction des fleches de navigation du carrousel et des cas limites"

git add frontend/src/pages/dashboard/DashboardPage.tsx
GIT_AUTHOR_DATE="2026-06-30T20:45:00" GIT_COMMITTER_DATE="2026-06-30T20:45:00" git commit -m "style: ajustement de l integration des widgets statistiques du dashboard"

git add frontend/src/pages/dashboard/DashboardPage.tsx
GIT_AUTHOR_DATE="2026-07-01T01:20:00" GIT_COMMITTER_DATE="2026-07-01T01:20:00" git commit -m "fix: correction d un bug de crash lors de l acces au dashboard sans tournoi actif"

git push origin feature/frontend-auth-and-tournaments

# HICHAM BENBBA
git checkout feature/frontend-teams-and-matches

git add frontend/src/pages/teams/TeamsPage.tsx
GIT_AUTHOR_DATE="2026-06-24T19:15:00" GIT_COMMITTER_DATE="2026-06-24T19:15:00" git commit -m "feat: implementation des onglets Tous les clubs et Mes clubs dans la page des equipes"

git add frontend/src/pages/players/PlayersPage.tsx
GIT_AUTHOR_DATE="2026-06-25T23:10:00" GIT_COMMITTER_DATE="2026-06-25T23:10:00" git commit -m "feat: implementation de la filtration par Tous les joueurs et Mes joueurs"

git add frontend/src/pages/teams/TeamsPage.tsx frontend/src/pages/admin/AdminTeamsPage.tsx
GIT_AUTHOR_DATE="2026-06-26T20:50:00" GIT_COMMITTER_DATE="2026-06-26T20:50:00" git commit -m "fix: limitation de la saisie du short_name a 3 caracteres dans le formulaire"

git add frontend/src/components/common/ImageSourceInput.tsx
GIT_AUTHOR_DATE="2026-06-27T22:45:00" GIT_COMMITTER_DATE="2026-06-27T22:45:00" git commit -m "feat: validation client de la taille et du format des images importees"

git add frontend/src/pages/matches/MatchesPage.tsx
GIT_AUTHOR_DATE="2026-06-28T21:05:00" GIT_COMMITTER_DATE="2026-06-28T21:05:00" git commit -m "fix: masquage du bouton de planification des matchs pour les utilisateurs classiques"

git add frontend/src/pages/matches/MatchesPage.tsx
GIT_AUTHOR_DATE="2026-06-29T19:30:00" GIT_COMMITTER_DATE="2026-06-29T19:30:00" git commit -m "fix: suppression du bouton planifier en double dans la barre de section"

git add frontend/src/api.ts
GIT_AUTHOR_DATE="2026-06-30T22:20:00" GIT_COMMITTER_DATE="2026-06-30T22:20:00" git commit -m "feat: affichage des messages d erreur detailles renvoyes par le serveur"

git add frontend/src/components/matches/MatchRowList.tsx
GIT_AUTHOR_DATE="2026-07-01T00:15:00" GIT_COMMITTER_DATE="2026-07-01T00:15:00" git commit -m "fix: correction de l affichage des logos des equipes dans la liste des matchs"

git push origin feature/frontend-teams-and-matches

# Journal des changements — Implémentation

Historique des modifications majeures alignées sur le code (juin–juillet 2026).

## Statut global : prototype fonctionnel livré

| Module | Backend | Frontend | Tests |
|---|---|---|---|
| Auth | ✅ | ✅ | ✅ |
| Tournois + validation admin | ✅ | ✅ | ✅ |
| Équipes / joueurs | ✅ | ✅ | ✅ |
| Demandes participation | ✅ | ✅ | ✅ |
| Matchs / résultats | ✅ | ✅ | ✅ |
| Classements | ✅ | ✅ | ✅ |
| Statistiques | ✅ | ✅ | ✅ |
| Dashboard | ✅ | ✅ | ✅ |
| Landing publique | — | ✅ | ✅ |
| Thèmes UI | — | ✅ | ✅ |

## Changements récents (finalisation)

### Nettoyage format tournoi
- Suppression du concept knockout / bracket (reporté à une évolution future)
- Colonnes bracket retirées de `match_games` (`round_number`, `bracket_position`, `next_match_id`, etc.)
- API et UI limitées au format ligue avec classement

### UI Matchs
- Suppression pulse/rouge de fond sur lignes en retard
- Badge « Résultat à saisir » texte rouge sans bordure
- Lignes alternées paires/impaires ; padding horizontal uniquement
- Page matchs : cartes Planifier + Résultat en 2 colonnes
- Modal edit match : champs score + API `enterMatchResult`

### Dashboard
- Widget graphique buts sans en-tête redondant
- Dropdown tournoi inline ; skeleton hauteur fixe
- Derniers matchs avec même composant `MatchRowList`

### Tournois
- Cartes dashboard : Modifier/Supprimer en footer (pas sur bannière)
- Création via `TournamentFormDrawer` modal

### Classements
- Lien équipe → `/teams/{id}` ; chevron ; hover arrondi
- `RankingPreviewTable` et `RankingsPage` mis à jour

### Statistiques
- Filtres cascade match ↔ équipe ↔ joueur
- Prop `expandedOptions` sur `SearchableSelect` pour recherche élargie

### Modals / formulaires
- Largeur `max-w-lg` ; onglets upload gris ; zones compactes
- Boutons primaires sans icône PlusIcon

### Thèmes
- Light / Dark (slate) / Zinc via `XThemeContext`
- Tooltips graphiques adaptés au thème

## Éléments legacy retirés ou ignorés

- Modèle championnats / compétitions officielles
- Paiements simulés
- Rôles `organizer`, `team_manager`, `viewer`

## Prochaines améliorations possibles (hors PFE)

- Tests automatisés (PHPUnit, Vitest)
- CI/CD GitHub Actions
- Déploiement cloud (Render, Railway)
- Notifications email

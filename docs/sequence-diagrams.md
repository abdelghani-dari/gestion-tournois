# Diagrammes de Séquence — Gestion Tournois Locaux

## 1. Création et validation d'un tournoi

```mermaid
sequenceDiagram
    actor User
    participant Frontend as React Frontend
    participant Backend as Laravel API
    participant DB as PostgreSQL
    actor Admin

    User->>Frontend: Remplit formulaire tournoi
    Frontend->>Backend: POST /api/tournaments
    Backend->>DB: Créer tournoi approval_status=pending
    DB-->>Backend: Tournoi créé
    Backend-->>Frontend: Réponse 201
    Frontend-->>User: Tournoi en attente de validation

    Admin->>Frontend: Ouvre tournois en attente
    Frontend->>Backend: GET /api/admin/tournaments/pending
    Backend->>DB: Récupérer tournois pending
    DB-->>Backend: Liste des tournois
    Backend-->>Frontend: Liste

    Admin->>Frontend: Accepte le tournoi
    Frontend->>Backend: PUT /api/admin/tournaments/{id}/accept
    Backend->>DB: approval_status=accepted, status=open
    DB-->>Backend: Tournoi mis à jour
    Backend-->>Frontend: Confirmation
    Frontend-->>Admin: Tournoi accepté
```

## 2. Demande de participation d'une équipe

```mermaid
sequenceDiagram
    actor User
    participant Frontend as React Frontend
    participant Backend as Laravel API
    participant DB as PostgreSQL
    actor Creator as Créateur du tournoi

    User->>Frontend: Sélectionne tournoi accepté
    User->>Frontend: Choisit son équipe
    Frontend->>Backend: POST /api/join-requests
    Backend->>DB: Créer demande status=pending
    DB-->>Backend: Demande créée
    Backend-->>Frontend: Réponse 201
    Frontend-->>User: Demande envoyée

    Creator->>Frontend: Consulte demandes reçues
    Frontend->>Backend: GET /api/join-requests?tournament_id=1
    Backend->>DB: Récupérer demandes du tournoi
    DB-->>Backend: Liste demandes
    Backend-->>Frontend: Liste

    Creator->>Frontend: Accepte la demande
    Frontend->>Backend: PUT /api/join-requests/{id}/accept
    Backend->>DB: status=accepted
    Backend->>DB: Ajouter équipe dans tournament_team
    DB-->>Backend: Mise à jour terminée
    Backend-->>Frontend: Confirmation
    Frontend-->>Creator: Équipe acceptée
```

## 3. Saisie du résultat et recalcul du classement

```mermaid
sequenceDiagram
    actor Creator as Créateur du tournoi
    participant Frontend as React Frontend
    participant Backend as Laravel API
    participant DB as PostgreSQL

    Creator->>Frontend: Saisit score du match
    Frontend->>Backend: PUT /api/matches/{id}/result
    Backend->>DB: Mettre à jour scores
    Backend->>DB: status=played, result_status=confirmed
    DB-->>Backend: Résultat enregistré
    Backend->>DB: Récupérer matchs confirmed du tournoi
    DB-->>Backend: Matchs confirmés
    Backend->>Backend: Calcul points, buts, différence
    Backend->>DB: Mettre à jour rankings
    DB-->>Backend: Classement sauvegardé
    Backend-->>Frontend: Résultat + classement mis à jour
    Frontend-->>Creator: Confirmation affichée
```

## 4. Consultation publique d'un tournoi

```mermaid
sequenceDiagram
    actor Visitor as Utilisateur
    participant Frontend as React Frontend
    participant Backend as Laravel API
    participant DB as PostgreSQL

    Visitor->>Frontend: Ouvre liste des tournois
    Frontend->>Backend: GET /api/tournaments
    Backend->>DB: Récupérer approval_status=accepted
    DB-->>Backend: Tournois acceptés
    Backend-->>Frontend: Liste publique
    Frontend-->>Visitor: Affiche tournois

    Visitor->>Frontend: Ouvre détail tournoi
    Frontend->>Backend: GET /api/tournaments/{id}
    Backend->>DB: Récupérer tournoi, équipes, matchs, classement
    DB-->>Backend: Données du tournoi
    Backend-->>Frontend: Détails
    Frontend-->>Visitor: Affiche détails
```

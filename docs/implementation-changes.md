# Changements à Implémenter — Gestion Tournois

## 1. Objectif

Ce document résume les changements techniques à implémenter dans le code Laravel/React pour adapter le projet à la nouvelle orientation.

## 2. Changements base de données

### Modifier users

Ajouter :

```txt
role: admin / organizer / team_manager / viewer
payment_status: unpaid / paid
subscription_plan: free / organizer
```

### Modifier championships

Ajouter :

```txt
created_by
level: international / national / local
source: official / user_created
city
country
```

### Modifier tournaments

Ajouter :

```txt
created_by
level: international / national / local
source: official / user_created
city
country
```

### Modifier teams

Ajouter :

```txt
manager_id
country
```

### Modifier match_games

Ajouter :

```txt
created_by
result_status: pending / confirmed / disputed
```

### Créer fake_payments

```txt
id
user_id
plan
amount
status
paid_at
created_at
updated_at
```

### Créer join_requests

```txt
id
championship_id nullable
tournament_id nullable
team_id
manager_id
status: pending / accepted / refused
message nullable
created_at
updated_at
```

### Créer posts

```txt
id
user_id
championship_id nullable
tournament_id nullable
content
image_path nullable
type: announcement / result / news / general
created_at
updated_at
```

## 3. Ordre recommandé de développement

```txt
1. Migrations database
2. Models + relations
3. Auth / roles middleware
4. Fake payment API
5. Organizer local competitions API
6. Team manager teams API
7. Join requests API
8. Match result validation API
9. Posts/feed API
10. Frontend pages
```

## 4. Règles métier importantes

```txt
Admin:
- peut tout gérer
- gère les compétitions official

Organizer:
- doit avoir payment_status = paid
- gère uniquement les championnats/tournois where created_by = auth user id

Team Manager:
- gère uniquement les teams where manager_id = auth user id
- peut envoyer join request
- peut confirmer ou contester un résultat

Viewer:
- peut consulter seulement
```

## 5. Tests minimum à faire

```txt
php artisan migrate:fresh
php artisan route:list
php -l app/Models/*.php
php -l app/Http/Controllers/Api/*.php
curl GET /api/tournaments
curl POST /api/fake-payments
curl POST /api/join-requests
curl PUT /api/matches/{id}/result
```

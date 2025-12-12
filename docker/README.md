# Docker Configuration SOA

Configuration Docker pour l'orchestration des microservices SOA.

## Services

- **auth-service** : Service d'authentification (Python)
- **student-service** : Service étudiants (Python)
- **course-service** : Service cours (Java SOAP)
- **api-gateway** : Passerelle API (Java Spring)

## Démarrage

```bash
# Construire et démarrer tous les services
docker compose up --build

# Démarrer en arrière-plan
docker compose up -d

# Arrêter les services
docker compose down

# Logs
docker compose logs -f [service-name]
```

## Ports

- API Gateway : 8080
- Auth Service : 8001
- Student Service : 8100
- Course Service : 8200

## Volumes

- `auth-data` : Données auth service
- `student-data` : Données student service

## Réseau

- `soa-net` : Réseau bridge pour la communication inter-services

## Variables d'Environnement

### Auth Service
- `AUTH_DATABASE_URL` : URL base de données
- `AUTH_JWT_SECRET` : Secret JWT
- `AUTH_ACCESS_EXPIRE_MINUTES` : Expiration access token
- `AUTH_REFRESH_EXPIRE_DAYS` : Expiration refresh token

### Student Service
- `STUD_DATABASE_URL` : URL base de données

## Développement

```bash
# Reconstruire un service spécifique
docker compose build auth-service

# Redémarrer un service
docker compose restart auth-service
```

## Production

Pour la production, considérez :
- Utiliser des secrets pour les variables sensibles
- Configurer HTTPS
- Ajouter monitoring et logging
- Utiliser des bases de données externes
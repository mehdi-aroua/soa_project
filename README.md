# SOA Project

Projet SOA (Service-Oriented Architecture) avec microservices pour la gestion d'une université.

## Structure du Projet

- [frontend/](frontend/) - Interface utilisateur React
- [services/](services/) - Microservices backend
- [docker/](docker/) - Configuration Docker
- [mobile-app/](mobile-app/) - Application mobile React Native

## Démarrage Rapide

1. Cloner le repo :
   ```bash
   git clone https://github.com/mehdi-aroua/soa_project.git
   cd soa_project
   ```

2. Démarrer les services :
   ```bash
   ./start-services.sh
   ```

3. Démarrer le frontend :
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

Consultez les READMEs individuels pour plus de détails.

## Technologies

- Backend : Python (FastAPI), Java (JAX-WS)
- Frontend : React, Vite
- Base de données : SQLite
- Orchestration : Docker Compose
- Authentification : JWT

## Sécurité

Voir [analyse de sécurité](SECURITY.md) pour les détails sur les mesures de sécurité implémentées.
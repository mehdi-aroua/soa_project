# Documentation SOA

Documentation complète du projet SOA (Service Oriented Architecture).

## Fichiers

- `ANALYSE_PROJET.md` : Analyse détaillée du projet
- `RAPPORT_PROJET.md` : Rapport final du projet
- `conception-uml.md` : Diagrammes UML de conception

## Architecture

### Microservices

1. **Auth Service** (Python/FastAPI)
   - Gestion des utilisateurs et authentification
   - JWT tokens
   - Rôles : ETUDIANT, ENSEIGNANT, ADMIN

2. **Student Service** (Python/FastAPI)
   - Gestion des étudiants
   - CRUD opérations

3. **Course Service** (Java/JAX-WS)
   - Service SOAP pour les cours
   - Opérations : ajouter, récupérer, lister

4. **API Gateway** (Java/Spring Cloud Gateway)
   - Routage des requêtes
   - Load balancing
   - Sécurité

### Frontend (React/Vite)
- Interface utilisateur
- Authentification JWT
- Gestion des rôles
- Communication REST + SOAP

## Technologies

- **Backend** : Python (FastAPI), Java (Spring, JAX-WS)
- **Frontend** : React, Vite
- **Communication** : REST API, SOAP
- **Authentification** : JWT
- **Base de données** : SQLite
- **Orchestration** : Docker Compose

## Sécurité

- Authentification JWT
- Contrôle d'accès basé sur les rôles
- CORS configuré
- Validation des données

## Déploiement

Voir `docker/README.md` pour les instructions de déploiement.

## Développement

Voir `SETUP_GUIDE.md` pour la configuration de l'environnement de développement.
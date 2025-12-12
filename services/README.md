# Services Backend SOA

Services backend du projet SOA.

## Structure

```
services/
├── api-gateway/          # Passerelle API (Java/Spring)
├── auth-service/         # Service authentification (Python/FastAPI)
├── course-adapter/       # Adaptateur cours (Java)
├── course-service/       # Service cours (Java/SOAP)
└── student-service/      # Service étudiants (Python/FastAPI)
```

## Services

### API Gateway
- **Technologie** : Java Spring Cloud Gateway
- **Port** : 8080
- **Rôle** : Routage, load balancing, sécurité

### Auth Service
- **Technologie** : Python FastAPI
- **Port** : 8001
- **Rôle** : Authentification, gestion utilisateurs
- **Base de données** : SQLite (auth.db)

### Student Service
- **Technologie** : Python FastAPI
- **Port** : 8100
- **Rôle** : Gestion des étudiants
- **Base de données** : SQLite (students.db)

### Course Service
- **Technologie** : Java JAX-WS
- **Port** : 8200
- **Rôle** : Service SOAP pour les cours
- **Opérations** : addCourse, getCourse, getAllCourses

## Démarrage

```bash
# Depuis la racine du projet
cd docker
docker compose up --build
```

## Développement

### Prérequis
- Java 17+
- Python 3.8+
- Maven
- Docker

### Auth Service
```bash
cd services/auth-service
pip install -r requirements.txt
python run.py
```

### Student Service
```bash
cd services/student-service
pip install -r requirements.txt
python run.py
```

### Course Service
```bash
cd services/course-service
# Générer les classes JAX-WS si nécessaire
# Démarrer avec le script ou Docker
```

### API Gateway
```bash
cd services/api-gateway
mvn spring-boot:run
```

## API Documentation

### Auth Service
- `POST /auth/login` : Connexion
- `POST /auth/register` : Inscription
- `GET /users/me` : Profil utilisateur

### Student Service
- `GET /students` : Liste étudiants
- `POST /students` : Créer étudiant
- `GET /students/{id}` : Détails étudiant
- `PUT /students/{id}` : Modifier étudiant
- `DELETE /students/{id}` : Supprimer étudiant

### Course Service (SOAP)
- `addCourse` : Ajouter un cours
- `getCourse` : Récupérer un cours
- `getAllCourses` : Liste des cours

## Tests

Utiliser Postman avec la collection `api-gateway/postman-collection.json`.

## Base de données

Chaque service utilise sa propre base SQLite :
- `auth-service/auth.db`
- `student-service/students.db`

Les schémas sont créés automatiquement au démarrage.
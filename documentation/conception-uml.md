# 📐 Conception UML - Système de Gestion Universitaire SOA

**Projet** : Architecture SOA - Gestion Universitaire  
**Date** : 09/12/2025  
**Version** : 1.0

---

## 📋 Table des Matières
CODE ISO: GSA-FR-04-00                                                                                 Semestre II : 2024 -2025

1. [Diagramme de Composants](#1-diagramme-de-composants)
2. [Diagrammes de Classes](#2-diagrammes-de-classes)
3. [Diagrammes de Séquence](#3-diagrammes-de-séquence)
4. [Diagramme de Déploiement](#4-diagramme-de-déploiement)
5. [Diagramme de Cas d'Utilisation](#5-diagramme-de-cas-dutilisation)

---

## 1. Diagramme de Composants

### Architecture SOA Globale

```mermaid
graph TB
    subgraph "Client Layer"
        CLIENT[Client Applications<br/>Web/Mobile/Postman]
    end
    
    subgraph "API Gateway Layer"
        GATEWAY[API Gateway<br/>Spring Cloud Gateway<br/>Port 8080]
    end
    
    subgraph "Service Layer"
        AUTH[Auth Service<br/>FastAPI/REST<br/>Port 8000]
        STUDENT[Student Service<br/>FastAPI/REST<br/>Port 8100]
        COURSE[Course Service<br/>JAX-WS/SOAP<br/>Port 8200]
        GRADE[Grade Service<br/>FastAPI/REST<br/>Port 8300<br/>🔴 À développer]
        BILLING[Billing Service<br/>SOAP/Java<br/>Port 8400<br/>🔴 À développer]
    end
    
    subgraph "Data Layer"
        DB_AUTH[(auth.db<br/>SQLite)]
        DB_STUDENT[(students.db<br/>SQLite)]
        DB_COURSE[(courses.db<br/>SQLite)]
        DB_GRADE[(grades.db<br/>SQLite<br/>🔴 À créer)]
        DB_BILLING[(billing.db<br/>SQLite<br/>🔴 À créer)]
    end
    
    CLIENT -->|HTTP/HTTPS| GATEWAY
    
    GATEWAY -->|REST| AUTH
    GATEWAY -->|REST| STUDENT
    GATEWAY -->|SOAP| COURSE
    GATEWAY -.->|REST| GRADE
    GATEWAY -.->|SOAP| BILLING
    
    AUTH --> DB_AUTH
    STUDENT --> DB_STUDENT
    COURSE --> DB_COURSE
    GRADE -.-> DB_GRADE
    BILLING -.-> DB_BILLING
    
    style GRADE fill:#ffcccc
    style BILLING fill:#ffcccc
    style DB_GRADE fill:#ffcccc
    style DB_BILLING fill:#ffcccc
```

### Légende
- ✅ **Ligne continue** : Composant implémenté
- 🔴 **Ligne pointillée** : Composant à développer

---

## 2. Diagrammes de Classes

### 2.1 Service Authentification (auth-service)

```mermaid
classDiagram
    class User {
        +int id
        +string username
        +string email
        +string hashed_password
        +string role
        +datetime created_at
        +datetime updated_at
        +bool is_active
    }
    
    class Token {
        +string access_token
        +string refresh_token
        +string token_type
        +int expires_in
    }
    
    class UserCreate {
        +string username
        +string email
        +string password
        +string role
    }
    
    class UserLogin {
        +string username
        +string password
    }
    
    class AuthService {
        +create_user(user: UserCreate) User
        +authenticate_user(credentials: UserLogin) Token
        +get_current_user(token: string) User
        +refresh_token(refresh_token: string) Token
        +update_user(id: int, user: UserUpdate) User
        +delete_user(id: int) bool
    }
    
    class JWTHandler {
        +create_access_token(data: dict) string
        +create_refresh_token(data: dict) string
        +verify_token(token: string) dict
        +decode_token(token: string) dict
    }
    
    class PasswordHandler {
        +hash_password(password: string) string
        +verify_password(plain: string, hashed: string) bool
    }
    
    AuthService --> User
    AuthService --> Token
    AuthService --> JWTHandler
    AuthService --> PasswordHandler
    UserCreate --> User
    UserLogin --> Token
```

### 2.2 Service Étudiants (student-service)

```mermaid
classDiagram
    class Student {
        +int id
        +string matricule
        +string nom
        +string prenom
        +string email
        +string telephone
        +date date_naissance
        +string filiere
        +int niveau
        +datetime created_at
        +datetime updated_at
    }
    
    class StudentCreate {
        +string matricule
        +string nom
        +string prenom
        +string email
        +string telephone
        +date date_naissance
        +string filiere
        +int niveau
    }
    
    class StudentUpdate {
        +string nom
        +string prenom
        +string email
        +string telephone
        +string filiere
        +int niveau
    }
    
    class StudentService {
        +create_student(student: StudentCreate) Student
        +get_student(id: int) Student
        +get_student_by_matricule(matricule: string) Student
        +get_all_students() List~Student~
        +get_students_by_filiere(filiere: string) List~Student~
        +update_student(id: int, student: StudentUpdate) Student
        +delete_student(id: int) bool
    }
    
    class StudentRepository {
        +save(student: Student) Student
        +find_by_id(id: int) Student
        +find_by_matricule(matricule: string) Student
        +find_all() List~Student~
        +update(student: Student) Student
        +delete(id: int) bool
    }
    
    StudentService --> Student
    StudentService --> StudentRepository
    StudentCreate --> Student
    StudentUpdate --> Student
    StudentRepository --> Student
```

### 2.3 Service Cours (course-service)

```mermaid
classDiagram
    class Course {
        +Long id
        +String code
        +String nom
        +String description
        +int credits
        +int heures
        +String filiere
        +int niveau
        +Date createdAt
        +Date updatedAt
    }
    
    class Enrollment {
        +Long id
        +Long studentId
        +Long courseId
        +Date enrollmentDate
        +String status
        +Double grade
    }
    
    class Schedule {
        +Long id
        +Long courseId
        +String dayOfWeek
        +String startTime
        +String endTime
        +String room
        +String professor
    }
    
    class CourseService {
        +createCourse(course: Course) Course
        +getCourse(id: Long) Course
        +getAllCourses() List~Course~
        +getCoursesByFiliere(filiere: String) List~Course~
        +updateCourse(id: Long, course: Course) Course
        +deleteCourse(id: Long) boolean
        +enrollStudent(studentId: Long, courseId: Long) Enrollment
        +getEnrollmentsByStudent(studentId: Long) List~Enrollment~
        +getEnrollmentsByCourse(courseId: Long) List~Enrollment~
        +createSchedule(schedule: Schedule) Schedule
        +getSchedulesByCourse(courseId: Long) List~Schedule~
        +checkScheduleConflict(schedule: Schedule) boolean
    }
    
    class CourseRepository {
        +save(course: Course) Course
        +findById(id: Long) Course
        +findAll() List~Course~
        +update(course: Course) Course
        +delete(id: Long) boolean
    }
    
    class EnrollmentRepository {
        +save(enrollment: Enrollment) Enrollment
        +findByStudentId(studentId: Long) List~Enrollment~
        +findByCourseId(courseId: Long) List~Enrollment~
    }
    
    class ScheduleRepository {
        +save(schedule: Schedule) Schedule
        +findByCourseId(courseId: Long) List~Schedule~
        +checkConflict(schedule: Schedule) boolean
    }
    
    CourseService --> Course
    CourseService --> Enrollment
    CourseService --> Schedule
    CourseService --> CourseRepository
    CourseService --> EnrollmentRepository
    CourseService --> ScheduleRepository
    
    Enrollment --> Course
    Schedule --> Course
```

### 2.4 Service Notes (grade-service) - À Développer

```mermaid
classDiagram
    class Grade {
        +int id
        +int student_id
        +int course_id
        +float note
        +float coefficient
        +string type
        +date date_evaluation
        +string semestre
        +datetime created_at
    }
    
    class GradeCreate {
        +int student_id
        +int course_id
        +float note
        +float coefficient
        +string type
        +date date_evaluation
        +string semestre
    }
    
    class StudentAverage {
        +int student_id
        +string student_name
        +float moyenne_generale
        +float moyenne_semestre
        +string mention
        +List~CourseGrade~ details
    }
    
    class CourseGrade {
        +int course_id
        +string course_name
        +float moyenne
        +int credits
    }
    
    class GradeService {
        +create_grade(grade: GradeCreate) Grade
        +get_grade(id: int) Grade
        +get_grades_by_student(student_id: int) List~Grade~
        +get_grades_by_course(course_id: int) List~Grade~
        +calculate_student_average(student_id: int) StudentAverage
        +calculate_course_average(course_id: int) float
        +get_transcript(student_id: int, semestre: string) StudentAverage
        +update_grade(id: int, note: float) Grade
        +delete_grade(id: int) bool
    }
    
    GradeService --> Grade
    GradeService --> StudentAverage
    GradeService --> CourseGrade
    GradeCreate --> Grade
    StudentAverage --> CourseGrade
```

### 2.5 Service Facturation (billing-service) - À Développer

```mermaid
classDiagram
    class Invoice {
        +Long id
        +Long studentId
        +Double montant
        +Date dateEmission
        +Date dateEcheance
        +String statut
        +String type
        +String semestre
        +Date createdAt
    }
    
    class Payment {
        +Long id
        +Long invoiceId
        +Double montant
        +Date datePaiement
        +String methodePaiement
        +String reference
        +String statut
    }
    
    class FeeStructure {
        +Long id
        +String filiere
        +int niveau
        +Double fraisInscription
        +Double fraisScolarite
        +Double fraisBibliotheque
        +Double autresFrais
    }
    
    class BillingService {
        +generateInvoice(studentId: Long, type: String) Invoice
        +getInvoice(id: Long) Invoice
        +getInvoicesByStudent(studentId: Long) List~Invoice~
        +processPayment(payment: Payment) Payment
        +getPaymentHistory(studentId: Long) List~Payment~
        +calculateFees(filiere: String, niveau: int) Double
        +updateInvoiceStatus(id: Long, statut: String) Invoice
        +sendPaymentReminder(studentId: Long) boolean
    }
    
    BillingService --> Invoice
    BillingService --> Payment
    BillingService --> FeeStructure
    Payment --> Invoice
```

---

## 3. Diagrammes de Séquence

### 3.1 Authentification et Accès Sécurisé

```mermaid
sequenceDiagram
    actor User
    participant Client
    participant Gateway as API Gateway
    participant Auth as Auth Service
    participant DB as auth.db
    
    User->>Client: Entrer credentials
    Client->>Gateway: POST /auth/login
    Gateway->>Auth: POST /login
    Auth->>DB: Vérifier utilisateur
    DB-->>Auth: User data
    Auth->>Auth: Vérifier password
    Auth->>Auth: Générer JWT tokens
    Auth-->>Gateway: {access_token, refresh_token}
    Gateway-->>Client: Tokens
    Client-->>User: Connexion réussie
    
    Note over Client,Auth: Requête authentifiée
    
    User->>Client: Demander données
    Client->>Gateway: GET /students (+ JWT)
    Gateway->>Auth: Valider token
    Auth-->>Gateway: Token valide
    Gateway->>Gateway: Router vers service
    Gateway-->>Client: Données
```

### 3.2 Inscription d'un Étudiant à un Cours

```mermaid
sequenceDiagram
    actor Admin
    participant Client
    participant Gateway as API Gateway
    participant Student as Student Service
    participant Course as Course Service
    participant DB_S as students.db
    participant DB_C as courses.db
    
    Admin->>Client: Inscrire étudiant au cours
    Client->>Gateway: POST /enroll
    Gateway->>Student: GET /students/{id}
    Student->>DB_S: Récupérer étudiant
    DB_S-->>Student: Student data
    Student-->>Gateway: Student info
    
    Gateway->>Course: enrollStudent(studentId, courseId)
    Course->>DB_C: Vérifier cours existe
    DB_C-->>Course: Course data
    Course->>DB_C: Vérifier conflits horaires
    DB_C-->>Course: Pas de conflit
    Course->>DB_C: Créer enrollment
    DB_C-->>Course: Enrollment créé
    Course-->>Gateway: Enrollment success
    Gateway-->>Client: Confirmation
    Client-->>Admin: Inscription confirmée
```

### 3.3 Calcul de Moyenne (avec Service Notes)

```mermaid
sequenceDiagram
    actor Student
    participant Client
    participant Gateway as API Gateway
    participant Grade as Grade Service
    participant Course as Course Service
    participant DB_G as grades.db
    participant DB_C as courses.db
    
    Student->>Client: Consulter relevé de notes
    Client->>Gateway: GET /grades/transcript/{studentId}
    Gateway->>Grade: getTranscript(studentId)
    Grade->>DB_G: Récupérer toutes les notes
    DB_G-->>Grade: List~Grade~
    
    loop Pour chaque cours
        Grade->>Course: getCourse(courseId)
        Course->>DB_C: Récupérer info cours
        DB_C-->>Course: Course data (credits)
        Course-->>Grade: Course info
        Grade->>Grade: Calculer moyenne cours
    end
    
    Grade->>Grade: Calculer moyenne générale
    Grade->>Grade: Déterminer mention
    Grade-->>Gateway: StudentAverage
    Gateway-->>Client: Relevé de notes
    Client-->>Student: Afficher relevé
```

### 3.4 Génération et Paiement de Facture

```mermaid
sequenceDiagram
    actor Student
    participant Client
    participant Gateway as API Gateway
    participant Billing as Billing Service
    participant StudentSvc as Student Service
    participant DB_B as billing.db
    participant DB_S as students.db
    
    Student->>Client: Demander facture
    Client->>Gateway: POST /billing/generate/{studentId}
    Gateway->>Billing: generateInvoice(studentId)
    Billing->>StudentSvc: getStudent(studentId)
    StudentSvc->>DB_S: Récupérer étudiant
    DB_S-->>StudentSvc: Student data (filière, niveau)
    StudentSvc-->>Billing: Student info
    
    Billing->>Billing: calculateFees(filière, niveau)
    Billing->>DB_B: Créer facture
    DB_B-->>Billing: Invoice créée
    Billing-->>Gateway: Invoice
    Gateway-->>Client: Facture générée
    Client-->>Student: Afficher facture
    
    Note over Student,DB_B: Processus de paiement
    
    Student->>Client: Effectuer paiement
    Client->>Gateway: POST /billing/pay
    Gateway->>Billing: processPayment(payment)
    Billing->>DB_B: Enregistrer paiement
    Billing->>DB_B: Mettre à jour statut facture
    DB_B-->>Billing: Paiement confirmé
    Billing-->>Gateway: Payment success
    Gateway-->>Client: Confirmation
    Client-->>Student: Reçu de paiement
```

---

## 4. Diagramme de Déploiement

### Architecture Docker

```mermaid
graph TB
    subgraph "Docker Host"
        subgraph "Network: soa-net (bridge)"
            
            subgraph "Container: api-gateway"
                GW[Spring Boot App<br/>Port 8080]
            end
            
            subgraph "Container: auth-service"
                AUTH[FastAPI App<br/>Port 8000]
                AUTH_DB[(auth.db)]
                AUTH --> AUTH_DB
            end
            
            subgraph "Container: student-service"
                STUDENT[FastAPI App<br/>Port 8100]
                STUDENT_DB[(students.db)]
                STUDENT --> STUDENT_DB
            end
            
            subgraph "Container: course-service"
                COURSE[JAX-WS App<br/>Port 8200]
                COURSE_DB[(courses.db)]
                COURSE --> COURSE_DB
            end
            
            subgraph "Container: grade-service 🔴"
                GRADE[FastAPI App<br/>Port 8300]
                GRADE_DB[(grades.db)]
                GRADE -.-> GRADE_DB
            end
            
            subgraph "Container: billing-service 🔴"
                BILLING[SOAP App<br/>Port 8400]
                BILLING_DB[(billing.db)]
                BILLING -.-> BILLING_DB
            end
            
            GW -->|REST| AUTH
            GW -->|REST| STUDENT
            GW -->|SOAP| COURSE
            GW -.->|REST| GRADE
            GW -.->|SOAP| BILLING
        end
    end
    
    EXTERNAL[External Clients<br/>Postman/Web/Mobile] -->|HTTP :8080| GW
    
    style GRADE fill:#ffcccc
    style BILLING fill:#ffcccc
    style GRADE_DB fill:#ffcccc
    style BILLING_DB fill:#ffcccc
```

### Configuration Docker Compose

| Service | Image | Port Mapping | Volumes | Dépendances |
|---------|-------|--------------|---------|-------------|
| **api-gateway** | Custom (Spring Boot) | 8080:8080 | - | auth, student, course |
| **auth-service** | Custom (Python:3.11) | 8000:8000 | ./auth.db | - |
| **student-service** | Custom (Python:3.11) | 8100:8100 | ./students.db | - |
| **course-service** | Custom (OpenJDK:17) | 8200:8200 | ./courses.db | - |
| **grade-service** 🔴 | Custom (Python:3.11) | 8300:8300 | ./grades.db | - |
| **billing-service** 🔴 | Custom (OpenJDK:17) | 8400:8400 | ./billing.db | - |

---

## 5. Diagramme de Cas d'Utilisation

```mermaid
graph LR
    subgraph "Acteurs"
        ADMIN[👤 Administrateur]
        PROF[👨‍🏫 Professeur]
        ETUD[👨‍🎓 Étudiant]
        GUEST[👤 Visiteur]
    end
    
    subgraph "Système de Gestion Universitaire"
        subgraph "Authentification"
            UC1[S'inscrire]
            UC2[Se connecter]
            UC3[Se déconnecter]
        end
        
        subgraph "Gestion Étudiants"
            UC4[Créer étudiant]
            UC5[Modifier étudiant]
            UC6[Consulter profil]
            UC7[Supprimer étudiant]
        end
        
        subgraph "Gestion Cours"
            UC8[Créer cours]
            UC9[Inscrire à un cours]
            UC10[Consulter cours]
            UC11[Gérer horaires]
        end
        
        subgraph "Gestion Notes"
            UC12[Saisir notes]
            UC13[Consulter notes]
            UC14[Calculer moyennes]
            UC15[Générer relevé]
        end
        
        subgraph "Gestion Facturation"
            UC16[Générer facture]
            UC17[Consulter factures]
            UC18[Effectuer paiement]
            UC19[Historique paiements]
        end
    end
    
    GUEST --> UC1
    GUEST --> UC2
    
    ADMIN --> UC2
    ADMIN --> UC3
    ADMIN --> UC4
    ADMIN --> UC5
    ADMIN --> UC7
    ADMIN --> UC8
    ADMIN --> UC9
    ADMIN --> UC11
    ADMIN --> UC16
    
    PROF --> UC2
    PROF --> UC3
    PROF --> UC10
    PROF --> UC12
    PROF --> UC13
    PROF --> UC14
    
    ETUD --> UC2
    ETUD --> UC3
    ETUD --> UC6
    ETUD --> UC9
    ETUD --> UC10
    ETUD --> UC13
    ETUD --> UC15
    ETUD --> UC17
    ETUD --> UC18
    ETUD --> UC19
    
    style UC12 fill:#ffcccc
    style UC13 fill:#ffcccc
    style UC14 fill:#ffcccc
    style UC15 fill:#ffcccc
    style UC16 fill:#ffcccc
    style UC17 fill:#ffcccc
    style UC18 fill:#ffcccc
    style UC19 fill:#ffcccc
```

### Description des Cas d'Utilisation

#### Authentification
- **UC1 - S'inscrire** : Créer un compte utilisateur
- **UC2 - Se connecter** : Authentification avec JWT
- **UC3 - Se déconnecter** : Invalider le token

#### Gestion Étudiants
- **UC4 - Créer étudiant** : Ajouter un nouvel étudiant
- **UC5 - Modifier étudiant** : Mettre à jour les informations
- **UC6 - Consulter profil** : Voir ses informations personnelles
- **UC7 - Supprimer étudiant** : Retirer un étudiant du système

#### Gestion Cours
- **UC8 - Créer cours** : Ajouter un nouveau cours
- **UC9 - Inscrire à un cours** : Inscription étudiant/cours
- **UC10 - Consulter cours** : Voir les cours disponibles
- **UC11 - Gérer horaires** : Planifier les séances

#### Gestion Notes 🔴
- **UC12 - Saisir notes** : Enregistrer les notes des étudiants
- **UC13 - Consulter notes** : Voir ses notes
- **UC14 - Calculer moyennes** : Calcul automatique des moyennes
- **UC15 - Générer relevé** : Créer un relevé de notes

#### Gestion Facturation 🔴
- **UC16 - Générer facture** : Créer une facture pour un étudiant
- **UC17 - Consulter factures** : Voir ses factures
- **UC18 - Effectuer paiement** : Payer une facture
- **UC19 - Historique paiements** : Consulter l'historique

---

## 📊 Matrice de Traçabilité

| Cas d'Utilisation | Service(s) Impliqué(s) | Statut |
|-------------------|------------------------|--------|
| UC1-UC3 | Auth Service | ✅ Implémenté |
| UC4-UC7 | Student Service | ✅ Implémenté |
| UC8-UC11 | Course Service | ✅ Implémenté |
| UC12-UC15 | Grade Service + Course + Student | 🔴 À développer |
| UC16-UC19 | Billing Service + Student | 🔴 À développer |

---

## 🔗 Interactions entre Services

```mermaid
graph LR
    AUTH[Auth Service]
    STUDENT[Student Service]
    COURSE[Course Service]
    GRADE[Grade Service]
    BILLING[Billing Service]
    
    COURSE -->|Vérifier étudiant| STUDENT
    GRADE -->|Info étudiant| STUDENT
    GRADE -->|Info cours| COURSE
    BILLING -->|Info étudiant| STUDENT
    BILLING -->|Cours inscrits| COURSE
    
    AUTH -.->|Valider token| STUDENT
    AUTH -.->|Valider token| COURSE
    AUTH -.->|Valider token| GRADE
    AUTH -.->|Valider token| BILLING
    
    style GRADE fill:#ffcccc
    style BILLING fill:#ffcccc
```

---

## 📝 Notes de Conception

### Principes Architecturaux

1. **Séparation des Responsabilités**
   - Chaque service gère un domaine métier spécifique
   - Base de données dédiée par service (Database per Service pattern)

2. **Communication**
   - REST pour les services Python (FastAPI)
   - SOAP pour les services Java (JAX-WS)
   - API Gateway comme point d'entrée unique

3. **Sécurité**
   - Authentification centralisée (Auth Service)
   - JWT pour la gestion des sessions
   - Validation des tokens à chaque requête

4. **Scalabilité**
   - Services indépendants et déployables séparément
   - Conteneurisation Docker
   - Network bridge pour l'isolation

### Technologies par Service

| Service | Langage | Framework | Base de Données | Protocole |
|---------|---------|-----------|-----------------|-----------|
| Auth | Python 3.11 | FastAPI | SQLite | REST |
| Student | Python 3.11 | FastAPI | SQLite | REST |
| Course | Java 17 | JAX-WS | SQLite | SOAP |
| Grade 🔴 | Python 3.11 | FastAPI | SQLite | REST |
| Billing 🔴 | Java 17 | JAX-WS | SQLite | SOAP |
| Gateway | Java 17 | Spring Cloud | - | HTTP |

---

## 🎯 Prochaines Étapes

1. ✅ **Conception UML** - Terminée
2. 🔴 **Développer Grade Service** - Priorité 1
3. 🔴 **Développer Billing Service** - Priorité 2
4. 🔴 **Compléter la documentation** - En cours
5. 🔴 **Tests d'intégration** - À planifier

---

**Document créé par** : Antigravity AI  
**Dernière mise à jour** : 09/12/2025

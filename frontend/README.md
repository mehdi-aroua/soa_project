# 🎓 Frontend - Système de Gestion Universitaire SOA

Interface React.js moderne pour le système de gestion universitaire basé sur une architecture SOA.

## 🚀 Technologies Utilisées

- **React 18** - Framework UI
- **Vite** - Build tool et dev server
- **React Router** - Navigation
- **Axios** - Client HTTP
- **Context API** - Gestion d'état
- **Vanilla CSS** - Styling premium

## 📋 Fonctionnalités

### Authentification
- ✅ Inscription des utilisateurs
- ✅ Connexion avec JWT
- ✅ Gestion des tokens (access & refresh)
- ✅ Déconnexion
- ✅ Routes protégées

### Gestion des Étudiants
- ✅ Liste des étudiants avec pagination
- ✅ Recherche par nom, prénom, matricule
- ✅ Création d'étudiant
- ✅ Modification d'étudiant
- ✅ Suppression d'étudiant (soft delete)
- ✅ Filtres par filière et niveau

### Gestion des Cours
- ✅ Liste des cours
- ✅ Affichage détaillé des cours
- ✅ Suppression de cours
- ✅ Intégration avec le service SOAP

### Gestion des Utilisateurs
- ✅ Liste des utilisateurs
- ✅ Affichage des rôles
- ✅ Badges de rôles colorés

### Dashboard
- ✅ Statistiques (étudiants, cours, utilisateurs)
- ✅ Actions rapides
- ✅ Vue d'ensemble

## 🎨 Design

L'interface utilise un design moderne et premium avec :
- **Dark mode** par défaut
- **Gradients** et effets glassmorphism
- **Animations** fluides et micro-interactions
- **Responsive design** pour tous les écrans
- **Palette de couleurs** harmonieuse
- **Typographie** moderne (Inter font)

## 🔧 Installation

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Build pour la production
npm run build
```

## 🌐 Configuration

L'application se connecte à l'API Gateway sur `http://localhost:8080`.

Pour modifier l'URL de l'API, éditez le fichier `src/services/api.js` :

```javascript
const api = axios.create({
  baseURL: 'http://localhost:8080',
  // ...
});
```

## 📁 Structure du Projet

```
frontend/
├── src/
│   ├── components/
│   │   ├── Auth/           # Composants d'authentification
│   │   ├── Common/         # Composants réutilisables
│   │   ├── Courses/        # Gestion des cours
│   │   ├── Layout/         # Layout et navigation
│   │   ├── Students/       # Gestion des étudiants
│   │   └── Users/          # Gestion des utilisateurs
│   ├── context/            # Context API (Auth)
│   ├── services/           # Services API
│   │   ├── api.js          # Configuration Axios
│   │   ├── authService.js  # Service d'authentification
│   │   ├── studentService.js # Service étudiants
│   │   └── courseService.js  # Service cours
│   ├── App.jsx             # Composant principal
│   ├── main.jsx            # Point d'entrée
│   └── index.css           # Styles globaux
├── index.html
├── vite.config.js
└── package.json
```

## 🔐 Authentification

L'application utilise JWT pour l'authentification :

1. **Login** : L'utilisateur se connecte avec email/password
2. **Tokens** : Réception d'un access_token et refresh_token
3. **Storage** : Les tokens sont stockés dans localStorage
4. **Interceptors** : Axios ajoute automatiquement le token aux requêtes
5. **Refresh** : Le token est automatiquement rafraîchi en cas d'expiration
6. **Logout** : Les tokens sont supprimés et l'utilisateur est redirigé

## 🎯 Utilisation

### 1. Démarrer les services backend

Assurez-vous que tous les services backend sont démarrés :

```bash
# Depuis le répertoire racine du projet
./start-services.sh
```

### 2. Démarrer le frontend

```bash
cd frontend
npm run dev
```

### 3. Accéder à l'application

Ouvrez votre navigateur à l'adresse : `http://localhost:3000`

### 4. Se connecter

- Créez un compte via la page d'inscription
- Ou utilisez un compte existant

## 📱 Pages Disponibles

- `/login` - Page de connexion
- `/register` - Page d'inscription
- `/dashboard` - Tableau de bord (protégé)
- `/students` - Gestion des étudiants (protégé)
- `/courses` - Gestion des cours (protégé)
- `/users` - Gestion des utilisateurs (protégé)

## 🎨 Personnalisation

### Couleurs

Les couleurs sont définies dans `src/index.css` via des variables CSS :

```css
:root {
  --primary: #6366f1;
  --secondary: #ec4899;
  --accent: #14b8a6;
  /* ... */
}
```

### Thème

Pour passer en mode clair, modifiez les variables de couleur de fond dans `index.css`.

## 🐛 Débogage

### Problèmes de connexion à l'API

1. Vérifiez que l'API Gateway est démarré sur le port 8080
2. Vérifiez la configuration CORS sur le gateway
3. Consultez la console du navigateur pour les erreurs

### Problèmes d'authentification

1. Vérifiez que le service auth est démarré
2. Effacez le localStorage : `localStorage.clear()`
3. Reconnectez-vous

## 📝 Notes

- L'application utilise le proxy Vite pour éviter les problèmes CORS en développement
- Les tokens JWT sont stockés dans localStorage (considérez httpOnly cookies pour la production)
- Le refresh automatique des tokens est implémenté dans les interceptors Axios

## 🚀 Prochaines Étapes

- [ ] Ajouter la gestion des notes
- [ ] Ajouter la gestion de la facturation
- [ ] Implémenter les inscriptions aux cours
- [ ] Ajouter la gestion des horaires
- [ ] Améliorer la gestion des erreurs
- [ ] Ajouter des tests unitaires
- [ ] Optimiser les performances

## 📄 Licence

Ce projet est développé dans le cadre d'un projet universitaire SOA.

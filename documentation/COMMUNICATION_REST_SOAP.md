# 📚 Architecture SOA vs Microservices

## 🆚 Différences Fondamentales

| Critère | SOA | Microservices |
|---------|-----|---------------|
| **Granularité** | Services métier (gros grains) | Services très fins (micro) |
| **Communication** | ESB centralisé | Communication directe (peer-to-peer) |
| **Protocoles** | Multi-protocoles (REST, SOAP, JMS) | Principalement REST/gRPC |
| **Couplage** | Couplage modéré via ESB | Couplage faible, services indépendants |
| **Base de données** | Souvent partagée | Une BD par service (Database per Service) |
| **Déploiement** | Souvent monolithique ou par groupe | Déploiement indépendant par service |
| **Gouvernance** | Centralisée | Décentralisée |
| **Réutilisation** | Priorité à la réutilisation | Priorité à l'indépendance |

---

## 📊 Schéma Comparatif

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        ARCHITECTURE SOA                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│                    ┌─────────────────────────┐                          │
│                    │    ESB (Bus Central)    │                          │
│                    │   Routage + Médiation   │                          │
│                    └───────────┬─────────────┘                          │
│              ┌─────────────────┼─────────────────┐                      │
│              │                 │                 │                      │
│        ┌─────▼─────┐     ┌─────▼─────┐    ┌─────▼─────┐                 │
│        │  Service  │     │  Service  │    │  Service  │                 │
│        │   SOAP    │     │   REST    │    │   JMS     │                 │
│        └───────────┘     └───────────┘    └───────────┘                 │
│                                                                         │
│   ✅ Multi-protocoles   ✅ Médiation centralisée   ✅ Réutilisation     │
└─────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                     ARCHITECTURE MICROSERVICES                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌───────────┐     ┌───────────┐     ┌───────────┐     ┌───────────┐   │
│   │  Service  │◄───►│  Service  │◄───►│  Service  │◄───►│  Service  │   │
│   │    Auth   │     │   Users   │     │  Orders   │     │ Payments  │   │
│   └─────┬─────┘     └─────┬─────┘     └─────┬─────┘     └─────┬─────┘   │
│         │                 │                 │                 │         │
│      ┌──▼──┐           ┌──▼──┐           ┌──▼──┐           ┌──▼──┐      │
│      │ DB  │           │ DB  │           │ DB  │           │ DB  │      │
│      └─────┘           └─────┘           └─────┘           └─────┘      │
│                                                                         │
│   ✅ BD par service   ✅ Communication directe   ✅ Déploiement isolé   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Ce Projet Utilise : **Architecture SOA**

### Pourquoi ce projet est SOA et non Microservices :

| Caractéristique | Dans ce Projet | Type |
|-----------------|----------------|------|
| **Protocoles utilisés** | REST + **SOAP** | ✅ SOA |
| **Gateway centralisé** | Spring Cloud Gateway (ESB-like) | ✅ SOA |
| **Granularité** | Services fonctionnels (Auth, Students, Courses) | ✅ SOA |
| **Interopérabilité** | REST ↔ SOAP explicite | ✅ SOA |
| **Base de données** | Séparées par service | ⚠️ Microservices |

> **Conclusion** : Ce projet est principalement **SOA** avec quelques pratiques modernes inspirées des microservices.

---

---

# 🔄 Communication REST ↔ SOAP dans le Projet SOA

## Architecture de la Communication

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         FLUX DE COMMUNICATION                            │
│                                                                          │
│  ┌─────────────┐      ┌─────────────────┐      ┌─────────────────┐       │
│  │   FRONTEND  │      │   API GATEWAY   │      │ COURSE SERVICE  │       │
│  │   (React)   │      │ (Spring Cloud)  │      │   (Java SOAP)   │       │
│  │             │      │                 │      │                 │       │
│  │  JavaScript │──────│    Port 8080    │──────│    Port 8200    │       │
│  │  soapClient │      │                 │      │                 │       │
│  └─────────────┘      └─────────────────┘      └─────────────────┘       │
│        │                      │                        │                 │
│        │                      │                        │                 │
│    ┌───▼───┐              ┌───▼───┐               ┌────▼────┐            │
│    │ JSON  │   Construit  │ Proxy │    Reçoit     │  SOAP   │            │
│    │ Data  │──────────────│ HTTP  │───────────────│  XML    │            │
│    │       │    SOAP/XML  │       │    SOAP/XML   │ Service │            │
│    └───────┘              └───────┘               └─────────┘            │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 📍 Fichier Clé : `soapCourseService.js`

**Localisation** : `/frontend/src/services/soapCourseService.js`

Ce fichier fait le "pont" REST → SOAP en 3 étapes :

---

### **Étape 1 : Construction de l'enveloppe SOAP (XML)**

```javascript
// Ligne 12-30 : Crée un message SOAP/XML à partir de données JavaScript
const createSoapEnvelope = (method, params = {}) => {
    let paramsXml = '';
    for (const [key, value] of Object.entries(params)) {
        paramsXml += `<${key}>${value}</${key}>`;
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
                  xmlns:cour="http://course.university.com/">
   <soapenv:Header/>
   <soapenv:Body>
      <cour:${method}>
         ${paramsXml}
      </cour:${method}>
   </soapenv:Body>
</soapenv:Envelope>`;
};
```

---

### **Étape 2 : Envoi de la requête SOAP via HTTP**

```javascript
// Ligne 35-53 : Envoie le XML au service SOAP
const soapRequest = async (method, params = {}) => {
    const envelope = createSoapEnvelope(method, params);

    const response = await fetch(SOAP_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/xml; charset=utf-8',  // ← Indique XML
            'SOAPAction': '',                            // ← Header SOAP
        },
        body: envelope,  // ← Corps XML SOAP
    });

    const xmlText = await response.text();
    return parseXmlResponse(xmlText, method);  // ← Parse la réponse XML
};
```

---

### **Étape 3 : Parsing de la réponse XML → JavaScript Object**

```javascript
// Ligne 86-110 : Convertit XML en objet JavaScript
const extractReturnData = (element) => {
    const returnElements = element.getElementsByTagName('return');
    // ... parse les éléments XML et retourne un objet JS
};

// Ligne 115-143 : Parse un cours XML en objet
const parseCourseElement = (element) => {
    const course = {};
    const fields = ['id', 'code', 'name', 'description', 'credits', ...];
    
    for (const field of fields) {
        const fieldEl = element.getElementsByTagName(field)[0];
        course[field] = fieldEl.textContent;
    }
    return course;  // ← Retourne un objet JavaScript
};
```

---

## 🎯 Résumé de la Communication

| Étape | Côté | Format | Description |
|-------|------|--------|-------------|
| 1 | Frontend | **JavaScript Object** | `{ id: 1, code: "CS101" }` |
| 2 | soapCourseService.js | **Construit XML** | Transforme JS → SOAP/XML |
| 3 | Réseau | **SOAP/XML** | Envoyé via HTTP POST |
| 4 | course-service | **Reçoit XML** | Service Java JAX-WS traite le SOAP |
| 5 | course-service | **Répond XML** | Retourne une réponse SOAP/XML |
| 6 | soapCourseService.js | **Parse XML** | Transforme XML → JS Object |
| 7 | Frontend | **JavaScript Object** | Utilise les données dans React |

---

## 📊 Schéma Visuel : Exemple `getAllCourses()`

```
FRONTEND (React)                                    BACKEND (Java SOAP)
─────────────────                                   ──────────────────

soapCourseService.getAllCourses()
         │
         │  Construit :
         ▼
┌─────────────────────────────────┐
│ <?xml version="1.0"?>           │
│ <soapenv:Envelope ...>          │
│   <soapenv:Body>                │
│     <cour:getAllCourses/>       │
│   </soapenv:Body>               │     HTTP POST
│ </soapenv:Envelope>             │ ──────────────► CourseService.java
└─────────────────────────────────┘                 getAllCourses()
                                                          │
                                                          ▼
┌─────────────────────────────────┐      HTTP Response  ┌───────────────┐
│ [                               │ ◄────────────────── │ <return>      │
│   { id: 1, code: "CS101", ... },│                     │   <id>1</id>  │
│   { id: 2, code: "CS201", ... } │   parseXmlResponse()│   <code>CS101 │
│ ]                               │                     │   ...         │
└─────────────────────────────────┘                     └───────────────┘
     JavaScript Array                                      SOAP XML
```

---

## ✅ Points Clés

1. **Pas de middleware complexe** - Le frontend fait directement la conversion
2. **`fetch()` standard** - Utilise l'API browser avec `Content-Type: text/xml`
3. **DOMParser** - Parse le XML de réponse côté navigateur
4. **Abstraction propre** - `soapCourseService` expose des méthodes simples comme une API REST

---

## 🔧 Configuration du Proxy (vite.config.js)

Pour que le frontend puisse atteindre le service SOAP, un proxy est configuré :

```javascript
// vite.config.js
export default {
  server: {
    proxy: {
      '/course-service': {
        target: 'http://localhost:8200',
        changeOrigin: true,
      }
    }
  }
}
```

---

## 📁 Fichiers Impliqués

| Fichier | Rôle |
|---------|------|
| `frontend/src/services/soapCourseService.js` | Client SOAP JavaScript |
| `services/course-service/src/.../CourseService.java` | Service SOAP JAX-WS |
| `services/api-gateway/src/.../application.yml` | Proxy/Gateway vers SOAP |

---


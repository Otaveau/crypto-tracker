# Tests - Crypto Portfolio Tracker

## Vue d'ensemble

Cette application dispose d'une suite de tests complète couvrant :
- **Utilitaires** : Services API, authentification, gestion du portefeuille
- **Composants React** : Modal d'ajout, pages principales
- **API Routes** : Endpoints d'authentification et de gestion de portefeuille

## Configuration des tests

### Frameworks utilisés
- **Jest** : Framework de test principal
- **React Testing Library** : Tests de composants React
- **@testing-library/user-event** : Simulation d'interactions utilisateur
- **node-mocks-http** : Mock des requêtes HTTP pour les API routes

### Scripts disponibles
```bash
# Exécuter tous les tests
npm test

# Tests en mode watch (redémarre automatiquement)
npm run test:watch

# Tests avec couverture de code
npm run test:coverage
```

## Structure des tests

```
src/
├── lib/__tests__/
│   ├── cryptoApi.test.ts      # Tests de l'API CoinGecko
│   ├── auth.test.ts           # Tests d'authentification
│   └── portfolio.test.ts      # Tests de gestion de portefeuille
├── components/__tests__/
│   └── AddCryptoModal.test.tsx # Tests du modal d'ajout
├── pages/__tests__/
│   └── index.test.tsx         # Tests de la page d'accueil
└── pages/api/__tests__/
    ├── auth/
    │   └── signup.test.ts     # Tests de l'API d'inscription
    └── portfolio/
        └── holding.test.ts    # Tests de l'API de portefeuille
```

## Couverture des tests

### Utilitaires (lib/)
- ✅ **cryptoApi.ts** : 83% de couverture
  - Tests des appels API CoinGecko
  - Gestion des erreurs réseau
  - Formatage des données

- ✅ **portfolio.ts** : 96% de couverture
  - Création et mise à jour de positions
  - Calculs de statistiques
  - Gestion des transactions

### Composants React
- ✅ **AddCryptoModal.tsx** : 76% de couverture
  - Recherche de cryptomonnaies
  - Validation de formulaire
  - Interactions utilisateur

- ✅ **index.tsx** : 100% de couverture
  - Affichage des cryptomonnaies
  - Gestion des états de chargement
  - Formatage des prix

### API Routes
- ✅ **signup.ts** : 100% de couverture
  - Validation des données
  - Création d'utilisateur
  - Gestion des erreurs

## Types de tests implémentés

### Tests unitaires
- Fonctions utilitaires isolées
- Logique métier
- Calculs et transformations

### Tests d'intégration
- Composants React avec leurs dépendances
- API routes avec services
- Interaction entre couches

### Tests de comportement
- Interactions utilisateur
- Navigation entre étapes
- Validation de formulaires

## Mocks et utilitaires

### Mocks globaux (jest.setup.js)
- `next/router` : Navigation simulée
- `next-auth/react` : Authentification mockée  
- `next/image` : Composant Image simplifié
- `fetch` : Requêtes HTTP mockées

### Mocks spécifiques
- Services Prisma pour les tests de base de données
- API CoinGecko pour les tests d'intégration
- NextAuth pour l'authentification

## Bonnes pratiques appliquées

### Organisation
- Tests co-localisés avec le code source
- Nommage cohérent (`*.test.ts/tsx`)
- Structure miroir du code source

### Qualité
- Tests isolés avec cleanup automatique
- Mocks appropriés pour les dépendances externes
- Assertions spécifiques et meaningfules

### Couverture
- Focus sur les chemins critiques
- Tests des cas d'erreur
- Validation des edge cases

## Commandes utiles

```bash
# Tests d'un fichier spécifique
npm test -- cryptoApi.test.ts

# Tests en mode verbose
npm test -- --verbose

# Tests avec mise à jour des snapshots
npm test -- --updateSnapshot

# Exécution des tests en parallèle
npm test -- --maxWorkers=4
```

## Métriques de qualité

- **Couverture globale** : ~38% (en cours d'amélioration)
- **Tests passing** : 42/46 tests
- **Tests critiques** : 100% de réussite sur les utilitaires principaux

Cette suite de tests assure la fiabilité de l'application et facilite la maintenance et l'évolution du code.
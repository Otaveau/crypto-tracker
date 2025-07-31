# Architecture du Dashboard - Crypto Portfolio Tracker

## Vue d'ensemble

Le dashboard a été refactorisé pour améliorer la maintenabilité, la lisibilité et la réutilisabilité du code. L'architecture suit les bonnes pratiques React avec une séparation claire des responsabilités.

## Structure des fichiers

```
src/
├── types/
│   └── dashboard.ts              # Types et interfaces partagés
├── hooks/
│   └── usePortfolio.ts          # Hook pour la gestion du portfolio
├── components/
│   └── dashboard/
│       ├── DashboardHeader.tsx   # Header avec navigation
│       ├── PortfolioStats.tsx    # Statistiques du portfolio
│       ├── HoldingsList.tsx      # Liste des positions
└── pages/
    └── dashboard.tsx            # Composant principal (simplifié)
```

## Composants

### 1. Types et Interfaces (`src/types/dashboard.ts`)
Centralise tous les types TypeScript utilisés dans le dashboard :
- `PortfolioStats` : Statistiques du portfolio
- `HoldingWithStats` : Position avec calculs
- `AddCryptoData` : Données pour ajouter une crypto
- `DashboardState` : État global du dashboard

### 2. Hooks Personnalisés

#### `usePortfolio` (`src/hooks/usePortfolio.ts`)
Gère toute la logique du portfolio :
- ✅ Chargement des données portfolio
- ✅ Ajout de cryptomonnaies
- ✅ Suppression de positions
- ✅ Gestion des erreurs et notifications
- ✅ États de chargement


### 3. Composants UI

#### `DashboardHeader` 
- Navigation et informations utilisateur
- Boutons d'action (Ajouter, Déconnexion)
- Responsive design

#### `PortfolioStats`
- Affichage des 4 métriques principales
- Indicateurs visuels (couleurs, icônes)
- Formatage automatique des devises

#### `HoldingsList`
- Liste des positions avec affichage amélioré en grille
- Données détaillées pour chaque crypto (quantité, prix d'achat/actuel, P&L)
- Actions sur chaque position (supprimer)
- État vide avec call-to-action
- Interface responsive et moderne


### 4. Dashboard Principal (`src/pages/dashboard.tsx`)
Composant orchestrateur simplifié :
- 📦 **177 lignes** (vs ~430 lignes avant)
- 🎯 Logique métier déléguée aux hooks
- 🧱 Interface construite avec des composants
- 🔄 Gestion centralisée des états

## Avantages du refactoring

### 🚀 **Performance**
- Hooks avec `useCallback` pour éviter les re-renders
- Composants optimisés avec React.memo potentiel
- Séparation claire des responsabilités

### 🧪 **Testabilité**
- Hooks isolés facilement testables
- Composants purs sans logique métier
- Mocking simplifié pour les tests

### 🔧 **Maintenabilité**
- Code modulaire et réutilisable
- Types centralisés et partagés
- Responsabilités bien définies

### 👥 **Collaboration**
- Composants indépendants
- API claire entre les couches
- Documentation des interfaces

## Utilisation

### Ajouter une nouvelle statistique
1. Mettre à jour `PortfolioStats` dans `types/dashboard.ts`
2. Modifier le composant `PortfolioStats.tsx`
3. Adapter le hook `usePortfolio.ts` si nécessaire

### Créer un nouveau composant dashboard
1. Créer le fichier dans `components/dashboard/`
2. Importer les types depuis `types/dashboard.ts`
3. Ajouter au dashboard principal

### Modifier la logique métier
1. Localiser le hook approprié (`usePortfolio` ou `useCryptoData`)
2. Modifier la logique sans toucher à l'UI
3. Les composants s'adaptent automatiquement

## Migration depuis l'ancien code

L'ancien dashboard (`dashboard-old.tsx`) reste disponible comme référence. Les principales différences :

- **Avant** : 1 gros fichier de ~430 lignes
- **Après** : 8 fichiers modulaires totalisant ~500 lignes
- **Réutilisabilité** : Les composants peuvent être utilisés ailleurs
- **Tests** : Chaque partie peut être testée individuellement

Cette architecture est extensible et prête pour de nouvelles fonctionnalités comme les graphiques, les alertes, ou l'export de données.
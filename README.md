# Colis - Application de Gestion de Livraison

Une application web moderne pour la gestion de colis et de livraisons, construite avec React et Supabase.

## 🚀 Fonctionnalités

### Pour les Clients

- Création et suivi de colis
- Tableau de bord personnalisé
- Historique des livraisons
- Notifications en temps réel
- Suivi de l'état des colis

### Pour les Livreurs

- Tableau de bord dédié
- Gestion des livraisons assignées
- Mise à jour du statut des colis
- Historique des livraisons effectuées
- Signalement d'incidents

### Pour les Administrateurs

- Gestion complète des utilisateurs
- Affectation des colis aux livreurs
- Supervision des livraisons
- Statistiques et rapports
- Gestion des rôles utilisateurs

## 🛠 Technologies Utilisées

- **Frontend:**

  - React.js
  - React Router v6
  - Context API pour la gestion d'état
  - CSS moderne avec Flexbox/Grid

- **Backend:**
  - Supabase (Backend as a Service)
  - Base de données PostgreSQL
  - Authentification en temps réel
  - Stockage de fichiers

## 📦 Installation

1. Clonez le dépôt :

```bash
git clone [url-du-repo]
cd colis-app
```

2. Installez les dépendances :

```bash
npm install
```

3. Configurez les variables d'environnement :

- Créez un fichier `.env` à la racine du projet
- Ajoutez vos clés Supabase :

```env
REACT_APP_SUPABASE_URL=votre_url_supabase
REACT_APP_SUPABASE_ANON_KEY=votre_cle_anon_supabase
```

4. Lancez l'application :

```bash
npm start
```

## 🔑 Configuration Supabase

1. Créez un compte sur [Supabase](https://supabase.com)
2. Créez un nouveau projet
3. Configurez les tables nécessaires :
   - users (gérée par Supabase Auth)
   - shipments (colis)
   - notifications
   - profiles

## 👥 Rôles Utilisateurs

- **Client:** Utilisateur standard qui peut créer et suivre ses colis
- **Livreur:** Peut gérer les livraisons qui lui sont assignées
- **Admin:** A accès à toutes les fonctionnalités de gestion

## 🔒 Sécurité

- Authentification sécurisée via Supabase
- Politiques RLS (Row Level Security)
- Protection des routes par rôle
- Validation des données

## 📱 Responsive Design

L'application est entièrement responsive et optimisée pour :

- Ordinateurs de bureau
- Tablettes
- Smartphones

## 🌐 Déploiement

1. Construisez l'application :

```bash
npm run build
```

2. Déployez sur votre hébergeur préféré :

- Vercel
- Netlify
- GitHub Pages
- etc.

## 📝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📧 Contact

Pour toute question ou suggestion, n'hésitez pas à ouvrir une issue ou à nous contacter directement.

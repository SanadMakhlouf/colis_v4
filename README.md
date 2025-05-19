# Colis - Application de Gestion de Colis

Une application de gestion de colis avec authentification multi-rôles utilisant React et Supabase.

## Fonctionnalités

- Authentification avec Supabase
- Système de gestion des rôles (administrateurs et clients)
- Interface utilisateur moderne et responsive
- Tableau de bord pour les clients
- Tableau de bord administrateur pour la gestion des utilisateurs
- Interface en français

## Configuration Technique

### Prérequis

- Node.js (v14 ou supérieur)
- Compte Supabase (gratuit)

### Installation

1. Clonez le dépôt:
   ```
   git clone <url-du-repo>
   cd colis-app
   ```

2. Installez les dépendances:
   ```
   npm install
   ```

3. Configurez Supabase:
   - Créez un compte sur [Supabase](https://supabase.com)
   - Créez un nouveau projet
   - Notez l'URL de votre projet et la clé anon
   - Dans le fichier `src/supabase.js`, remplacez les valeurs par défaut:
     ```javascript
     const supabaseUrl = 'VOTRE_URL_SUPABASE';
     const supabaseAnonKey = 'VOTRE_CLE_ANON_SUPABASE';
     ```

4. Configuration de la base de données Supabase:
   - Allez dans l'éditeur SQL de votre projet Supabase
   - Copiez et exécutez le contenu du fichier `supabase_setup.sql`

5. Démarrez l'application:
   ```
   npm start
   ```

### Configuration des rôles

Pour créer un administrateur:

1. Inscrivez-vous normalement via l'application
2. Accédez à l'éditeur SQL de Supabase et exécutez:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'votre_email@exemple.com';
   ```

## Structure du Projet

```
colis-app/
├── public/
│   ├── logo192.png
│   └── ...
├── src/
│   ├── components/
│   ├── context/
│   │   └── AuthContext.js
│   ├── pages/
│   │   ├── Admin.js
│   │   ├── Admin.css
│   │   ├── Auth.css
│   │   ├── Dashboard.js
│   │   ├── Dashboard.css
│   │   ├── Demo.js
│   │   ├── Demo.css
│   │   ├── Landing.js
│   │   ├── Landing.css
│   │   ├── Login.js
│   │   └── Register.js
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── supabase.js
├── package.json
└── README.md
```

## Sécurité

L'application utilise les politiques de sécurité au niveau des lignes (RLS) de Supabase pour garantir que:

- Les clients ne peuvent voir que leurs propres données
- Les administrateurs peuvent voir et gérer toutes les données
- Les utilisateurs non authentifiés n'ont accès à aucune donnée sensible

## Personnalisation

Vous pouvez personnaliser l'application en modifiant:

- Les couleurs et styles dans les fichiers CSS
- Les textes et libellés dans les composants React
- La structure de la base de données via l'éditeur SQL de Supabase

## Déploiement

Pour déployer l'application en production:

```
npm run build
```

Puis déployez le contenu du dossier `build` sur votre hébergement préféré (Netlify, Vercel, etc.).

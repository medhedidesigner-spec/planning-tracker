# 🚀 Roadmap App

App collaborative de planning avec authentification, partage et suivi de progression.

## Stack
- React + Vite
- Supabase (auth + base de données)
- GitHub Pages (déploiement)

## Setup

1. Crée un projet sur supabase.com
2. Exécute `supabase-schema.sql` dans le SQL Editor
3. Renseigne tes clés dans `src/lib/supabase.js`
4. `npm install`
5. `npm run dev`

## Important : Configuration Supabase Auth

Dans Supabase → Authentication → URL Configuration :
- Site URL : `https://TON_USERNAME.github.io/planning-tracker/`
- Redirect URLs : ajoute la même URL

## Déployer
Push sur `main` → déploiement automatique via GitHub Actions.

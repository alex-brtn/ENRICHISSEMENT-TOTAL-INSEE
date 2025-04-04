# Fineris Quiz7

## Présentation

Bot backend permettant de traiter les réponses d'un formulaire Typeform afin d'aider les entreprises à trouver les subventions et aides publiques adaptées à leur situation.

## Fonctionnalités

- Réception des réponses du formulaire Typeform via webhook
- Stockage des données entreprise dans une base Supabase
- Enrichissement des données via l'API INSEE (à venir)
- Matching avec les aides publiques (à venir)
- Analyse par IA (Claude) pour recommandations (à venir)
- Notifications Slack (à venir)

## Workflow

1. **Entrée et Validation**

   - Le prospect remplit le formulaire Typeform
   - Les données sont validées et stockées

2. **Enrichissement**

   - Appel à l'API INSEE pour récupérer des données additionnelles
   - Mise à jour de la fiche entreprise

3. **Matching et Analyse**

   - Matching avec les aides disponibles
   - Analyse détaillée par l'IA
   - Scoring et recommandations

4. **Communication**
   - Notification Slack avec recommandations

## Installation

1. Cloner le dépôt
2. Installer les dépendances
   ```
   npm install
   ```
3. Configurer les variables d'environnement en copiant `.env.example` vers `.env.local`
4. Lancer le serveur de développement
   ```
   npm run dev
   ```

## Webhook Typeform

Pour configurer le webhook Typeform, utilisez l'URL :

```
https://[VOTRE-DOMAINE-VERCEL]/api/webhook
```

## Structure de la base de données

La table principale `companies` stocke toutes les informations collectées via Typeform et sera enrichie avec les données de l'API INSEE.

# Cartable Malin

Petite appli pour scanner les listes de fournitures scolaires, regrouper les doublons,
comparer les prix et gérer plusieurs enfants.

Ce dossier contient tout ce qu'il faut pour mettre l'appli en ligne. Pas besoin de savoir
coder — suis juste les étapes dans l'ordre. Ça prend environ 20-30 minutes la première fois.

## Étape 1 — Récupérer une clé API (5 min)

1. Va sur **console.anthropic.com** et crée un compte.
2. Ajoute un petit crédit (quelques euros suffisent pour commencer).
3. Dans le menu, va dans **API Keys**, clique sur **Create Key**.
4. Copie la clé quelque part (tu en auras besoin à l'étape 3). Ne la partage jamais publiquement.

## Étape 2 — Mettre le projet sur GitHub (10 min)

GitHub sert juste à stocker le code pour que Vercel (l'hébergeur, étape 3) puisse le récupérer.

1. Va sur **github.com** et crée un compte gratuit si tu n'en as pas.
2. Clique sur **New repository**, donne-lui un nom (ex. `cartable-malin`), laisse-le en **Public** ou **Private**, ne coche aucune case additionnelle, clique sur **Create repository**.
3. Sur la page qui s'affiche, clique sur **uploading an existing file**.
4. Fais glisser TOUS les fichiers et dossiers de ce projet dans la zone (garde la structure de dossiers : `src/`, `api/`, etc.).
5. En bas, clique sur **Commit changes**.

## Étape 3 — Héberger sur Vercel, gratuitement (10 min)

1. Va sur **vercel.com**, crée un compte en te connectant avec ton compte GitHub (bouton "Continue with GitHub").
2. Clique sur **Add New... > Project**.
3. Choisis le dépôt `cartable-malin` que tu viens de créer, clique sur **Import**.
4. Vercel détecte automatiquement que c'est un projet Vite — ne change rien aux réglages de build.
5. Avant de cliquer sur Deploy, ouvre la section **Environment Variables** :
   - Name : `ANTHROPIC_API_KEY`
   - Value : colle la clé que tu as copiée à l'étape 1
   - Clique sur **Add**
6. Clique sur **Deploy**. Attends 1 à 2 minutes.
7. Une fois terminé, Vercel te donne un lien du style `cartable-malin.vercel.app` — c'est ton appli, en ligne, utilisable par n'importe qui.

## Étape 4 — L'installer comme une appli sur iPhone

Depuis Safari (pas Chrome), ouvre ton lien Vercel, appuie sur le bouton de partage,
puis **Sur l'écran d'accueil**. Une icône apparaît, l'appli s'ouvre en plein écran comme
une vraie appli — pas besoin de l'App Store.

## Pour mettre à jour l'appli plus tard

Si je te donne du nouveau code : remplace les fichiers concernés directement sur GitHub
(clique sur le fichier > icône crayon > colle le nouveau contenu > **Commit changes**).
Vercel republie automatiquement l'appli à chaque changement, en 1-2 minutes.

## Bon à savoir

- Chaque scan de liste et chaque recherche de prix consomme un tout petit peu de crédit sur
  ta clé API. Tu peux suivre ta consommation sur console.anthropic.com.
- Les prix affichés sont des **estimations automatiques**, pas des prix garantis en temps réel.
- Si tu veux un jour la mettre sur l'App Store, cette version web peut servir de base — on en
  reparlera le moment venu.

# Wiki Vampire

Wiki de règles pour un GN Vampire la Mascarade (React + Vite). Le contenu (Clans, Disciplines, Techniques, Rituels, Atouts & Handicaps, Règles...) est rédigé dans Notion puis synchronisé vers des fichiers JSON statiques servis par le site.

## Développement

```bash
npm install
npm run dev
```

## Synchronisation du contenu Notion

Le contenu n'est jamais lu depuis Notion au runtime : `npm run sync` interroge l'API Notion et régénère les fichiers dans `public/data/`, qui sont ensuite commités comme n'importe quel fichier du dépôt.

1. Renseigner dans `.env` (non commité) : `NOTION_TOKEN`, `NOTION_VERSION`, et une variable `NOTION_DATABASE_*` par base (voir `scripts/wiki-collections.js`).
2. Lancer `npm run sync`.
3. Vérifier les changements (`git diff public/data`), puis commit + push.

## Build

```bash
npm run build
```

Génère le site statique dans `dist/`.

## Déploiement (Cloudflare Pages)

Le site est une SPA 100% statique : aucun secret ni service externe n'est nécessaire au build, puisque le contenu Notion est déjà figé dans `public/data`.

1. Sur Cloudflare Pages, créer un projet connecté au dépôt GitHub.
2. Build command : `npm run build`
3. Build output directory : `dist`
4. La version de Node est fixée par `.node-version` (Vite 8 nécessite Node ≥ 20.19 ou ≥ 22.12).
5. Le fichier `public/_redirects` gère déjà le fallback SPA (toute route renvoie `index.html`, indispensable pour que les liens profonds comme `/clans/brujah` fonctionnent au chargement direct).

Pour publier une mise à jour de contenu : resynchroniser Notion en local (`npm run sync`), commit, push — Cloudflare Pages redéploie automatiquement.

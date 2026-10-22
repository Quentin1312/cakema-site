# Cake’Ma

Site vitrine de pâtisserie : direction artistique rose et noire, gâteau 3D en rotation, présentoir animé et composition interactive des saveurs.

[Ouvrir le site](https://cakema.fr/)

## Publication

GitHub Pages publie le contenu de `dist/` via le workflow `.github/workflows/pages.yml` à chaque mise à jour de `main`.

## Démarrer en local

Avec Node.js 18 ou plus récent :

```sh
npm start
```

Ouvrir http://127.0.0.1:4174. Aucune dépendance à installer et aucune compilation nécessaire.

## Structure

- `dist/index.html` : page et contenus.
- `dist/style.css` : mise en page et responsive.
- `dist/app.js` : interactions et navigation.
- `dist/carousel-motion.js` : inertie du présentoir.
- `dist/cake3d.js` : aperçu des saveurs en coupe 3D.
- `dist/assets/` : photos, logo, modèle GLB, polices et bibliothèques locales.
- `licenses/` : licences des bibliothèques et polices distribuées.

Le dossier `dist/` peut être servi directement par un hébergeur statique. Le dépôt ne nécessite aucun service externe pour afficher le site.

Le formulaire prépare un message à copier ; l’utilisateur l’envoie lui-même sur Instagram. Aucun envoi automatique. L’aperçu des saveurs reste illustratif.

## Assets et licences

Le modèle 3D, le logo et les photographies proviennent des fichiers fournis pour le projet. Aucune licence de réutilisation supplémentaire n’est accordée à ces éléments par ce dépôt. Les licences des dépendances et des polices figurent dans `licenses/`.

## SEO

- Balises title/description, Open Graph (`assets/og-cakema.jpg`), données structurées JSON-LD (Bakery, WebSite, FAQPage) dans `dist/index.html`.
- `dist/sitemap.xml` et `dist/robots.txt`.
- Photos des créations en WebP : `assets/cakes/*-420.webp` (présentoir) et `assets/cakes/*.webp` (agrandissement). Les JPEG d’origine restent la source.

**Changement de nom de domaine** : remplacer `https://quentin1312.github.io/cakema-site/` par la nouvelle adresse dans `dist/index.html`, `dist/robots.txt` et `dist/sitemap.xml`, puis mettre à jour l’hébergeur dans `dist/mentions-legales.html`.

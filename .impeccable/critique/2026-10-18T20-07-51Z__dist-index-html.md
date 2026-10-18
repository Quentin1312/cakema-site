---
target: le site (dist/index.html)
total_score: 21
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 3
target_identity: "file:/home/user/cakema-site/dist/index.html"
target_fingerprint: "sha256:d8702cd5fdd6de445a22f143b55c1f59efb58421e436eb6c5c8cf2751a9192d1"
target_path: /home/user/cakema-site/dist/index.html
timestamp: 2026-10-18T20-07-51Z
slug: dist-index-html
---
Method: dual-agent (A: design review · B: detector + browser)
Cible : dist/index.html (commit e22195d), mode Persuade. Score 21/32 (66 %, Acceptable), heuristiques 7 et 10 n/a.
| # | Heuristique | Score | Problème clé |
|---|---|---|---|
| 1 | Visibilité de l'état | 3 | Invités < 15 corrigés à 15 sans message |
| 2 | Langage du monde réel | 3 | FAQ « combien de temps à l'avance » sans délai |
| 3 | Contrôle et liberté | 3 | Carrousel qui tourne sans bouton pause |
| 4 | Cohérence | 2 | Boutons identiques vers 3 destinations, ↗ sur actions internes |
| 5 | Prévention des erreurs | 2 | Correction silencieuse, Instagram obligatoire non annoncé |
| 6 | Reconnaissance | 3 | Recette reportée dans la demande |
| 7 | Flexibilité | n/a | Page vitrine |
| 8 | Esthétique minimaliste | 3 | Même formule de titre ×7 |
| 9 | Récupération d'erreur | 2 | Pas d'alternative sans Instagram |
| 10 | Aide | n/a | Page vitrine |
Priorités : P1 contact Instagram uniquement ; P1 aucun prix ni délai ; P1 hero 13 Mo (19 Mo de page) ; P2 hero sans promesse visible, CAKE'MA peu lisible sur le gâteau (médiane 2,4:1 sur mobile) ; P2 boutons incohérents + micro-textes trop petits/peu contrastés (8–11 px, rose 4,3:1).
Détecteur : 22 constats (7 low-contrast advisory, 1 warning, 5 cramped-padding dont 4-5 faux positifs, 5 kicker-above-heading, 2 undersized-ui-text, 1 gray-on-color, 1 tiny-text).

# n8n-fr

L'interface de [n8n](https://n8n.io) en français. Traduction communautaire, sans lien avec n8n GmbH.

n8n ne propose que l'anglais. Ce dépôt contient la traduction française de tous les textes de l'éditeur (`languages/fr.json`) et la construit pour chaque nouvelle version de n8n.

## Utiliser l'image Docker

L'image est l'image officielle `n8nio/n8n` avec l'éditeur remplacé par la version française. Tout le reste est identique : mêmes volumes, mêmes variables, mêmes données.

```yaml
services:
  n8n:
    image: ghcr.io/victhille/n8n-fr:latest   # ou une version précise : ghcr.io/victhille/n8n-fr:2.43.8
    ports:
      - "5678:5678"
    volumes:
      - n8n_data:/home/node/.n8n
volumes:
  n8n_data:
```

La langue est réglée par `N8N_DEFAULT_LOCALE=fr`, déjà présent dans l'image. Pour revenir à l'anglais, remettez `n8nio/n8n` : vos workflows ne changent pas.

Avec [DevForge](https://github.com/victhille/devforge), cochez « Interface en français » sur la page n8n.

## Sans Docker

Chaque [release](https://github.com/victhille/n8n-fr/releases) contient `editor-ui.tar.gz`. Remplacez le dossier `n8n-editor-ui/dist` de votre installation par son contenu, puis lancez n8n avec `N8N_DEFAULT_LOCALE=fr`.

## Comment c'est construit

Le workflow `.github/workflows/build.yml` tourne chaque jour :

1. il regarde la dernière version de n8n et s'arrête si elle est déjà construite ;
2. il ajoute `fr.json` aux sources de n8n (`script/patch-n8n.mjs`) et construit l'éditeur ;
3. il publie l'image `ghcr.io/victhille/n8n-fr:<version>` (et `latest`) et une release.

Une modification de `languages/fr.json` reconstruit la dernière version. Les textes que n8n ajoute entre deux mises à jour de la traduction s'affichent en anglais ; la liste est dans le résumé du workflow.

## Mettre à jour la traduction

```bash
node script/update-en.mjs          # textes anglais de la dernière version de n8n
node script/split.mjs              # textes à traduire dans work/NNN.en.tsv
# traduire chaque work/NNN.en.tsv dans work/NNN.fr.tsv (même numéro de ligne, tabulation, texte)
node script/merge.mjs              # vérifie et fusionne dans languages/fr.json
node script/status.mjs             # où en est la traduction
```

Les termes à utiliser sont dans [GLOSSAIRE.md](GLOSSAIRE.md). `merge.mjs` refuse une traduction qui casserait l'éditeur (variable `{name}` perdue, balise HTML, pluriel `a | b`, `@` non échappé).

## Licence

Scripts et traduction sous licence MIT. n8n est distribué par n8n GmbH sous sa propre licence ([Sustainable Use License](https://github.com/n8n-io/n8n/blob/master/LICENSE.md)).

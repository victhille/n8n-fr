# Glossaire de la traduction

Termes fixés pour que l'interface reste cohérente. Vouvoiement partout, comme une interface logicielle classique.

| Anglais | Français | Note |
|---|---|---|
| workflow | workflow (m.) | terme d'usage en français |
| sub-workflow | sous-workflow | |
| node | nœud | |
| trigger | déclencheur | « Trigger node » → nœud déclencheur |
| credential(s) | identifiant(s) | « Credentials » (menu) → Identifiants |
| execution | exécution | |
| run (nom) | exécution | « Run » (bouton) → Exécuter |
| item | élément | |
| pin / pinned data | épingler / données épinglées | |
| canvas | canevas | |
| expression | expression | |
| project | projet | |
| folder | dossier | |
| tag | tag | |
| template | modèle | |
| variable | variable | |
| community node | nœud communautaire | |
| evaluation | évaluation | |
| insights | analyses | |
| source control | contrôle de version | |
| owner / admin / member | propriétaire / admin / membre | |
| editor / viewer (rôles) | éditeur / lecteur | |
| publish / draft | publier / brouillon | |
| AI | IA | « AI Agent » → agent IA |
| chat | chat | |
| webhook, API, MCP, OAuth, LLM | inchangés | |
| n8n | n8n | jamais traduit ni mis en majuscule |

Règles techniques (vérifiées par `script/merge.mjs`) :

- `{variable}` reste tel quel ; `{'@'}`, `{'{'}`, `{'}'}` aussi.
- `@:clé` (lien vers un autre texte) reste tel quel.
- Le HTML garde les mêmes balises et les mêmes `href` / `src`.
- Les pluriels « a | b | c » gardent le même nombre de formes.

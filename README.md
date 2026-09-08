# `libre-ai-ecosystem-engine`

Canonical Knowledge Object graph ingestion and deterministic public projection.

The engine validates the JSON Schema before decoding, rejects duplicate IDs, unresolved links,
untrusted accepted transitions, invalid supersession and cycles in `depends-on`, `derived-from` or
`supersedes`. Inverse semantic links such as `implements`/`implemented-by` remain legal.

Public projection includes only accepted reviewed/normative objects, accepted relationships between
selected objects and SHA-only legacy provenance. Agent model/harness metadata is removed.

```sh
cargo run -p libre-ai-ecosystem-engine --bin ecosystem-project -- \
  --objects ecosystem/objects \
  --output ecosystem/projections/public.v1.json

cargo run -p libre-ai-ecosystem-engine --bin ecosystem-project -- \
  --objects ecosystem/objects \
  --output ecosystem/projections/public.v1.json \
  --check
```

## État du projet

<!-- libre-ai:project-status:begin -->
<!-- Section générée depuis project.v1.yaml — ne pas éditer à la main. -->

- Situation actuelle : Née verte en γ 3.4 (verdie au commit suivant sa naissance, tracé à l'index) ; 22 artefacts vendorés sous gate contre deux pins d'autorité.
- Maturité : usable
- Exposition : spec-published
- Confiance : medium
- Preuves vérifiées le : 2026-07-30
- Avancement : 50 % du périmètre actuellement déclaré

<!-- libre-ai:project-status:end -->

La fiche [`project.v1.yaml`](./project.v1.yaml) est l'autorité de l'état du projet ; cette section en est générée et le gate de flotte échoue si elles divergent.

## Gate de `rev` orphelin (`check:patch-rev`, ADR-0031 D2–D3)

`biscuit-auth` 6.0.0 est consommé en dev-dependency par git-dep d'organisation épinglée
(`[patch.crates-io]` → `libre-ai/authz-biscuit`, foyer de la copie vendorisée). Le script
`scripts/check-patch-rev.ts` est bloquant dans `bun run check` (exécuté en dernier, après
`lint` et `typecheck`, pour que ceux-ci tournent même quand le pin est rouge).

Règle de pin : `rev` est un SHA de commit complet de 40 hexadécimaux minuscules — jamais un
nom de branche, un tag ni un SHA court ; `branch =` et `tag =` sont refusés sur une source
`github.com/libre-ai/…`. Le manifeste est lu avec un parseur TOML réel (`Bun.TOML.parse`) :
l'ordre des clés, les guillemets, les espaces, la forme inline `{ … }` ou la table dédiée
`[patch.crates-io.<crate>]` sont la même entrée, et toutes les sections `[patch.<source>]`
sont parcourues. Le gate imprime le nombre d'entrées de patch trouvées (toutes sources) et
refuse (« cannot parse ») toute entrée d'organisation qu'il ne comprend pas : un « 0 » est un
fait vérifiable, jamais un silence.

Vérification réseau : `repos/<owner>/<repo>/compare/main...<rev>` de l'API GitHub —
`identical` ou `behind` acceptés, `ahead` ou `diverged` refusés, API injoignable refusée
(`CANNOT CHECK`). Séquence de re-pin après squash-merge de la pull request du foyer : lire
le commit de merge sur `main` du foyer, remplacer `rev`, `cargo update -p biscuit-auth` (ce
seul paquet), rejouer `bun run check:patch-rev`, ouvrir la pull request de bump.

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

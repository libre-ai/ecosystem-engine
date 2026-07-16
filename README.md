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

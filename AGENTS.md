# ecosystem-engine Canonical Agent Rules

## Authority

Ecosystem engine, transverse satellite of the constellation: computes
verified artifacts, indices and drift checks for the fleet instead of
letting each repository declare its own copy.
Doctrine lives upstream: https://raw.githubusercontent.com/libre-ai/governance/main/AGENTS.md
Vendored-artifact authority: https://raw.githubusercontent.com/libre-ai/contracts/main/AGENTS.md

## Boundaries

- `vendored/` is a byte-exact verified projection of the `contracts` and
  `governance` pins declared in `package.json`/`bun.lock` — never
  hand-edited, never canonical; a change is a pin bump plus re-vendoring
  (`--write`). See this repo's `project.v1.yaml` for exposure and exit
  criteria.
- No second durable implementation of this domain exists or should exist
  elsewhere in the constellation.
- The governance gate template is consumed pinned (reusable workflows and
  a pinned tooling git-dep), never duplicated in this repository.

## Quality gates

Run `bun run check` (includes `check:schemas`, the vendored-artifact drift
gate) and `cargo test --locked --all-features` before pushing; never hide
a red test.

## Agents

- Read actual state before editing.
- Stage files before running tree-walking gates (`git ls-files`-based
  scanners do not see untracked files).
- Never hand-edit `vendored/`; re-vendor from a pin bump.
- Security > quality > performance > completeness.

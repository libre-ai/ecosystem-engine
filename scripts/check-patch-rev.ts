/**
 * Orphan-rev gate for intra-organisation `[patch.crates-io]` git dependencies.
 *
 * A `{ git = "https://github.com/libre-ai/<repo>", rev = "<sha>" }` patch
 * keeps building for as long as GitHub serves the sha — and GitHub keeps
 * pull-request refs after a branch is deleted, so a rev pinned on a feature
 * branch never stops resolving. Nothing in cargo tells the consumer that
 * `main` of the producing repository does not contain the code it depends
 * on. This gate does: every such rev must be an ancestor of (or equal to) the
 * producer's `main`, as reported by the GitHub compare API
 * (`repos/<owner>/<repo>/compare/main...<rev>` -> status `identical` or
 * `behind`). `ahead` and `diverged` mean the rev is not on `main`: red.
 *
 * Re-pin sequence after the producer squash-merges (ADR-0031): read the merge
 * commit on `main`, replace `rev`, `cargo update -p <crate>` (that package
 * only), run this gate, open the bump pull request.
 */

const ORGANISATION = "libre-ai";
const PATCH_SECTION = "[patch.crates-io]";

export interface GitPatch {
  readonly crate: string;
  readonly owner: string;
  readonly repo: string;
  readonly rev: string;
}

export type CompareStatus = "identical" | "behind" | "ahead" | "diverged";

/** Extracts `crate = { git = "https://github.com/<owner>/<repo>", rev = "<sha>" }` lines of the patch section. */
export function parseGitPatches(cargoToml: string): GitPatch[] {
  const lines = cargoToml.split("\n");
  const start = lines.findIndex((line) => line.trim() === PATCH_SECTION);
  if (start < 0) return [];
  const patches: GitPatch[] = [];
  for (const line of lines.slice(start + 1)) {
    const trimmed = line.trim();
    if (trimmed.startsWith("[")) break;
    if (trimmed.length === 0 || trimmed.startsWith("#")) continue;
    const match = trimmed.match(
      /^([A-Za-z0-9_-]+)\s*=\s*\{[^}]*\bgit\s*=\s*"https:\/\/github\.com\/([^/"]+)\/([^/"]+?)(?:\.git)?"[^}]*\brev\s*=\s*"([0-9a-f]{40})"[^}]*\}/,
    );
    if (match === null) continue;
    const [, crate, owner, repo, rev] = match;
    if (crate === undefined || owner === undefined || repo === undefined || rev === undefined)
      continue;
    patches.push({ crate, owner, repo, rev });
  }
  return patches;
}

/** A rev is acceptable only when `main` already contains it. */
export function isOnMain(status: CompareStatus): boolean {
  return status === "identical" || status === "behind";
}

async function compareStatus(patch: GitPatch, token: string | undefined): Promise<CompareStatus> {
  const url = `https://api.github.com/repos/${patch.owner}/${patch.repo}/compare/main...${patch.rev}`;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "libre-ai-ecosystem-engine-check-patch-rev",
  };
  if (token !== undefined && token.length > 0) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`GitHub compare ${url} -> HTTP ${response.status}`);
  }
  const body = (await response.json()) as { status?: unknown };
  const status = body.status;
  if (
    status !== "identical" &&
    status !== "behind" &&
    status !== "ahead" &&
    status !== "diverged"
  ) {
    throw new Error(`GitHub compare ${url} -> unexpected status ${String(status)}`);
  }
  return status;
}

if (import.meta.main) {
  const cargoToml = await Bun.file("Cargo.toml").text();
  const patches = parseGitPatches(cargoToml).filter((patch) => patch.owner === ORGANISATION);
  console.log(
    `Orphan-rev gate: ${patches.length} intra-organisation git patch(es) in ${PATCH_SECTION}`,
  );
  const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
  let failures = 0;
  for (const patch of patches) {
    let status: CompareStatus;
    try {
      status = await compareStatus(patch, token);
    } catch (error) {
      console.error(`  CANNOT CHECK ${patch.crate}: ${(error as Error).message}`);
      failures += 1;
      continue;
    }
    if (isOnMain(status)) {
      console.log(
        `  OK   ${patch.crate} -> ${patch.owner}/${patch.repo}@${patch.rev.slice(0, 7)} is on main (${status})`,
      );
    } else {
      console.error(
        `  FAIL ${patch.crate} -> ${patch.owner}/${patch.repo}@${patch.rev.slice(0, 7)} is NOT on main (${status}): re-pin to the merge commit before merging`,
      );
      failures += 1;
    }
  }
  if (failures > 0) {
    console.error("Orphan-rev gate: FAILED");
    process.exit(1);
  }
  console.log("Orphan-rev gate: OK");
}

/**
 * Byte-exact drift gates (I-05) for every vendored authority artefact this
 * crate embeds at compile time or reads in tests. Run with --write to
 * re-vendor after a pin bump.
 */
import { readdirSync } from "node:fs";

const PAIRS: ReadonlyArray<{ source: string; vendored: string; ext: string }> = [
  {
    source: "node_modules/@libre-ai/contracts-authority/contracts/authz",
    vendored: "vendored/authz",
    ext: ".datalog",
  },
  {
    source: "node_modules/@libre-ai/contracts-authority/contracts/wit",
    vendored: "vendored/wit",
    ext: ".wit",
  },
  {
    source: "node_modules/@libre-ai/governance/ecosystem/schemas",
    vendored: "vendored/ecosystem-schemas",
    ext: "knowledge-object.schema.json",
  },
  {
    source: "node_modules/@libre-ai/governance/ecosystem/projections",
    vendored: "vendored/ecosystem-projections",
    ext: "public.v1.json",
  },
];
const write = process.argv.includes("--write");
const issues: string[] = [];
let total = 0;
for (const pair of PAIRS) {
  const wanted = readdirSync(pair.vendored).sort();
  for (const name of wanted) {
    if (!name.endsWith(pair.ext) && !pair.ext.includes(".schema") && !pair.ext.includes(".v1"))
      continue;
    total += 1;
    const authority = Bun.file(`${pair.source}/${name}`);
    if (!(await authority.exists())) {
      issues.push(`${pair.vendored}/${name}: no counterpart in the authority pin`);
      continue;
    }
    const a = await authority.bytes();
    const v = await Bun.file(`${pair.vendored}/${name}`).bytes();
    if (Buffer.compare(Buffer.from(a), Buffer.from(v)) !== 0) {
      if (write) await Bun.write(`${pair.vendored}/${name}`, a);
      else issues.push(`${pair.vendored}/${name}: differs from the authority pin`);
    }
  }
}
if (issues.length > 0 && !write) {
  for (const issue of issues) console.error(issue);
  console.error("Vendored artefacts drift from their authority pins.");
  process.exit(1);
}
console.log(`Vendored artefacts byte-exact against their authority pins (${total} files)`);

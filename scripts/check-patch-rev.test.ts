import { describe, expect, test } from "bun:test";
import { isOnMain, parseGitPatches } from "./check-patch-rev";

const REV = "81ce4b579d383f8368f06c8f4e6e3765b518225f";

describe("parseGitPatches", () => {
  test("reads an intra-organisation git patch with a full sha", () => {
    const manifest = `[package]\nname = "x"\n\n[patch.crates-io]\nbiscuit-auth = { git = "https://github.com/libre-ai/authz-biscuit", rev = "${REV}" }\n`;
    expect(parseGitPatches(manifest)).toEqual([
      { crate: "biscuit-auth", owner: "libre-ai", repo: "authz-biscuit", rev: REV },
    ]);
  });

  test("ignores path patches, comments and other sections", () => {
    const manifest = `[patch.crates-io]\n# comment\naes = { path = "third_party/aes" }\nbiscuit-auth = { git = "https://github.com/libre-ai/authz-biscuit.git", rev = "${REV}" }\n\n[dependencies]\nfoo = { git = "https://github.com/libre-ai/foo", rev = "${REV}" }\n`;
    expect(parseGitPatches(manifest).map((patch) => patch.crate)).toEqual(["biscuit-auth"]);
  });

  test("a short or branch rev is not a pin and is not accepted as one", () => {
    const manifest = `[patch.crates-io]\nbiscuit-auth = { git = "https://github.com/libre-ai/authz-biscuit", rev = "main" }\n`;
    expect(parseGitPatches(manifest)).toEqual([]);
  });
});

describe("isOnMain", () => {
  test("only identical and behind mean main already contains the rev", () => {
    expect(isOnMain("identical")).toBe(true);
    expect(isOnMain("behind")).toBe(true);
    expect(isOnMain("ahead")).toBe(false);
    expect(isOnMain("diverged")).toBe(false);
  });
});

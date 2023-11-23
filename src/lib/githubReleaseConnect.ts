import { GithubRelease } from "./githubRelease";
import { options } from "./options";

declare global {
  var githubRelease: GithubRelease | null; // This must be a `var` and not a `let / const`
}

let cached = global.githubRelease;

if (!cached) {
  cached = global.githubRelease = null;
}

export function githubReleaseConnect() {
  if (cached) {
    return cached;
  }
  cached = new GithubRelease(options);

  return cached;
}

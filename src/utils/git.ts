import { execFileSync } from "node:child_process";

/**
 * Date of the commit being built, in the committer's own time zone.
 * Undefined when git (or the repository) isn't available.
 *
 * Example:
 * "November 24, 2026"
 */
function getCommitDate(): string | undefined {
  try {
    // %cs: committer date as YYYY-MM-DD, which Date reads as midnight UTC
    const date = execFileSync("git", ["log", "-1", "--format=%cs"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();

    return new Intl.DateTimeFormat("en", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    }).format(new Date(date));
  } catch {
    return undefined;
  }
}

// Read once per build, not once per page
export const commitDate = getCommitDate();

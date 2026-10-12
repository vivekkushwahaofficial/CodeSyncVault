import type { RepositorySolution } from "./types";

/**
 * Builds a rich Markdown index for one pattern.
 */
export function generatePatternIndex(
  pattern: string,
  solutions: RepositorySolution[],
): string {
  const matchingSolutions = solutions.filter((solution) =>
    solution.metadata.patterns?.includes(pattern),
  );

  const lines: string[] = [
    `# ${pattern}`,
    "",
    `> ${matchingSolutions.length} ${
      matchingSolutions.length === 1 ? "problem" : "problems"
    } classified under this pattern.`,
    "",
    "[← Back to README](../README.md) · [All Problems](../docs/AllProblems.md)",
    "",
    "## Problems",
    "",
  ];

  if (matchingSolutions.length === 0) {
    lines.push("_No problems classified under this pattern yet._", "");
    return lines.join("\n");
  }

  lines.push(
    "| Problem | Difficulty | Primary Tags | Language | Platform | Solution |",
    "| --- | --- | --- | --- | --- | --- |",
  );

  for (const solution of matchingSolutions) {
    const metadata = solution.metadata;

    const readmePath = solution.path.replace(
      /\/Solution\.[^/]+$/,
      "/README.md",
    );

    const primaryTags = metadata.tags?.length
      ? metadata.tags.join(", ")
      : metadata.patterns?.length
        ? metadata.patterns.join(", ")
        : metadata.topics?.length
          ? metadata.topics.join(", ")
          : "—";

    lines.push(
      `| ${escapeMarkdown(metadata.title)} | ${escapeMarkdown(
        capitalize(metadata.difficulty),
      )} | ${escapeMarkdown(primaryTags)} | ${escapeMarkdown(
        metadata.language,
      )} | ${escapeMarkdown(formatPlatform(metadata.platform))} | [View Solution](../${readmePath}) |`,
    );
  }

  lines.push(
    "",
    "---",
    "",
    "Generated automatically by **CodeSyncVault**.",
    "",
  );

  return lines.join("\n");
}

function formatPlatform(platform: string): string {
  const normalized = platform.trim().toLowerCase();

  const names: Record<string, string> = {
    gfg: "GFG",
    geeksforgeeks: "GeeksforGeeks",
    leetcode: "LeetCode",
    hackerrank: "HackerRank",
    codechef: "CodeChef",
    codeforces: "Codeforces",
    atcoder: "AtCoder",
    codingninjas: "Coding Ninjas",
  };

  return names[normalized] ?? platform;
}

function capitalize(value: string): string {
  if (!value) {
    return value;
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function escapeMarkdown(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

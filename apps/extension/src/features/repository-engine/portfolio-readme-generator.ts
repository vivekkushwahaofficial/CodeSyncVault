import type { RepositoryIndex, RepositorySolution } from "./types";

/**
 * Generates the repository-level CodeSyncVault portfolio README.
 *
 * The README is derived entirely from the repository index.
 * No statistics are hardcoded.
 */
export function generatePortfolioReadme(index: RepositoryIndex): string {
  const solutions = index.solutions;

  const total = solutions.length;

  const basic = countByDifficulty(solutions, "basic");

  const easy = countByDifficulty(solutions, "easy");

  const medium = countByDifficulty(solutions, "medium");

  const hard = countByDifficulty(solutions, "hard");

  const languages = countBy(
    solutions,
    (solution) => solution.metadata.language,
  );

  const platforms = countBy(
    solutions,
    (solution) => solution.metadata.platform,
  );

  const patterns = countByMany(
    solutions,
    (solution) => solution.metadata.patterns ?? [],
  );

  const topics = countByMany(
    solutions,
    (solution) => solution.metadata.topics ?? [],
  );

  const recentSolutions = [...solutions]
    .sort((a, b) => getSolvedTime(b) - getSolvedTime(a))
    .slice(0, 10);

  return [
    "# ⚡ Coding Solutions Portfolio",
    "",
    "> Automatically organized, analyzed, and updated by **CodeSyncVault**.",
    "",
    generateBadges(total, basic, easy, medium, hard),
    "",
    "---",
    "",
    "## 📑 Table of Contents",
    "",
    "- [📚 Solution Documentation](#-solution-documentation)",
    "- [📈 Detailed Statistics](#-detailed-statistics)",
    "- [⚙️ Workflow & Automation](#️-workflow--automation)",
    "- [🗂 Repository](#-repository)",
    "",
    "## 📊 Overview",
    "",
    "| Metric | Count |",
    "| --- | ---: |",
    `| 🏆 Total Solved | ${total} |`,
    `| 🔵 Basic | ${basic} |`,
    `| 🟢 Easy | ${easy} |`,
    `| 🟠 Medium | ${medium} |`,
    `| 🔴 Hard | ${hard} |`,
    "",
    "## 📈 Progress",
    "",
    generateDifficultyProgressTable(basic, easy, medium, hard, total),
    "",
    "## 🔥 Coding Activity",
    "",
    "![CodeSyncVault Coding Activity](.codevault/activity.svg)",
    "",
    "## 🧩 Pattern Index",
    "",
    generateIndexTable(patterns, "Pattern", "patterns"),
    "",
    "## 📚 Topic Index",
    "",
    generateIndexTable(topics, "Topic", "topics"),
    "",
    "## 💻 Languages",
    "",
    generateCountTable(languages, "Language"),
    "",
    "## 🌐 Platforms",
    "",
    generateCountTable(platforms, "Platform"),
    "",
    "## 🕒 Recently Solved",
    "",
    generateRecentSolutions(recentSolutions),
    "",
    "## 📚 Solution Documentation",
    "",
    "| Resource | Description |",
    "| --- | --- |",
    "| 📚 [All Problems](docs/AllProblems.md) | Complete solution index |",
    "| 🔵 [Basic](docs/Basic.md) | Basic difficulty solutions |",
    "| 🟢 [Easy](docs/Easy.md) | Easy difficulty solutions |",
    "| 🟠 [Medium](docs/Medium.md) | Medium difficulty solutions |",
    "| 🔴 [Hard](docs/Hard.md) | Hard difficulty solutions |",
    "| 🧩 [Patterns](patterns/) | Problems grouped by solving pattern |",
    "| 📚 [Topics](topics/) | Problems grouped by topic |",
    "",
    "## 📈 Detailed Statistics",
    "",
    "Explore the complete repository analytics including:",
    "",
    "- Difficulty distribution",
    "- Platform distribution",
    "- Language usage",
    "- Pattern distribution",
    "- Topic distribution",
    "",
    "➡️ **[View Detailed Statistics](stats/progress.md)**",
    "",
    "## ⚙️ Workflow & Automation",
    "",
    "CodeSyncVault automatically keeps this repository organized:",
    "",
    "```text",
    "Accepted Solution",
    "       ↓",
    "Metadata Extraction",
    "       ↓",
    "Pattern & Topic Analysis",
    "       ↓",
    "Solution Packaging",
    "       ↓",
    "GitHub Sync",
    "       ↓",
    "Repository Index Update",
    "       ↓",
    "README & Documentation Regeneration",
    "```",
    "",
    "No manual statistics or documentation maintenance is required.",
    "",
    "## 🗂 Repository",
    "",
    "| Resource | Purpose |",
    "| --- | --- |",
    "| 📚 [.codevault/index.json](.codevault/index.json) | Repository source of truth |",
    "| 🔥 [.codevault/activity.svg](.codevault/activity.svg) | Coding activity heatmap |",
    "| 🧩 [patterns/](patterns/) | Pattern-based indexes |",
    "| 📚 [topics/](topics/) | Topic-based indexes |",
    "| 📖 [docs/](docs/) | Difficulty & problem documentation |",
    "| 📈 [stats/](stats/) | Repository statistics |",
    "",
    "---",
    "",
    "### 🤖 Powered by CodeSyncVault",
    "",
    "This README and the repository documentation are generated automatically from the CodeSyncVault repository index.",
    "",
  ].join("\n");
}

/**
 * Generates repository summary badges.
 */
function generateBadges(
  total: number,
  basic: number,
  easy: number,
  medium: number,
  hard: number,
): string {
  return [
    `[![Total Solved](https://img.shields.io/badge/Total%20Solved-${total}-6e40c9)](docs/AllProblems.md)`,
    `[![Basic](https://img.shields.io/badge/Basic-${basic}-4c9aff)](docs/Basic.md)`,
    `[![Easy](https://img.shields.io/badge/Easy-${easy}-2ea44f)](docs/Easy.md)`,
    `[![Medium](https://img.shields.io/badge/Medium-${medium}-f9a825)](docs/Medium.md)`,
    `[![Hard](https://img.shields.io/badge/Hard-${hard}-d73a49)](docs/Hard.md)`,
    `[![Powered by CodeSyncVault](https://img.shields.io/badge/Powered%20by-CodeSyncVault-6e40c9)](https://github.com/vivekkushwahaofficial/CodeSyncVault)`,
  ].join(" ");
}

/**
 * Counts solutions for one difficulty.
 */
function countByDifficulty(
  solutions: RepositorySolution[],
  difficulty: string,
): number {
  return solutions.filter(
    (solution) =>
      solution.metadata.difficulty.trim().toLowerCase() === difficulty,
  ).length;
}

/**
 * Counts one category value per solution.
 */
function countBy(
  solutions: RepositorySolution[],
  selector: (solution: RepositorySolution) => string,
): Map<string, number> {
  const counts = new Map<string, number>();

  for (const solution of solutions) {
    const value = selector(solution).trim();

    if (!value) {
      continue;
    }

    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return counts;
}

/**
 * Counts categories where a solution can
 * belong to multiple values.
 */
function countByMany(
  solutions: RepositorySolution[],
  selector: (solution: RepositorySolution) => string[],
): Map<string, number> {
  const counts = new Map<string, number>();

  for (const solution of solutions) {
    for (const rawValue of selector(solution)) {
      const value = rawValue.trim();

      if (!value) {
        continue;
      }

      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }

  return counts;
}

/**
 * Generates a structured difficulty progress table.
 */
function generateDifficultyProgressTable(
  basic: number,
  easy: number,
  medium: number,
  hard: number,
  total: number,
): string {
  const rows = [
    ["🔵 Basic", basic],
    ["🟢 Easy", easy],
    ["🟠 Medium", medium],
    ["🔴 Hard", hard],
  ] as const;

  return [
    "| Difficulty | Progress | Solved |",
    "| --- | --- | ---: |",
    ...rows.map(
      ([label, value]) =>
        `| ${label} | ${generateProgressBar(value, total)} | ${value}/${total} |`,
    ),
  ].join("\n");
}

/**
 * Generates a progress bar.
 */
function generateProgressBar(value: number, total: number): string {
  const percentage = total === 0 ? 0 : Math.round((value / total) * 100);

  const filled = Math.round((percentage / 100) * 20);

  return (
    `${"█".repeat(filled)}` + `${"░".repeat(20 - filled)}` + ` ${percentage}%`
  );
}

/**
 * Generates a category table with links
 * to generated category documents.
 */
function generateIndexTable(
  counts: Map<string, number>,
  label: string,
  directory: string,
): string {
  const entries = [...counts.entries()].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
  );

  if (entries.length === 0) {
    return `_No ${label.toLowerCase()} data yet._`;
  }

  return [
    `| ${label} | Problems |`,
    "| --- | ---: |",
    ...entries.map(([name, count]) => {
      const fileName = encodeURIComponent(`${name}.md`);

      return (
        `| [${escapeMarkdown(name)}](${directory}/${fileName}) | ` +
        `${count} |`
      );
    }),
  ].join("\n");
}

/**
 * Generates a normal count table.
 */
function generateCountTable(
  counts: Map<string, number>,
  label: string,
): string {
  const entries = [...counts.entries()].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
  );

  if (entries.length === 0) {
    return "_No data yet._";
  }

  return [
    `| ${label} | Problems |`,
    "| --- | ---: |",
    ...entries.map(
      ([name, count]) =>
        `| ${escapeMarkdown(formatPlatform(name))} | ${count} |`,
    ),
  ].join("\n");
}

/**
 * Generates the recently solved table.
 */
function generateRecentSolutions(solutions: RepositorySolution[]): string {
  if (solutions.length === 0) {
    return "_No solutions yet._";
  }

  return [
    "| Problem | Difficulty | Language | Platform | Date |",
    "| --- | --- | --- | --- | --- |",
    ...solutions.map((solution) => {
      const metadata = solution.metadata;

      const readmePath = getSolutionReadmePath(solution.path);

      return (
        `| [${escapeMarkdown(metadata.title)}](${readmePath}) | ` +
        `${capitalize(metadata.difficulty)} | ` +
        `${escapeMarkdown(metadata.language)} | ` +
        `${escapeMarkdown(formatPlatform(metadata.platform))} | ` +
        `${formatDate(solution.solvedAt)} |`
      );
    }),
  ].join("\n");
}

/**
 * Converts a repository solution path to
 * its generated README path.
 */
function getSolutionReadmePath(solutionPath: string): string {
  const readmePath = solutionPath.replace(/\/Solution\.[^/]+$/, "/README.md");

  return encodePath(readmePath);
}

/**
 * Encodes path segments while preserving
 * directory separators.
 */
function encodePath(path: string): string {
  return path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

/**
 * Formats a solved date for display.
 */
function formatDate(solvedAt?: string): string {
  if (!solvedAt) {
    return "—";
  }

  const date = new Date(solvedAt);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toISOString().slice(0, 10);
}

/**
 * Returns the solution timestamp.
 */
function getSolvedTime(solution: RepositorySolution): number {
  if (!solution.solvedAt) {
    return 0;
  }

  const timestamp = new Date(solution.solvedAt).getTime();

  return Number.isNaN(timestamp) ? 0 : timestamp;
}

/**
 * Escapes Markdown table content.
 */
function escapeMarkdown(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

/**
 * Capitalizes display text.
 */
function capitalize(value: string): string {
  if (!value) {
    return value;
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}
function formatPlatform(platform: string): string {
  const normalized = platform.trim().toLowerCase();

  const platformNames: Record<string, string> = {
    gfg: "GeeksforGeeks",
    geeksforgeeks: "GeeksforGeeks",
    leetcode: "LeetCode",
    hackerrank: "HackerRank",
    codechef: "CodeChef",
    codeforces: "Codeforces",
    atcoder: "AtCoder",
    codingninjas: "Coding Ninjas",
  };

  return platformNames[normalized] ?? platform;
}

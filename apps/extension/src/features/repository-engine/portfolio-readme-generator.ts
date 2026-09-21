import type {
  RepositoryIndex,
  RepositorySolution,
} from "./types";

/**
 * Generates the repository-level CodeSyncVault portfolio README.
 *
 * The README is derived entirely from the repository index.
 * No statistics are hardcoded.
 */
export function generatePortfolioReadme(
  index: RepositoryIndex,
): string {

  const solutions =
    index.solutions;

  const total =
    solutions.length;

  const basic =
    countByDifficulty(
      solutions,
      "basic",
    );

  const easy =
    countByDifficulty(
      solutions,
      "easy",
    );

  const medium =
    countByDifficulty(
      solutions,
      "medium",
    );

  const hard =
    countByDifficulty(
      solutions,
      "hard",
    );

  const languages =
    countBy(
      solutions,
      (solution) =>
        solution.metadata.language,
    );

  const platforms =
    countBy(
      solutions,
      (solution) =>
        solution.metadata.platform,
    );

  const patterns =
    countByMany(
      solutions,
      (solution) =>
        solution.metadata.patterns ?? [],
    );

  const topics =
    countByMany(
      solutions,
      (solution) =>
        solution.metadata.topics ?? [],
    );

  const recentSolutions =
    [...solutions]
      .sort(
        (a, b) =>
          getSolvedTime(b) -
          getSolvedTime(a),
      )
      .slice(
        0,
        10,
      );

  return [
    "# ⚡ Coding Solutions Portfolio",
    "",
    "> Automatically organized, analyzed, and updated by **CodeSyncVault**.",
    "",
    "[![CodeSyncVault](https://img.shields.io/badge/Powered%20by-CodeSyncVault-6e40c9)](https://github.com/vivekkushwahaofficial/CodeSyncVault)",
    "",
    "---",
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
    generateDifficultyProgressTable(
      basic,
      easy,
      medium,
      hard,
      total,
    ),
    "",
    "## 🔥 Coding Activity",
    "",
    "![CodeSyncVault Coding Activity](.codevault/activity.svg)",
    "",
    "## 🧩 Pattern & Topic Index",
    "",
    generateIndexTable(
      patterns,
      "Pattern",
      "patterns",
    ),
    "",
    generateIndexTable(
      topics,
      "Topic",
      "topics",
    ),
    "",
    "## 💻 Languages",
    "",
    generateCountTable(
      languages,
      "Language",
    ),
    "",
    "## 🌐 Platforms",
    "",
    generateCountTable(
      platforms,
      "Platform",
    ),
    "",
    "## 🕒 Recently Solved",
    "",
    generateRecentSolutions(
      recentSolutions,
    ),
    "",
    "## 🗂 Repository",
    "",
    "- 📚 [Solution Index](.codevault/index.json)",
    "- 🧩 [Patterns](patterns/)",
    "- 📚 [Topics](topics/)",
    "",
    "---",
    "",
    "### 🤖 Powered by CodeSyncVault",
    "",
    "This README is generated automatically from the CodeSyncVault repository index.",
    "",
  ].join("\n");
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
      solution.metadata.difficulty
        .toLowerCase() ===
      difficulty,
  ).length;
}

/**
 * Counts one category value per solution.
 */
function countBy(
  solutions: RepositorySolution[],
  selector: (
    solution: RepositorySolution,
  ) => string,
): Map<string, number> {

  const counts =
    new Map<string, number>();

  for (
    const solution of solutions
  ) {

    const value =
      selector(solution).trim();

    if (!value) {
      continue;
    }

    counts.set(
      value,
      (counts.get(value) ?? 0) + 1,
    );
  }

  return counts;
}

/**
 * Counts categories where a solution can
 * belong to multiple values.
 */
function countByMany(
  solutions: RepositorySolution[],
  selector: (
    solution: RepositorySolution,
  ) => string[],
): Map<string, number> {

  const counts =
    new Map<string, number>();

  for (
    const solution of solutions
  ) {

    for (
      const rawValue of selector(solution)
    ) {

      const value =
        rawValue.trim();

      if (!value) {
        continue;
      }

      counts.set(
        value,
        (counts.get(value) ?? 0) + 1,
      );
    }
  }

  return counts;
}

/**
 * Generates a structured difficulty progress table.
 *
 * Using a Markdown table keeps each difficulty
 * on its own row and prevents GitHub from
 * visually wrapping multiple progress bars together.
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
function generateProgressBar(
  value: number,
  total: number,
): string {

  const percentage =
    total === 0
      ? 0
      : Math.round(
        (value / total) * 100,
      );

  const filled =
    Math.round(
      (percentage / 100) * 20,
    );

  const bar =
    "█".repeat(filled) +
    "░".repeat(
      20 - filled,
    );

  return (
    `${bar} ${percentage}%`
  );
}

/**
 * Generates a category table with links
 * to the generated category documents.
 */
function generateIndexTable(
  counts: Map<string, number>,
  label: string,
  directory: string,
): string {

  const entries =
    [...counts.entries()]
      .sort(
        (a, b) =>
          b[1] - a[1] ||
          a[0].localeCompare(
            b[0],
          ),
      );

  if (
    entries.length === 0
  ) {
    return `_No ${label.toLowerCase()} data yet._`;
  }

  return [
    `| ${label} | Problems |`,
    "| --- | ---: |",
    ...entries.map(
      ([name, count]) => {

        const fileName =
          encodeURIComponent(
            `${name}.md`,
          );

        return (
          `| [${name}](${directory}/${fileName}) | ` +
          `${count} |`
        );
      },
    ),
  ].join("\n");
}

/**
 * Generates a normal count table.
 */
function generateCountTable(
  counts: Map<string, number>,
  label: string,
): string {

  const entries =
    [...counts.entries()]
      .sort(
        (a, b) =>
          b[1] - a[1] ||
          a[0].localeCompare(
            b[0],
          ),
      );

  if (
    entries.length === 0
  ) {
    return "_No data yet._";
  }

  return [
    `| ${label} | Problems |`,
    "| --- | ---: |",
    ...entries.map(
      ([name, count]) =>
        `| ${name} | ${count} |`,
    ),
  ].join("\n");
}

/**
 * Generates the recently solved table.
 */
function generateRecentSolutions(
  solutions: RepositorySolution[],
): string {

  if (
    solutions.length === 0
  ) {
    return "_No solutions yet._";
  }

  return [
    "| Problem | Difficulty | Language | Platform |",
    "| --- | --- | --- | --- |",
    ...solutions.map(
      (solution) => {

        const metadata =
          solution.metadata;

        const readmePath =
          solution.path.replace(
            /\/Solution\.[^/]+$/,
            "/README.md",
          );

        return (
          `| [${metadata.title}](${readmePath}) | ` +
          `${capitalize(metadata.difficulty)} | ` +
          `${metadata.language} | ` +
          `${metadata.platform} |`
        );
      },
    ),
  ].join("\n");
}

/**
 * Returns the solution timestamp.
 */
function getSolvedTime(
  solution: RepositorySolution,
): number {

  if (
    solution.solvedAt
  ) {
    return new Date(
      solution.solvedAt,
    ).getTime();
  }

  return 0;
}

/**
 * Capitalizes display text.
 */
function capitalize(
  value: string,
): string {

  if (!value) {
    return value;
  }

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}
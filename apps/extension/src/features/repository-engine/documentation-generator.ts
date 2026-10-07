import type { RepositoryIndex, RepositorySolution } from "./types";

/**
 * Generates all rich documentation files from
 * the repository index.
 *
 * The repository index remains the single source
 * of truth for all generated documentation.
 */
export function generateDocumentationFiles(index: RepositoryIndex): {
  path: string;
  content: string;
}[] {
  return [
    {
      path: "docs/AllProblems.md",
      content: generateAllProblems(index),
    },

    {
      path: "docs/Basic.md",
      content: generateDifficultyDocument(index, "basic", "🔵 Basic Problems"),
    },

    {
      path: "docs/Easy.md",
      content: generateDifficultyDocument(index, "easy", "🟢 Easy Problems"),
    },

    {
      path: "docs/Medium.md",
      content: generateDifficultyDocument(
        index,
        "medium",
        "🟠 Medium Problems",
      ),
    },

    {
      path: "docs/Hard.md",
      content: generateDifficultyDocument(index, "hard", "🔴 Hard Problems"),
    },

    {
      path: "stats/progress.md",
      content: generateProgressStatistics(index),
    },
  ];
}

/**
 * Generates the complete problem index.
 */
function generateAllProblems(index: RepositoryIndex): string {
  const solutions = sortSolutions(index.solutions);

  return [
    "# 📚 All Coding Problems",
    "",
    `> **${solutions.length}** problems solved across all supported platforms.`,
    "",
    "[⬅ Back to Portfolio README](../README.md)",
    "",
    "---",
    "",
    "## 📋 Problem Index",
    "",
    generateProblemTable(solutions),
    "",
    "---",
    "",
    "Generated automatically by **CodeSyncVault**.",
    "",
  ].join("\n");
}

/**
 * Generates a difficulty-specific document.
 */
function generateDifficultyDocument(
  index: RepositoryIndex,
  difficulty: string,
  title: string,
): string {
  const solutions = sortSolutions(
    index.solutions.filter(
      (solution) =>
        solution.metadata.difficulty.trim().toLowerCase() === difficulty,
    ),
  );

  return [
    `# ${title}`,
    "",
    `**Total Problems Solved:** ${solutions.length}`,
    "",
    "[⬅ Back to Portfolio README](../README.md) | [📚 All Problems](AllProblems.md) | [📈 Statistics](../stats/progress.md)",
    "",
    "---",
    "",
    generateProblemTable(solutions),
    "",
    "---",
    "",
    "Generated automatically by **CodeSyncVault**.",
    "",
  ].join("\n");
}

/**
 * Generates the main problem table used by
 * AllProblems and difficulty documents.
 */
function generateProblemTable(solutions: RepositorySolution[]): string {
  if (solutions.length === 0) {
    return "_No problems in this category yet._";
  }

  return [
    "| Problem | Difficulty | Primary Tags | Language | Platform | Solution |",
    "| --- | --- | --- | --- | --- | --- |",
    ...solutions.map((solution) => {
      const metadata = solution.metadata;

      const solutionPath = getSolutionReadmePath(solution.path);

      const tags = getPrimaryTags(solution);

      return [
        `| ${metadata.title}`,
        `${capitalize(metadata.difficulty)}`,
        tags,
        metadata.language,
        metadata.platform,
        `[View Solution](${solutionPath}) |`,
      ].join(" | ");
    }),
  ].join("\n");
}

/**
 * Generates repository-wide progress statistics.
 */
function generateProgressStatistics(index: RepositoryIndex): string {
  const solutions = index.solutions;

  const total = solutions.length;

  const basic = countDifficulty(solutions, "basic");

  const easy = countDifficulty(solutions, "easy");

  const medium = countDifficulty(solutions, "medium");

  const hard = countDifficulty(solutions, "hard");

  const platforms = countBy(
    solutions,
    (solution) => solution.metadata.platform,
  );

  const languages = countBy(
    solutions,
    (solution) => solution.metadata.language,
  );

  const patterns = countByMany(
    solutions,
    (solution) => solution.metadata.patterns ?? [],
  );

  const topics = countByMany(
    solutions,
    (solution) => solution.metadata.topics ?? [],
  );

  return [
    "# 📈 Coding Progress & Statistics",
    "",
    "> Automatically generated from `.codevault/index.json`.",
    "",
    "[⬅ Back to Portfolio README](../README.md) | [📚 All Problems](../docs/AllProblems.md)",
    "",
    "---",
    "",
    "## 🏆 Overall Progress",
    "",
    "| Metric | Count | Percentage |",
    "| --- | ---: | ---: |",
    `| 🏆 Total Solved | ${total} | 100% |`,
    `| 🔵 Basic | ${basic} | ${percentage(basic, total)}% |`,
    `| 🟢 Easy | ${easy} | ${percentage(easy, total)}% |`,
    `| 🟠 Medium | ${medium} | ${percentage(medium, total)}% |`,
    `| 🔴 Hard | ${hard} | ${percentage(hard, total)}% |`,
    "",
    "## 🎯 Difficulty Distribution",
    "",
    generateDifficultyStatistics(basic, easy, medium, hard, total),
    "",
    "## 🌐 Platform Distribution",
    "",
    generateCountTable(platforms, "Platform"),
    "",
    "## 💻 Language Distribution",
    "",
    generateCountTable(languages, "Language"),
    "",
    "## 🧩 Pattern Distribution",
    "",
    generateCountTable(patterns, "Pattern"),
    "",
    "## 📚 Topic Distribution",
    "",
    generateCountTable(topics, "Topic"),
    "",
    "---",
    "",
    "Generated automatically by **CodeSyncVault**.",
    "",
  ].join("\n");
}

/**
 * Generates difficulty progress bars.
 */
function generateDifficultyStatistics(
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
      ([label, count]) =>
        `| ${label} | ${generateProgressBar(count, total)} | ${count}/${total} |`,
    ),
  ].join("\n");
}

/**
 * Generates a text-based progress bar.
 */
function generateProgressBar(value: number, total: number): string {
  const percent = total === 0 ? 0 : Math.round((value / total) * 100);

  const filled = Math.round((percent / 100) * 20);

  return (
    `${"█".repeat(filled)}` + `${"░".repeat(20 - filled)}` + ` ${percent}%`
  );
}

/**
 * Counts solutions by a single value.
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
 * Counts values where a solution can have
 * multiple categories.
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
 * Generates a count table.
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
    ...entries.map(([name, count]) => `| ${name} | ${count} |`),
  ].join("\n");
}

/**
 * Returns the tags displayed in documentation.
 *
 * Explicit platform tags are preferred.
 * Patterns are used as a fallback.
 * Topics are used as the final fallback.
 */
function getPrimaryTags(solution: RepositorySolution): string {
  const metadata = solution.metadata;

  const tags = metadata.tags?.filter((tag) => tag.trim()) ?? [];

  if (tags.length > 0) {
    return tags.join(", ");
  }

  const patterns = metadata.patterns?.filter((pattern) => pattern.trim()) ?? [];

  if (patterns.length > 0) {
    return patterns.join(", ");
  }

  const topics = metadata.topics?.filter((topic) => topic.trim()) ?? [];

  if (topics.length > 0) {
    return topics.join(", ");
  }

  return "—";
}

/**
 * Creates a relative link from docs/*.md
 * to the solution README.
 */
function getSolutionReadmePath(solutionPath: string): string {
  const readmePath = solutionPath.replace(/\/Solution\.[^/]+$/, "/README.md");

  return `../${encodePath(readmePath)}`;
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
 * Sorts solutions by platform and title.
 */
function sortSolutions(solutions: RepositorySolution[]): RepositorySolution[] {
  return [...solutions].sort(
    (a, b) =>
      a.metadata.platform.localeCompare(b.metadata.platform) ||
      a.metadata.title.localeCompare(b.metadata.title),
  );
}

/**
 * Counts one difficulty.
 */
function countDifficulty(
  solutions: RepositorySolution[],
  difficulty: string,
): number {
  return solutions.filter(
    (solution) =>
      solution.metadata.difficulty.trim().toLowerCase() === difficulty,
  ).length;
}

/**
 * Calculates a percentage.
 */
function percentage(value: number, total: number): number {
  if (total === 0) {
    return 0;
  }

  return Math.round((value / total) * 100);
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

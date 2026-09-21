/**
 * Metadata required to generate a solution path.
 */
export interface SolutionMetadata {
  platform: string;
  difficulty: string;
  title: string;
  language: string;

  /**
   * Date when the solution was solved.
   */
  solvedAt?: string;

  /**
   * Problem topics.
   *
   * Example:
   * ["Array", "HashMap"]
   */
  topics?: string[];

  /**
   * Problem-solving patterns.
   *
   * Example:
   * ["HashMap"]
   */
  patterns?: string[];

  /**
   * Platform or problem-specific tags.
   */
  tags?: string[];

  /**
   * Time complexity.
   *
   * Example:
   * O(n)
   */
  timeComplexity?: string;

  /**
   * Space complexity.
   *
   * Example:
   * O(n)
   */
  spaceComplexity?: string;
}

/**
 * Canonical languages supported by CodeSyncVault.
 */
type NormalizedLanguage =
  | "Java"
  | "Python"
  | "JavaScript"
  | "TypeScript"
  | "C++"
  | "C"
  | "C#"
  | "Go"
  | "Rust"
  | "Kotlin"
  | "Swift"
  | "Ruby"
  | "PHP"
  | "Scala";

/**
 * Removes characters that are unsafe for
 * GitHub file and directory names.
 */
function cleanPath(
  value: string,
): string {
  return value
    .trim()
    .replace(/[<>:"/\\|?*]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Normalizes language names returned by
 * different coding platforms.
 *
 * Examples:
 *
 * Java
 * Java 17
 *
 * Python
 * Python 3
 * Python3
 * PyPy3
 *
 * C++
 * C++17
 * cpp
 * cpp17
 * gnu c++17
 *
 * JavaScript
 * javascript
 * js
 * node
 */
export function normalizeLanguage(
  language: string,
): NormalizedLanguage | null {
  const normalized =
    language
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");

  if (!normalized) {
    return null;
  }

  // --------------------------------------------------
  // Java
  // --------------------------------------------------

  if (
    normalized === "java" ||
    /^java\s*\d+/.test(normalized)
  ) {
    return "Java";
  }

  // --------------------------------------------------
  // Python
  // --------------------------------------------------

  if (
    normalized === "python" ||
    normalized === "python2" ||
    normalized === "python3" ||
    normalized === "python 2" ||
    normalized === "python 3" ||
    normalized.startsWith("python ") ||
    normalized.startsWith("pypy")
  ) {
    return "Python";
  }

  // --------------------------------------------------
  // JavaScript
  // --------------------------------------------------

  if (
    normalized === "javascript" ||
    normalized === "js" ||
    normalized === "node" ||
    normalized === "node.js" ||
    normalized.startsWith("node ")
  ) {
    return "JavaScript";
  }

  // --------------------------------------------------
  // TypeScript
  // --------------------------------------------------

  if (
    normalized === "typescript" ||
    normalized === "ts" ||
    normalized.startsWith("typescript ")
  ) {
    return "TypeScript";
  }

  // --------------------------------------------------
  // C++
  // --------------------------------------------------

  if (
    normalized === "c++" ||
    normalized.startsWith("c++") ||
    normalized === "cpp" ||
    normalized.startsWith("cpp") ||
    normalized.includes("gnu c++") ||
    normalized.includes("gcc c++")
  ) {
    return "C++";
  }

  // --------------------------------------------------
  // C#
  // --------------------------------------------------

  if (
    normalized === "c#" ||
    normalized === "csharp" ||
    normalized === "c sharp" ||
    normalized === "cs"
  ) {
    return "C#";
  }

  // --------------------------------------------------
  // C
  // --------------------------------------------------

  if (
    normalized === "c" ||
    normalized === "gnu c" ||
    /^c\s*\d+$/.test(normalized)
  ) {
    return "C";
  }

  // --------------------------------------------------
  // Go
  // --------------------------------------------------

  if (
    normalized === "go" ||
    normalized === "golang"
  ) {
    return "Go";
  }

  // --------------------------------------------------
  // Rust
  // --------------------------------------------------

  if (
    normalized === "rust" ||
    normalized.startsWith("rust ")
  ) {
    return "Rust";
  }

  // --------------------------------------------------
  // Kotlin
  // --------------------------------------------------

  if (
    normalized === "kotlin" ||
    normalized.startsWith("kotlin ")
  ) {
    return "Kotlin";
  }

  // --------------------------------------------------
  // Swift
  // --------------------------------------------------

  if (
    normalized === "swift" ||
    normalized.startsWith("swift ")
  ) {
    return "Swift";
  }

  // --------------------------------------------------
  // Ruby
  // --------------------------------------------------

  if (
    normalized === "ruby" ||
    normalized.startsWith("ruby ")
  ) {
    return "Ruby";
  }

  // --------------------------------------------------
  // PHP
  // --------------------------------------------------

  if (
    normalized === "php" ||
    normalized.startsWith("php ")
  ) {
    return "PHP";
  }

  // --------------------------------------------------
  // Scala
  // --------------------------------------------------

  if (
    normalized === "scala" ||
    normalized.startsWith("scala ")
  ) {
    return "Scala";
  }

  return null;
}

/**
 * Returns the correct source-code extension
 * for a normalized programming language.
 */
function getExtension(
  language: string,
): string {
  const normalized =
    normalizeLanguage(language);

  switch (normalized) {
    case "Java":
      return "java";

    case "Python":
      return "py";

    case "JavaScript":
      return "js";

    case "TypeScript":
      return "ts";

    case "C++":
      return "cpp";

    case "C":
      return "c";

    case "C#":
      return "cs";

    case "Go":
      return "go";

    case "Rust":
      return "rs";

    case "Kotlin":
      return "kt";

    case "Swift":
      return "swift";

    case "Ruby":
      return "rb";

    case "PHP":
      return "php";

    case "Scala":
      return "scala";

    default:
      throw new Error(
        `Unsupported programming language: "${language}"`,
      );
  }
}

/**
 * Generates the canonical GitHub path
 * for a coding solution.
 *
 * Structure:
 *
 * Platform/
 *   Language/
 *     Difficulty/
 *       Problem/
 *         Solution.ext
 *
 * Example:
 *
 * HackerRank/
 *   C++/
 *     Medium/
 *       C++-Class-Template-Specialization/
 *         Solution.cpp
 */
export function generateSolutionPath(
  metadata: SolutionMetadata,
): string {
  // Validate platform.
  if (!metadata.platform?.trim()) {
    throw new Error(
      "Cannot generate solution path: platform is missing.",
    );
  }

  // Validate title.
  if (!metadata.title?.trim()) {
    throw new Error(
      "Cannot generate solution path: problem title is missing.",
    );
  }

  // Validate language.
  if (!metadata.language?.trim()) {
    throw new Error(
      `Cannot generate solution path: programming language is missing for "${metadata.title}".`,
    );
  }

  // Normalize language.
  const language =
    normalizeLanguage(
      metadata.language,
    );

  // Never create Unknown language folders.
  if (!language) {
    throw new Error(
      `Unsupported programming language "${metadata.language}" for "${metadata.title}".`,
    );
  }

  // Clean platform name.
  const platform =
    cleanPath(metadata.platform);

  // Clean normalized language.
  const languagePath =
    cleanPath(language);

  // Use Unknown only for difficulty because
  // some platforms may genuinely omit difficulty.
  const difficulty =
    cleanPath(
      metadata.difficulty?.trim() ||
      "Unknown",
    );

  // Clean problem title.
  const title =
    cleanPath(metadata.title);

  // Determine source-code extension.
  const extension =
    getExtension(metadata.language);

  return [
    platform,
    languagePath,
    difficulty,
    title,
    `Solution.${extension}`,
  ].join("/");
}
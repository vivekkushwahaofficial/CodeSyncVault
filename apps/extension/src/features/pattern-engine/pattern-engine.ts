import type {
  PatternClassification,
  PatternEngineInput,
  PatternRuleContext,
} from "./types";

import {
  PATTERN_RULES,
} from "./rules/pattern-rules";

import {
  TOPIC_RULES,
} from "./rules/topic-rules";

const PATTERN_THRESHOLD = 55;
const TOPIC_THRESHOLD = 45;

const MAX_PATTERNS = 3;
const MAX_TOPICS = 4;
const MAX_TAGS = 8;

/**
 * Deterministic Pattern Engine.
 *
 * The engine intentionally runs locally.
 *
 * No external API.
 * No network dependency.
 * No API key.
 *
 * This makes classification:
 *
 * - fast
 * - deterministic
 * - offline
 * - privacy-friendly
 * - safe for browser-extension execution
 */
export class PatternEngine {

  /**
   * Analyzes one accepted coding solution.
   */
  static analyze(
    input: PatternEngineInput,
  ): PatternClassification {

    PatternEngine.validateInput(
      input,
    );

    const context =
      PatternEngine.createContext(
        input,
      );

    const patterns =
      PATTERN_RULES
        .map(
          (rule) => ({
            name:
              rule.name,

            score:
              rule.score(
                context,
              ),
          }),
        )
        .filter(
          (result) =>
            result.score >=
            PATTERN_THRESHOLD,
        )
        .sort(
          (a, b) =>
            b.score -
            a.score,
        )
        .slice(
          0,
          MAX_PATTERNS,
        )
        .map(
          (result) =>
            result.name,
        );

    const topics =
      TOPIC_RULES
        .map(
          (rule) => ({
            name:
              rule.name,

            score:
              rule.score(
                context,
              ),
          }),
        )
        .filter(
          (result) =>
            result.score >=
            TOPIC_THRESHOLD,
        )
        .sort(
          (a, b) =>
            b.score -
            a.score,
        )
        .slice(
          0,
          MAX_TOPICS,
        )
        .map(
          (result) =>
            result.name,
        );

    const tags =
      PatternEngine.generateTags(
        context,
        patterns,
        topics,
      );

    const timeComplexity =
      PatternEngine.inferTimeComplexity(
        patterns,
        context,
      );

    const spaceComplexity =
      PatternEngine.inferSpaceComplexity(
        patterns,
        context,
      );

    const result: PatternClassification = {
      patterns,
      topics,
      tags,
      ...(timeComplexity
        ? {
            timeComplexity,
          }
        : {}),
      ...(spaceComplexity
        ? {
            spaceComplexity,
          }
        : {}),
    };

    console.log(
      "[CodeSyncVault] Pattern Engine classification:",
      result,
    );

    return result;
  }

  /**
   * Creates a normalized rule context.
   */
  private static createContext(
    input: PatternEngineInput,
  ): PatternRuleContext {

    const problemText =
      PatternEngine.extractProblemText(
        input.problemStatement,
      );

    const sourceCode =
      input.sourceCode.trim();

    return {
      title:
        input.metadata.title.trim(),

      problemText,

      sourceCode,

      normalizedSource:
        sourceCode
          .toLowerCase(),

      normalizedProblemText:
        problemText
          .toLowerCase(),
    };
  }

  /**
   * Safely converts platform-specific problem
   * statement structures into searchable text.
   */
  private static extractProblemText(
    statement: unknown,
  ): string {

    if (
      typeof statement ===
      "string"
    ) {
      return statement.trim();
    }

    if (
      statement === null ||
      statement === undefined
    ) {
      return "";
    }

    if (
      typeof statement ===
      "object"
    ) {

      const record =
        statement as Record<
          string,
          unknown
        >;

      const preferredKeys = [
        "title",
        "description",
        "content",
        "text",
        "body",
        "statement",
      ];

      const values =
        preferredKeys
          .map(
            (key) =>
              record[key],
          )
          .filter(
            (value) =>
              typeof value ===
              "string",
          )
          .map(
            (value) =>
              String(value),
          );

      if (
        values.length > 0
      ) {
        return values.join("\n").trim();
      }
    }

    try {
      return JSON.stringify(
        statement,
      );
    } catch {
      return "";
    }
  }

  /**
   * Generates normalized tags from the
   * detected topics and patterns.
   */
  private static generateTags(
    context: PatternRuleContext,
    patterns: string[],
    topics: string[],
  ): string[] {

    const tags =
      new Set<string>();

    for (
      const pattern of patterns
    ) {
      tags.add(
        pattern,
      );
    }

    for (
      const topic of topics
    ) {
      tags.add(
        topic,
      );
    }

    if (
      /\b(sorted|sorting)\b/
        .test(
          context.normalizedProblemText,
        )
    ) {
      tags.add(
        "Sorting",
      );
    }

    if (
      /\b(subarray|subarray)\b/
        .test(
          context.normalizedProblemText,
        )
    ) {
      tags.add(
        "Subarray",
      );
    }

    if (
      /\b(substring)\b/
        .test(
          context.normalizedProblemText,
        )
    ) {
      tags.add(
        "Substring",
      );
    }

    if (
      /\b(recursion|recursive)\b/
        .test(
          context.normalizedSource,
        )
    ) {
      tags.add(
        "Recursion",
      );
    }

    if (
      /\b(binary search)\b/
        .test(
          context.normalizedProblemText,
        )
    ) {
      tags.add(
        "Binary Search",
      );
    }

    return [
      ...tags,
    ]
      .filter(
        (tag) =>
          tag.trim().length > 0,
      )
      .slice(
        0,
        MAX_TAGS,
      );
  }

  /**
   * Infers complexity only when the pattern
   * gives us a sufficiently strong signal.
   *
   * We intentionally avoid guessing.
   */
  private static inferTimeComplexity(
    patterns: string[],
    context: PatternRuleContext,
  ): string | undefined {

    if (
      patterns.includes(
        "Binary Search",
      )
    ) {
      return "O(log n)";
    }

    if (
      patterns.includes(
        "Hash Map",
      ) &&
      !PatternEngine.hasNestedLoop(
        context.sourceCode,
      )
    ) {
      return "O(n)";
    }

    if (
      patterns.includes(
        "Sliding Window",
      )
    ) {
      return "O(n)";
    }

    if (
      patterns.includes(
        "Two Pointer",
      )
    ) {
      return "O(n)";
    }

    return undefined;
  }

  /**
   * Infers auxiliary space only for patterns
   * with a strong structural guarantee.
   */
  private static inferSpaceComplexity(
    patterns: string[],
    context: PatternRuleContext,
  ): string | undefined {

    if (
      patterns.includes(
        "Hash Map",
      )
    ) {
      return "O(n)";
    }

    if (
      patterns.includes(
        "Sliding Window",
      ) &&
      /\b(set|hashset|hashmap|map|dictionary|dict)\b/
        .test(
          context.normalizedSource,
        )
    ) {
      return "O(n)";
    }

    if (
      patterns.includes(
        "Binary Search",
      )
    ) {
      return "O(1)";
    }

    if (
      patterns.includes(
        "Two Pointer",
      )
    ) {
      return "O(1)";
    }

    return undefined;
  }

  /**
   * Conservative nested-loop detector.
   *
   * This is intentionally simple. It prevents
   * us from claiming O(n) for an obvious nested
   * loop implementation.
   */
  private static hasNestedLoop(
    sourceCode: string,
  ): boolean {

    const loopCount =
      (
        sourceCode.match(
          /\b(for|while)\b/g,
        ) ?? []
      ).length;

    return loopCount >= 2;
  }

  /**
   * Validates required input.
   */
  private static validateInput(
    input: PatternEngineInput,
  ): void {

    if (!input) {
      throw new Error(
        "Pattern Engine input is missing.",
      );
    }

    if (
      !input.metadata
    ) {
      throw new Error(
        "Pattern Engine metadata is missing.",
      );
    }

    if (
      !input.metadata.title?.trim()
    ) {
      throw new Error(
        "Pattern Engine problem title is missing.",
      );
    }

    if (
      !input.sourceCode?.trim()
    ) {
      throw new Error(
        `Pattern Engine source code is missing for "${input.metadata.title}".`,
      );
    }
  }
}
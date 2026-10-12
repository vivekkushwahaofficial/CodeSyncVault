import type { SolutionMetadata } from "../github/sync/solution-path-generator";

export interface PatternEngineInput {
  /**
   * Normalized platform metadata.
   */
  metadata: SolutionMetadata;

  /**
   * Submitted source code.
   */
  sourceCode: string;

  /**
   * Platform-provided problem statement.
   *
   * Kept platform-agnostic because different
   * adapters may expose different statement shapes.
   */
  problemStatement: unknown;
}

export interface PatternClassification {
  /**
   * Detected problem-solving patterns.
   */
  patterns: string[];

  /**
   * Detected DSA topics.
   */
  topics: string[];

  /**
   * Relevant problem/source tags.
   */
  tags: string[];

  /**
   * Complexity when it can be inferred
   * with reasonable confidence.
   */
  timeComplexity?: string;

  /**
   * Complexity when it can be inferred
   * with reasonable confidence.
   */
  spaceComplexity?: string;
}

export interface PatternRuleContext {
  title: string;

  /**
   * Official/platform-provided metadata tags.
   *
   * Example:
   * LeetCode -> Array, Hash Table, Two Pointers
   */
  metadataTags: string[];

  problemText: string;

  sourceCode: string;

  normalizedSource: string;

  normalizedProblemText: string;
}

export interface PatternRule {
  name: string;

  /**
   * Returns a score from 0 to 100.
   */
  score(context: PatternRuleContext): number;
}

export interface TopicRule {
  name: string;

  /**
   * Returns a score from 0 to 100.
   */
  score(context: PatternRuleContext): number;
}

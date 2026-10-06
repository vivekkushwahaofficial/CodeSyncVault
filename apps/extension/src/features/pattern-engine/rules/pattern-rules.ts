import type { PatternRule, PatternRuleContext } from "../types";

/**
 * Pattern detection rules.
 *
 * Classification priority:
 *
 * 1. Official platform metadata
 * 2. Problem-statement semantics
 * 3. Strong generic source-code structure
 * 4. Language/library syntax as supporting evidence
 *
 * The rules intentionally avoid depending on a single
 * programming language or platform.
 */

const hasAny = (text: string, patterns: RegExp[]): boolean =>
  patterns.some((pattern) => pattern.test(text));

const hasComparison = (source: string): boolean => /[<>]=?|==|!=/.test(source);

const hasLoop = (source: string): boolean =>
  /\b(for|while|foreach)\b/.test(source);

const hasConditional = (source: string): boolean =>
  /\b(if|else|switch|case)\b/.test(source);

const hasIndexAccess = (source: string): boolean => /\[[^\]]+\]/.test(source);

const hasAssignment = (source: string): boolean =>
  /(?:^|[;\n{}])\s*[A-Za-z_]\w*\s*=/.test(source);

const hasIncrementOrDecrement = (source: string): boolean =>
  /(?:\+\+|--|\+=\s*1|-=\s*1)/.test(source);

const hasNestedLoop = (source: string): boolean =>
  (source.match(/\b(for|while|foreach)\b/g) ?? []).length >= 2;

const hasMetadataTag = (tags: string[], names: string[]): boolean => {
  const normalizedTags = tags.map((tag) => tag.trim().toLowerCase());

  return names.some((name) => normalizedTags.includes(name.toLowerCase()));
};

const hasProblemSignal = (problemText: string, patterns: RegExp[]): boolean =>
  hasAny(problemText, patterns);

/**
 * Detects pointer/index movement.
 *
 * Supports common forms across languages without
 * depending on variable names.
 */
const hasIndexMovement = (source: string): boolean =>
  hasIncrementOrDecrement(source) || /\[[^\]]+\]\s*(?:\+\+|--)/.test(source);

/**
 * Detects multiple independently assigned index-like
 * variables without requiring names such as left/right.
 *
 * This supports declaration-based languages and
 * assignment-based languages such as Python.
 */
const hasMultipleIndexVariables = (source: string): boolean => {
  const declaredVariables = [
    ...source.matchAll(
      /\b(?:int|long|short|double|float|boolean|bool|string|var|let|const|auto)\s+([A-Za-z_]\w*)/g,
    ),
  ].map((match) => match[1]);

  const assignedVariables = [
    ...source.matchAll(/(?:^|[;\n])\s*([A-Za-z_]\w*)\s*=\s*[^=\n]+/g),
  ].map((match) => match[1]);

  return new Set([...declaredVariables, ...assignedVariables]).size >= 2;
};

/**
 * Detects midpoint-style arithmetic.
 */
const hasMidpointCalculation = (source: string): boolean =>
  /\([^()]+\s*\+\s*[^()]+\)\s*\/\s*2/.test(source) ||
  /\bmid(?:d)?\s*=/.test(source) ||
  /\bmid(?:d)?\s*:=/.test(source);

/**
 * Detects binary-search-style boundary updates.
 */
const hasBinarySearchBoundaries = (source: string): boolean =>
  /\b(?:low|lo|left|l|high|hi|right|r)\b\s*=\s*[^;\n]+(?:\+|-)\s*1\b/.test(
    source,
  );

/**
 * Detects recursive structure conservatively.
 */
const hasRecursiveStructure = (source: string): boolean => {
  const declarations = [
    ...source.matchAll(
      /\b(?:function\s+|(?:int|long|double|float|boolean|bool|string|void|auto)\s+)([A-Za-z_]\w*)\s*\(/g,
    ),
  ].map((match) => match[1]);

  return declarations.some((name) => {
    if (!name) {
      return false;
    }

    const declaration = new RegExp(`\\b${name}\\s*\\(`);

    const body = source.replace(declaration, "");

    return new RegExp(`\\b${name}\\s*\\(`).test(body);
  });
};

/**
 * Detects stack-like source structure.
 *
 * Stronger than simply checking for array access and
 * a loop. A stack normally has insertion/removal at
 * one end.
 */
const hasStackStructure = (source: string): boolean =>
  hasAny(source, [
    /\bpush\s*\(/,
    /\bpop\s*\(/,
    /\bpeek\s*\(/,
    /\btop\s*\(/,
    /\bpush_back\s*\(/,
    /\bpop_back\s*\(/,
    /\.append\s*\(/,
  ]) || /\b(?:stack|stk)\b/.test(source);

/**
 * Detects queue-like source structure.
 */
const hasQueueStructure = (source: string): boolean =>
  hasAny(source, [
    /\benqueue\s*\(/,
    /\bdequeue\s*\(/,
    /\bpeek\s*\(/,
    /\bpoll\s*\(/,
    /\boffer\s*\(/,
    /\bpush\s*\(/,
  ]) || /\b(?:queue|deque|q)\b/.test(source);

/**
 * Detects map/dictionary usage using common
 * language-independent lookup concepts.
 */
const hasMapStructure = (source: string): boolean =>
  hasAny(source, [
    /\b(?:get|put|set|has|contains|lookup)\s*\(/,
    /\b(?:unordered_map|HashMap|Dictionary|dict|Map)\b/i,
  ]) || /\[[^\]]+\]/.test(source);

/**
 * Detects stronger heap evidence.
 */
const hasHeapStructure = (source: string): boolean =>
  hasAny(source, [
    /\b(?:heap|priorityqueue|priority_queue|priority queue)\b/i,
    /\b(?:heappush|heappop|heapify)\s*\(/i,
    /\b(?:offer|poll)\s*\(/i,
  ]);

/**
 * Detects sorting evidence.
 */
const hasSortingStructure = (source: string): boolean =>
  /\b(?:sort|sorted|sorting)\b/i.test(source);

/**
 * Detects graph traversal structure.
 */
const hasTraversalStructure = (source: string): boolean =>
  hasLoop(source) || hasRecursiveStructure(source);

export const PATTERN_RULES: PatternRule[] = [
  {
    name: "Hash Map",

    score: ({ metadataTags, normalizedProblemText, normalizedSource }) => {
      let score = 0;

      if (
        hasMetadataTag(metadataTags, [
          "Hash Table",
          "Hash Map",
          "Hashing",
          "Dictionary",
        ])
      ) {
        score += 100;
      }

      if (
        hasProblemSignal(normalizedProblemText, [
          /\bhash tables?\b/,
          /\bhash map\b/,
          /\bfrequency map\b/,
          /\bdictionary\b/,
          /\bassociative array\b/,
          /\blookup table\b/,
        ])
      ) {
        score += 55;
      }

      if (
        /\b(two sum|two numbers|complement|frequency|frequencies|count occurrences|duplicate|lookup)\b/.test(
          normalizedProblemText,
        )
      ) {
        score += 25;
      }

      if (hasMapStructure(normalizedSource)) {
        score += 15;
      }

      return Math.min(score, 100);
    },
  },

  {
    name: "Two Pointer",

    score: ({ metadataTags, normalizedProblemText, normalizedSource }) => {
      let score = 0;

      if (hasMetadataTag(metadataTags, ["Two Pointers", "Two Pointer"])) {
        score += 100;
      }

      if (
        hasProblemSignal(normalizedProblemText, [
          /\btwo pointer/,
          /\btwo pointers/,
          /\bopposite ends\b/,
          /\btwo indices\b/,
          /\btwo positions\b/,
          /\bleft and right pointers?\b/,
        ])
      ) {
        score += 60;
      }

      if (
        /\b(?:sorted array|sorted list|two ends|opposite ends)\b/.test(
          normalizedProblemText,
        )
      ) {
        score += 20;
      }

      if (
        hasMultipleIndexVariables(normalizedSource) &&
        hasIndexMovement(normalizedSource)
      ) {
        score += 25;
      }

      if (
        hasComparison(normalizedSource) &&
        hasIndexAccess(normalizedSource) &&
        hasIndexMovement(normalizedSource)
      ) {
        score += 15;
      }

      return Math.min(score, 100);
    },
  },

  {
    name: "Sliding Window",

    score: ({ metadataTags, normalizedProblemText, normalizedSource }) => {
      let score = 0;

      if (hasMetadataTag(metadataTags, ["Sliding Window"])) {
        score += 100;
      }

      if (
        /\b(sliding window|contiguous|substring|subarray|continuous segment)\b/.test(
          normalizedProblemText,
        )
      ) {
        score += 50;
      }

      if (
        /\b(longest|shortest|maximum|minimum)\b/.test(normalizedProblemText)
      ) {
        score += 15;
      }

      if (hasLoop(normalizedSource) && hasIndexAccess(normalizedSource)) {
        score += 15;
      }

      if (hasIndexMovement(normalizedSource)) {
        score += 15;
      }

      return Math.min(score, 100);
    },
  },

  {
    name: "Binary Search",

    score: ({
      metadataTags,
      title,
      normalizedProblemText,
      normalizedSource,
    }) => {
      let score = 0;

      if (hasMetadataTag(metadataTags, ["Binary Search"])) {
        score += 100;
      }

      if (
        /\b(binary search|search space|search efficiently|find position|insert position)\b/.test(
          normalizedProblemText,
        )
      ) {
        score += 55;
      }

      if (/\bmedian of two sorted arrays\b/.test(title.toLowerCase())) {
        score += 35;
      }

      if (hasMidpointCalculation(normalizedSource)) {
        score += 25;
      }

      if (
        hasBinarySearchBoundaries(normalizedSource) &&
        hasComparison(normalizedSource)
      ) {
        score += 25;
      }

      return Math.min(score, 100);
    },
  },

  {
    name: "Stack",

    score: ({ metadataTags, normalizedProblemText, normalizedSource }) => {
      let score = 0;

      if (hasMetadataTag(metadataTags, ["Stack"])) {
        score += 100;
      }

      if (
        /\b(stack|parentheses|brackets|balanced|nested expressions|undo)\b/.test(
          normalizedProblemText,
        )
      ) {
        score += 50;
      }

      if (hasStackStructure(normalizedSource)) {
        score += 25;
      }

      return Math.min(score, 100);
    },
  },

  {
    name: "Monotonic Stack",

    score: ({ metadataTags, normalizedProblemText, normalizedSource }) => {
      let score = 0;

      if (hasMetadataTag(metadataTags, ["Monotonic Stack"])) {
        score += 100;
      }

      if (
        /\b(next greater|next smaller|previous greater|previous smaller|monotonic stack)\b/.test(
          normalizedProblemText,
        )
      ) {
        score += 65;
      }

      if (
        hasStackStructure(normalizedSource) &&
        hasComparison(normalizedSource)
      ) {
        score += 25;
      }

      return Math.min(score, 100);
    },
  },

  {
    name: "BFS",

    score: ({ metadataTags, normalizedProblemText, normalizedSource }) => {
      let score = 0;

      if (
        hasMetadataTag(metadataTags, [
          "Breadth-First Search",
          "Breadth First Search",
          "BFS",
        ])
      ) {
        score += 100;
      }

      if (
        /\b(breadth first|breadth-first|bfs|level order|level by level)\b/.test(
          normalizedProblemText,
        )
      ) {
        score += 65;
      }

      if (
        /\b(shortest path|minimum steps|minimum distance)\b/.test(
          normalizedProblemText,
        )
      ) {
        score += 15;
      }

      if (hasQueueStructure(normalizedSource)) {
        score += 20;
      }

      return Math.min(score, 100);
    },
  },

  {
    name: "DFS",

    score: ({ metadataTags, normalizedProblemText, normalizedSource }) => {
      let score = 0;

      if (
        hasMetadataTag(metadataTags, [
          "Depth-First Search",
          "Depth First Search",
          "DFS",
        ])
      ) {
        score += 100;
      }

      if (
        /\b(depth first|depth-first|dfs|recursive traversal)\b/.test(
          normalizedProblemText,
        )
      ) {
        score += 65;
      }

      if (hasRecursiveStructure(normalizedSource)) {
        score += 20;
      }

      if (hasTraversalStructure(normalizedSource)) {
        score += 10;
      }

      return Math.min(score, 100);
    },
  },

  {
    name: "Dynamic Programming",

    score: ({ metadataTags, normalizedProblemText, normalizedSource }) => {
      let score = 0;

      if (hasMetadataTag(metadataTags, ["Dynamic Programming", "DP"])) {
        score += 100;
      }

      if (
        /\b(dynamic programming|memoization|tabulation|optimal substructure|overlapping subproblems)\b/.test(
          normalizedProblemText,
        )
      ) {
        score += 65;
      }

      if (
        /\b(dp|memo|memoization|cache|state|transition)\b/.test(
          normalizedSource,
        )
      ) {
        score += 20;
      }

      if (hasIndexAccess(normalizedSource) && hasAssignment(normalizedSource)) {
        score += 15;
      }

      return Math.min(score, 100);
    },
  },

  {
    name: "Greedy",

    score: ({ metadataTags, normalizedProblemText, normalizedSource }) => {
      let score = 0;

      if (hasMetadataTag(metadataTags, ["Greedy"])) {
        score += 100;
      }

      if (
        /\b(greedy|locally optimal|interval scheduling|maximum number|minimum number)\b/.test(
          normalizedProblemText,
        )
      ) {
        score += 65;
      }

      if (hasSortingStructure(normalizedSource)) {
        score += 15;
      }

      return Math.min(score, 100);
    },
  },

  {
    name: "Backtracking",

    score: ({ metadataTags, normalizedProblemText, normalizedSource }) => {
      let score = 0;

      if (hasMetadataTag(metadataTags, ["Backtracking"])) {
        score += 100;
      }

      if (
        /\b(backtracking|permutations|combinations|subsets|n-queens|generate all|all possible)\b/.test(
          normalizedProblemText,
        )
      ) {
        score += 60;
      }

      if (/\b(choose|unchoose|backtrack)\b/.test(normalizedSource)) {
        score += 20;
      }

      if (hasRecursiveStructure(normalizedSource)) {
        score += 20;
      }

      return Math.min(score, 100);
    },
  },

  {
    name: "Heap",

    score: ({ metadataTags, normalizedProblemText, normalizedSource }) => {
      let score = 0;

      if (hasMetadataTag(metadataTags, ["Heap", "Priority Queue"])) {
        score += 100;
      }

      if (
        /\b(heap|priority queue|kth largest|kth smallest|top k)\b/.test(
          normalizedProblemText,
        )
      ) {
        score += 65;
      }

      if (hasHeapStructure(normalizedSource)) {
        score += 25;
      }

      return Math.min(score, 100);
    },
  },

  {
    name: "Prefix Sum",

    score: ({ metadataTags, normalizedProblemText, normalizedSource }) => {
      let score = 0;

      if (hasMetadataTag(metadataTags, ["Prefix Sum"])) {
        score += 100;
      }

      if (
        /\b(prefix sum|range sum|subarray sum|cumulative sum|running sum)\b/.test(
          normalizedProblemText,
        )
      ) {
        score += 65;
      }

      if (
        /\b(prefix|presum|prefixsum|runningsum|cumulative)\b/.test(
          normalizedSource,
        )
      ) {
        score += 15;
      }

      if (hasIndexAccess(normalizedSource) && hasAssignment(normalizedSource)) {
        score += 10;
      }

      return Math.min(score, 100);
    },
  },

  {
    name: "Union Find",

    score: ({ metadataTags, normalizedProblemText, normalizedSource }) => {
      let score = 0;

      if (hasMetadataTag(metadataTags, ["Union Find", "Disjoint Set"])) {
        score += 100;
      }

      if (
        /\b(union find|disjoint set|connected components)\b/.test(
          normalizedProblemText,
        )
      ) {
        score += 65;
      }

      if (/\b(parent|rank|representative|component)\b/.test(normalizedSource)) {
        score += 20;
      }

      return Math.min(score, 100);
    },
  },

  {
    name: "Trie",

    score: ({ metadataTags, normalizedProblemText, normalizedSource }) => {
      let score = 0;

      if (hasMetadataTag(metadataTags, ["Trie"])) {
        score += 100;
      }

      if (
        /\b(trie|prefix tree|autocomplete|word dictionary)\b/.test(
          normalizedProblemText,
        )
      ) {
        score += 65;
      }

      if (/\b(trie|trienode|children|prefix)\b/.test(normalizedSource)) {
        score += 20;
      }

      if (hasIndexAccess(normalizedSource)) {
        score += 10;
      }

      return Math.min(score, 100);
    },
  },

  {
    name: "Sorting",

    score: ({ metadataTags, normalizedProblemText, normalizedSource }) => {
      let score = 0;

      if (hasMetadataTag(metadataTags, ["Sorting"])) {
        score += 100;
      }

      if (
        /\b(sort|sorted|sorting|order|ordered)\b/.test(normalizedProblemText)
      ) {
        score += 50;
      }

      if (hasSortingStructure(normalizedSource)) {
        score += 35;
      }

      return Math.min(score, 100);
    },
  },
];

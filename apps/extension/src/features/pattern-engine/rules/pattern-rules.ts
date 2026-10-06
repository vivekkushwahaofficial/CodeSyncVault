import type { PatternRule } from "../types";

const hasAny = (text: string, patterns: RegExp[]): boolean =>
  patterns.some((pattern) => pattern.test(text));

const hasAll = (text: string, patterns: RegExp[]): boolean =>
  patterns.every((pattern) => pattern.test(text));

const hasComparison = (source: string): boolean => /[<>]=?/.test(source);

/**
 * Detects the classic midpoint calculation used
 * by binary-search implementations.
 *
 * Supports:
 *
 * start + (end - start) / 2
 * first + (last - first) / 2
 * low + (high - low) / 2
 * lo + (hi - lo) / 2
 */
const hasMidpointCalculation = (source: string): boolean =>
  /\b(?:start|first|low|lo)\s*\+\s*\(?\s*(?:end|last|high|hi)\s*-\s*(?:start|first|low|lo)\s*\)?\s*\/\s*2\b/.test(
    source,
  ) ||
  /\b(?:start|first|low|lo)\s*\+\s*\(\s*(?:end|last|high|hi)\s*-\s*(?:start|first|low|lo)\s*\)\s*\/\s*2\b/.test(
    source,
  );

/**
 * Detects the characteristic binary-search movement:
 *
 * start = mid + 1
 * end   = mid - 1
 *
 * Also supports first/last and low/high naming.
 */
const hasBinarySearchBoundaryUpdate = (source: string): boolean =>
  /\b(?:start|first|low|lo)\s*=\s*mid(?:\d*|d)?\s*\+\s*1\b/.test(source) ||
  /\b(?:end|last|high|hi)\s*=\s*mid(?:\d*|d)?\s*-\s*1\b/.test(source) ||
  /\b(?:start|first|low|lo)\s*=\s*mid(?:\d*|d)?\b/.test(source) ||
  /\b(?:end|last|high|hi)\s*=\s*mid(?:\d*|d)?\b/.test(source);

/**
 * Detects an interval-search loop.
 */
const hasBinarySearchLoop = (source: string): boolean =>
  /\b(?:while|for)\s*\([^)]*\b(?:start|first|low|lo|end|last|high|hi)\b[^)]*\)/.test(
    source,
  );

const hasStackOperations = (source: string): boolean =>
  /\.push\(|\.pop\(|\.peek\(|\.top\(|\.push_back\(|\.pop_back\(/.test(source);

const hasQueueOperations = (source: string): boolean =>
  /\.offer\(|\.poll\(|\.add\(|\.remove\(|\.enqueue\(|\.dequeue\(/.test(source);

const hasHashLookup = (source: string): boolean =>
  /\.get\(|\.put\(|\.containsKey\(|\.contains\(|\.has\(|\[[^]]+\]/.test(source);

const hasLeftRightMovement = (source: string): boolean =>
  /\b(?:left|right|lo|hi|start|end)\s*(?:\+\+|--|\+=\s*1|-= \s*1)/.test(source);

const hasRecursiveCall = (source: string): boolean => {
  const methodNames =
    source.match(
      /\b(?:void|boolean|int|long|double|float|char|string)\s+([a-zA-Z_]\w*)\s*\(/g,
    ) ?? [];

  return methodNames.some((declaration) => {
    const match = declaration.match(/\s([a-zA-Z_]\w*)\s*\(/);

    return match
      ? new RegExp(`\\b${match[1]}\\s*\\(`).test(
          source.replace(declaration, ""),
        )
      : false;
  });
};

export const PATTERN_RULES: PatternRule[] = [
  // --------------------------------------------------
  // Hash Map
  // --------------------------------------------------

  {
    name: "Hash Map",

    score: ({ normalizedProblemText, normalizedSource }) => {
      let score = 0;

      if (
        /\b(hashmap|unordered_map|dictionary|dict|map)\b/.test(normalizedSource)
      ) {
        score += 50;
      }

      if (hasHashLookup(normalizedSource)) {
        score += 25;
      }

      if (
        /\b(two sum|frequency|frequencies|count occurrences|duplicate|lookup|complement)\b/.test(
          normalizedProblemText,
        )
      ) {
        score += 30;
      }

      if (/\b(seen|lookup|containskey|contains|has)\b/.test(normalizedSource)) {
        score += 15;
      }

      return Math.min(score, 100);
    },
  },

  // --------------------------------------------------
  // Two Pointer
  // --------------------------------------------------

  {
    name: "Two Pointer",

    score: ({ normalizedProblemText, normalizedSource }) => {
      let score = 0;

      if (/\b(left|right|lo|hi)\b/.test(normalizedSource)) {
        score += 15;
      }

      if (
        /\b(two pointer|two pointers|sorted array|pair|opposite ends)\b/.test(
          normalizedProblemText,
        )
      ) {
        score += 45;
      }

      if (/\bwhile\s*\([^)]*(left|right|lo|hi)[^)]*\)/.test(normalizedSource)) {
        score += 20;
      }

      if (hasLeftRightMovement(normalizedSource)) {
        score += 20;
      }

      if (/\b(?:left|right)\s*[\+\-]=?\s*1\b/.test(normalizedSource)) {
        score += 15;
      }

      return Math.min(score, 100);
    },
  },

  // --------------------------------------------------
  // Sliding Window
  // --------------------------------------------------

  {
    name: "Sliding Window",

    score: ({ normalizedProblemText, normalizedSource }) => {
      let score = 0;

      if (
        /\b(sliding window|substring|subarray|contiguous)\b/.test(
          normalizedProblemText,
        )
      ) {
        score += 35;
      }

      if (/\b(left|right|windowstart|windowend)\b/.test(normalizedSource)) {
        score += 15;
      }

      if (
        /\bwhile\s*\([^)]*(left|right|window)[^)]*\)/.test(normalizedSource)
      ) {
        score += 20;
      }

      if (/\b(?:right|left)\s*(?:\+\+|\+=\s*1)\b/.test(normalizedSource)) {
        score += 20;
      }

      if (
        /\b(?:left|right)\s*=\s*(?:left|right)\s*\+\s*1\b/.test(
          normalizedSource,
        )
      ) {
        score += 10;
      }

      if (
        /\bfor\s*\([^;]*\b(?:left|right)\b[^;]*;[^;]*;[^)]*\b(?:left|right)\+\+/.test(
          normalizedSource,
        )
      ) {
        score += 10;
      }

      return Math.min(score, 100);
    },
  },

  // --------------------------------------------------
  // Binary Search
  // --------------------------------------------------

  {
    name: "Binary Search",

    score: ({ title, normalizedProblemText, normalizedSource }) => {
      let score = 0;

      /*
       * Problem-level signal.
       *
       * This is useful, but deliberately NOT required.
       */
      if (
        /\b(binary search|sorted array|sorted list|search efficiently|find position|insert position)\b/.test(
          normalizedProblemText,
        )
      ) {
        score += 25;
      }

      if (/\bmedian of two sorted arrays\b/.test(title.toLowerCase())) {
        score += 25;
      }

      /*
       * Structural signals.
       */

      // mid / middle variable.
      if (/\bmid(?:\d*|d)?\b|\bmiddle\b/.test(normalizedSource)) {
        score += 20;
      }

      // A pair of search boundaries.
      if (
        hasAny(normalizedSource, [
          /\b(?:start|first|low|lo)\b/,
          /\b(?:end|last|high|hi)\b/,
        ]) &&
        hasAll(normalizedSource, [
          /\b(?:start|first|low|lo)\b/,
          /\b(?:end|last|high|hi)\b/,
        ])
      ) {
        score += 15;
      }

      // Classic midpoint calculation.
      if (hasMidpointCalculation(normalizedSource)) {
        score += 25;
      }

      // Boundary movement based on mid.
      if (hasBinarySearchBoundaryUpdate(normalizedSource)) {
        score += 30;
      }

      // Search interval loop.
      if (hasBinarySearchLoop(normalizedSource)) {
        score += 10;
      }

      // Partition-based binary search variants.
      if (/\bpartition\b/.test(normalizedSource)) {
        score += 15;
      }

      return Math.min(score, 100);
    },
  },

  // --------------------------------------------------
  // Stack
  // --------------------------------------------------

  {
    name: "Stack",

    score: ({ normalizedProblemText, normalizedSource }) => {
      let score = 0;

      if (
        /\b(stack|parentheses|brackets|balanced)\b/.test(normalizedProblemText)
      ) {
        score += 40;
      }

      if (/\b(stack|deque|arraydeque)\b/.test(normalizedSource)) {
        score += 30;
      }

      if (hasStackOperations(normalizedSource)) {
        score += 30;
      }

      return Math.min(score, 100);
    },
  },

  // --------------------------------------------------
  // Monotonic Stack
  // --------------------------------------------------

  {
    name: "Monotonic Stack",

    score: ({ normalizedProblemText, normalizedSource }) => {
      let score = 0;

      if (
        /\b(next greater|next smaller|previous greater|previous smaller|monotonic)\b/.test(
          normalizedProblemText,
        )
      ) {
        score += 50;
      }

      if (/\b(stack|deque|arraydeque)\b/.test(normalizedSource)) {
        score += 15;
      }

      /*
       * Strong structural signal:
       *
       * while + pop + comparison
       *
       * This is characteristic of a monotonic-stack
       * maintenance loop.
       */
      if (
        /\bwhile\b/.test(normalizedSource) &&
        /\.pop\(\)/.test(normalizedSource) &&
        hasComparison(normalizedSource)
      ) {
        score += 45;
      }

      return Math.min(score, 100);
    },
  },

  // --------------------------------------------------
  // BFS
  // --------------------------------------------------

  {
    name: "BFS",

    score: ({ normalizedProblemText, normalizedSource }) => {
      let score = 0;

      if (
        /\b(breadth first|bfs|level order|shortest path)\b/.test(
          normalizedProblemText,
        )
      ) {
        score += 45;
      }

      if (/\b(queue|deque|linkedlist|arraydeque)\b/.test(normalizedSource)) {
        score += 25;
      }

      if (hasQueueOperations(normalizedSource)) {
        score += 20;
      }

      if (/\b(visited|level|distance)\b/.test(normalizedSource)) {
        score += 15;
      }

      return Math.min(score, 100);
    },
  },

  // --------------------------------------------------
  // DFS
  // --------------------------------------------------

  {
    name: "DFS",

    score: ({ normalizedProblemText, normalizedSource }) => {
      let score = 0;

      if (
        /\b(depth first|dfs|recursive|recursion|backtrack)\b/.test(
          normalizedProblemText,
        )
      ) {
        score += 40;
      }

      if (/\bdfs\b|visited/.test(normalizedSource)) {
        score += 25;
      }

      if (hasRecursiveCall(normalizedSource)) {
        score += 25;
      }

      if (/\bvisited\b/.test(normalizedSource)) {
        score += 15;
      }

      return Math.min(score, 100);
    },
  },

  // --------------------------------------------------
  // Dynamic Programming
  // --------------------------------------------------

  {
    name: "Dynamic Programming",

    score: ({ normalizedProblemText, normalizedSource }) => {
      let score = 0;

      if (
        /\b(dynamic programming|dp|memoization|tabulation|subproblem|optimal substructure)\b/.test(
          normalizedProblemText,
        )
      ) {
        score += 45;
      }

      if (/\b(dp|memo|memoization|cache)\b/.test(normalizedSource)) {
        score += 30;
      }

      if (
        /\b(?:int|long|boolean)\s*\[\]\s*(?:dp|memo)\b|vector<.*>\s*(?:dp|memo)\b/.test(
          normalizedSource,
        )
      ) {
        score += 20;
      }

      if (/\b(?:dp|memo)\s*\[[^]]+\]\s*=/.test(normalizedSource)) {
        score += 20;
      }

      return Math.min(score, 100);
    },
  },

  // --------------------------------------------------
  // Greedy
  // --------------------------------------------------

  {
    name: "Greedy",

    score: ({ normalizedProblemText, normalizedSource }) => {
      let score = 0;

      if (
        /\b(greedy|maximum number|minimum number|locally optimal|interval scheduling)\b/.test(
          normalizedProblemText,
        )
      ) {
        score += 50;
      }

      if (/\bsort(ed|ing)?\b/.test(normalizedSource)) {
        score += 15;
      }

      return Math.min(score, 100);
    },
  },

  // --------------------------------------------------
  // Backtracking
  // --------------------------------------------------

  {
    name: "Backtracking",

    score: ({ normalizedProblemText, normalizedSource }) => {
      let score = 0;

      if (
        /\b(backtracking|permutation|permutations|combination|combinations|subsets|n-queens)\b/.test(
          normalizedProblemText,
        )
      ) {
        score += 45;
      }

      if (/\b(backtrack|choose|unchoose)\b/.test(normalizedSource)) {
        score += 30;
      }

      if (/\brecursive\b|return\s+dfs/.test(normalizedSource)) {
        score += 15;
      }

      if (hasRecursiveCall(normalizedSource)) {
        score += 15;
      }

      return Math.min(score, 100);
    },
  },

  // --------------------------------------------------
  // Heap
  // --------------------------------------------------

  {
    name: "Heap",

    score: ({ normalizedProblemText, normalizedSource }) => {
      let score = 0;

      if (
        /\b(heap|priority queue|kth largest|kth smallest|top k)\b/.test(
          normalizedProblemText,
        )
      ) {
        score += 50;
      }

      if (
        /\b(priorityqueue|priority_queue|heapq|heap)\b/.test(normalizedSource)
      ) {
        score += 40;
      }

      if (
        /\b(offer|poll|add|remove)\b/.test(normalizedSource) &&
        /\b(priorityqueue|priority_queue)\b/.test(normalizedSource)
      ) {
        score += 15;
      }

      return Math.min(score, 100);
    },
  },

  // --------------------------------------------------
  // Prefix Sum
  // --------------------------------------------------

  {
    name: "Prefix Sum",

    score: ({ normalizedProblemText, normalizedSource }) => {
      let score = 0;

      if (
        /\b(prefix sum|range sum|subarray sum)\b/.test(normalizedProblemText)
      ) {
        score += 50;
      }

      if (/\b(prefix|prefixsum|presum|runningsum)\b/.test(normalizedSource)) {
        score += 30;
      }

      if (/\b(?:sum|prefix)\s*\[[^]]+\]\s*=/.test(normalizedSource)) {
        score += 15;
      }

      return Math.min(score, 100);
    },
  },

  // --------------------------------------------------
  // Union Find
  // --------------------------------------------------

  {
    name: "Union Find",

    score: ({ normalizedProblemText, normalizedSource }) => {
      let score = 0;

      if (
        /\b(union find|disjoint set|connected components)\b/.test(
          normalizedProblemText,
        )
      ) {
        score += 55;
      }

      if (/\b(parent|find|union|rank|size)\b/.test(normalizedSource)) {
        score += 15;
      }

      if (
        /\b(?:union|find)\s*\(/.test(normalizedSource) &&
        /\bparent\b/.test(normalizedSource)
      ) {
        score += 30;
      }

      return Math.min(score, 100);
    },
  },

  // --------------------------------------------------
  // Trie
  // --------------------------------------------------

  {
    name: "Trie",

    score: ({ normalizedProblemText, normalizedSource }) => {
      let score = 0;

      if (/\b(trie|prefix tree|autocomplete)\b/.test(normalizedProblemText)) {
        score += 60;
      }

      if (/\b(trienode|trie|children)\b/.test(normalizedSource)) {
        score += 25;
      }

      if (/\bchildren\s*\[/.test(normalizedSource)) {
        score += 15;
      }

      return Math.min(score, 100);
    },
  },

  // --------------------------------------------------
  // Sorting
  // --------------------------------------------------

  {
    name: "Sorting",

    score: ({ normalizedProblemText, normalizedSource }) => {
      let score = 0;

      if (/\b(sort|sorted|sorting|order)\b/.test(normalizedProblemText)) {
        score += 35;
      }

      if (/\.sort\(|arrays\.sort|sort\(/.test(normalizedSource)) {
        score += 45;
      }

      return Math.min(score, 100);
    },
  },
];

import { PatternEngine } from "../pattern-engine/pattern-engine";

import type {
  RepositoryIndex,
  RepositorySolution,
} from "./types";

import type {
  SolutionMetadata,
} from "../github/sync/solution-path-generator";

export interface RepositoryFileReader {
  readFile(path: string): Promise<string | null>;
}

/**
 * Re-analyzes existing CodeSyncVault solutions
 * using the current Pattern Engine.
 *
 * Historical solution information such as:
 * - repository path
 * - solvedAt
 *
 * is preserved exactly.
 */
export async function analyzeRepository(
  index: RepositoryIndex,
  reader: RepositoryFileReader,
): Promise<RepositoryIndex> {
  const solutions: RepositorySolution[] = [];

  for (const solution of index.solutions) {
    const sourceCode =
      await reader.readFile(solution.path);

    if (sourceCode === null) {
      solutions.push(solution);
      continue;
    }

    const classification =
      PatternEngine.analyze({
        metadata: solution.metadata,
        sourceCode,
        problemStatement:
          solution.metadata.title,
      });

    const metadata: SolutionMetadata = {
      ...solution.metadata,
      patterns: classification.patterns,
      topics: classification.topics,
      tags: classification.tags,
      timeComplexity:
        classification.timeComplexity,
      spaceComplexity:
        classification.spaceComplexity,
    };

    solutions.push({
      ...solution,
      metadata,
      solvedAt: solution.solvedAt,
    });
  }

  return {
    ...index,
    solutions,
  };
}

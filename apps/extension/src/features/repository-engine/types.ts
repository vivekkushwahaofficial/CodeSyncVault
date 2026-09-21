import type { SolutionMetadata } from "../github/sync/solution-path-generator";

/**
 * A solution registered in the CodeSyncVault repository index.
 */
export interface RepositorySolution {
  /**
   * Unique repository path of the solution.
   */
  path: string;

  /**
   * Complete solution metadata.
   */
  metadata: SolutionMetadata;

  /**
   * Date when the solution was solved.
   */
  solvedAt?: string;
}

/**
 * Repository-wide solution index.
 */
export interface RepositoryIndex {
  /**
   * Index format version.
   */
  version: 1;

  /**
   * All registered solutions.
   */
  solutions: RepositorySolution[];
}
import { readRepositoryFile } from "../github/services/github-repository-reader";
import { commitSolution } from "../github/services/github-commit-service";

import type { SolutionPackage } from "../github/sync/types/solution-package";

import {
  serializeRepositoryIndex,
} from "./metadata-index";

import { analyzeRepository } from "./repository-analyzer";
import { RepositoryEngine } from "./repository-engine";

export async function reanalyzeConnectedRepository(): Promise<void> {
  const indexContent =
    await readRepositoryFile(".codevault/index.json");

  if (indexContent === null) {
    return;
  }

  const engine =
    RepositoryEngine.fromIndex(indexContent);

  const analyzedIndex =
    await analyzeRepository(
      engine.generate().index,
      {
        readFile: readRepositoryFile,
      },
    );

  const originalIndex =
    serializeRepositoryIndex(
      engine.generate().index,
    );

  const updatedIndex =
    serializeRepositoryIndex(
      analyzedIndex,
    );

  if (originalIndex === updatedIndex) {
    return;
  }

  const analyzedEngine =
    new RepositoryEngine(analyzedIndex);

  const result =
    analyzedEngine.generate();

  const metadata =
    result.index.solutions[0]?.metadata;

  if (!metadata) {
    return;
  }

  const solution: SolutionPackage = {
    metadata,
    files: result.files,
    commitMessage:
      "chore(codevault): Rebuild repository metadata",
  };

  await commitSolution(solution);
}

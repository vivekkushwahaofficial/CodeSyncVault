import { generateReadme } from "../readme/readme-generator";
import { readRepositoryFile } from "../services/github-repository-reader";

import { RepositoryEngine } from "../../repository-engine/repository-engine";
import { PatternEngine } from "../../pattern-engine/pattern-engine";

import { generateSolutionPath } from "./solution-path-generator";

import type { SolutionMetadata } from "./solution-path-generator";
import type { ProblemStatement } from "../../platforms/shared/problem-statement";
import type { SolutionPackage } from "./types/solution-package";

export async function buildSolutionPackage(
  metadata: SolutionMetadata,
  sourceCode: string,
  problemStatement: ProblemStatement,
): Promise<SolutionPackage> {

  /*
   * --------------------------------------------------
   * Pattern Engine
   * --------------------------------------------------
   *
   * Classification happens before the repository
   * path and repository indexes are generated.
   *
   * The existing metadata object is not mutated.
   */

  let classifiedMetadata =
    metadata;

  try {

    const classification =
      PatternEngine.analyze({
        metadata,
        sourceCode,
        problemStatement,
      });

    classifiedMetadata = {
      ...metadata,

      patterns:
        classification.patterns,

      topics:
        classification.topics,

      tags:
        classification.tags,

      ...(classification.timeComplexity
        ? {
          timeComplexity:
            classification.timeComplexity,
        }
        : {}),

      ...(classification.spaceComplexity
        ? {
          spaceComplexity:
            classification.spaceComplexity,
        }
        : {}),
    };

    console.log(
      "[CodeSyncVault] Pattern Engine completed:",
      {
        patterns:
          classification.patterns,

        topics:
          classification.topics,

        tags:
          classification.tags,

        timeComplexity:
          classification.timeComplexity,

        spaceComplexity:
          classification.spaceComplexity,
      },
    );

  } catch (error) {

    /*
     * Pattern classification must not break
     * the existing solution synchronization pipeline.
     *
     * If classification fails, the solution is still
     * synchronized using the original metadata.
     */

    console.warn(
      "[CodeSyncVault] Pattern Engine failed. Continuing without classification.",
      error,
    );
  }

  /*
   * --------------------------------------------------
   * Existing Solution Path Generation
   * --------------------------------------------------
   */

  const solutionPath =
    generateSolutionPath(
      classifiedMetadata,
    );

  const readmePath =
    solutionPath.replace(
      /[^/]+$/,
      "README.md",
    );

  const commitMessage =
    `feat(${classifiedMetadata.platform.toLowerCase()}): Add ${classifiedMetadata.title}`;

  console.log(
    "================================",
  );

  console.log(
    "📦 Building Solution Package",
  );

  console.log(
    "Platform:",
    classifiedMetadata.platform,
  );

  console.log(
    "Difficulty:",
    classifiedMetadata.difficulty,
  );

  console.log(
    "Title:",
    classifiedMetadata.title,
  );

  console.log(
    "Language:",
    classifiedMetadata.language,
  );

  console.log(
    "Patterns:",
    classifiedMetadata.patterns ?? [],
  );

  console.log(
    "Topics:",
    classifiedMetadata.topics ?? [],
  );

  console.log(
    "Tags:",
    classifiedMetadata.tags ?? [],
  );

  console.log(
    "Time Complexity:",
    classifiedMetadata.timeComplexity ?? "Not inferred",
  );

  console.log(
    "Space Complexity:",
    classifiedMetadata.spaceComplexity ?? "Not inferred",
  );

  console.log(
    "Solution Path:",
    solutionPath,
  );

  console.log(
    "README Path:",
    readmePath,
  );

  console.log(
    "================================",
  );

  /*
   * --------------------------------------------------
   * Existing Repository Engine
   * --------------------------------------------------
   *
   * IMPORTANT:
   * Repository Engine remains unchanged.
   *
   * It now receives the classified metadata,
   * so it can generate:
   *
   * .codevault/index.json
   * patterns/*.md
   * topics/*.md
   */

  const existingIndex =
    await readRepositoryFile(
      ".codevault/index.json",
    );

  const repositoryEngine =
    RepositoryEngine.fromIndex(
      existingIndex,
    );
  const repositoryResult =
    repositoryEngine.process({
      path: solutionPath,
      metadata:
        classifiedMetadata,

      solvedAt:
        classifiedMetadata.solvedAt,
    });

  console.log(
    "[CodeSyncVault] Repository Engine result:",
    repositoryResult,
  );

  /*
   * --------------------------------------------------
   * Existing Solution Package
   * --------------------------------------------------
   */

  return {

    metadata:
      classifiedMetadata,

    commitMessage,

    files: [

      {
        path:
          readmePath,

        content:
          generateReadme(
            problemStatement,
          ),
      },

      {
        path:
          solutionPath,

        content:
          sourceCode,
      },

      ...repositoryResult.files,
    ],
  };
}
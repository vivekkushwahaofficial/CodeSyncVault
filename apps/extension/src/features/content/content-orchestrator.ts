import { syncSolution } from "../github/sync/github-sync";

import { buildSolutionPackage } from "../github/sync/solution-package-builder";

import {
  generateFingerprint,
  isFingerprintSynced,
  saveFingerprint,
} from "../github/sync/sync-fingerprint-service";

import { PlatformFactory } from "../platforms/factory/platform-factory";

/**
 * Coordinates the CodeSyncVault content workflow.
 */
export class ContentOrchestrator {

  /**
   * Starts the CodeSyncVault content workflow.
   */
  static async start(): Promise<void> {
    console.log(
      "🚀 CodeSyncVault: Content script started",
    );

    try {
      /*
       * Create the platform adapter.
       */
      const adapter =
        PlatformFactory.create();

      /*
       * Wait until the platform page is ready.
       */
      await adapter.waitUntilReady(
        document,
      );

      /*
       * Check whether the latest submission
       * was accepted.
       */
      const accepted =
        adapter.isAcceptedSubmission(
          document,
        );

      console.log(
        "[CodeSyncVault] Accepted:",
        accepted,
      );

      if (!accepted) {
        console.log(
          "[CodeSyncVault] Submission is NOT accepted.",
        );

        return;
      }

      console.log(
        "[CodeSyncVault] Submission IS accepted.",
      );

      /*
       * Extract normalized platform metadata.
       */
      const metadata =
        await adapter.extractMetadata(
          document,
        );

      console.log(
        "[CodeSyncVault] Metadata extracted:",
        metadata,
      );

      /*
       * Validate metadata before doing any
       * GitHub synchronization.
       */
      ContentOrchestrator.validateMetadata(
        metadata,
      );

      console.log(
        "[CodeSyncVault] Metadata validated.",
      );

      /*
       * Extract the submitted source code.
       */
      const solution =
        await adapter.extractSolution(
          document,
        );

      if (!solution.trim()) {
        console.log(
          "[CodeSyncVault] Solution extraction failed. Skipping sync.",
        );

        return;
      }

      console.log(
        "[CodeSyncVault] Solution extracted:",
        solution.length,
        "characters",
      );

      /*
       * Generate a language-aware deterministic
       * fingerprint.
       *
       * The fingerprint identity is:
       *
       * Platform
       * + Problem Slug
       * + Language
       * + Source Code
       *
       * Therefore:
       *
       * Same problem + Java
       * !=
       * Same problem + Python
       */
      const fingerprint =
        await generateFingerprint(
          metadata.platform,
          metadata.slug,
          metadata.language,
          solution,
        );

      console.log(
        "[CodeSyncVault] Fingerprint:",
        fingerprint,
      );

      /*
       * Check whether THIS EXACT solution in THIS
       * programming language was already synchronized.
       */
      const alreadySynced =
        await isFingerprintSynced(
          fingerprint,
        );

      if (alreadySynced) {
        console.log(
          "[CodeSyncVault] Solution already synced for this platform, problem, language, and source. Skipping GitHub commit.",
        );

        return;
      }

      /*
       * Extract the problem statement only when
       * synchronization is actually required.
       */
      const problemStatement =
        await adapter.extractProblemStatement(
          document,
        );

      console.log(
        "[CodeSyncVault] Problem statement extracted.",
      );

      /*
       * Build the complete GitHub solution package.
       *
       * The existing path generator already uses:
       *
       * Platform/
       *   Language/
       *     Difficulty/
       *       Problem/
       *         Solution.ext
       */
     const solutionPackage =
  await buildSolutionPackage(
    {
      ...metadata,
      solvedAt: metadata.solvedAt.toISOString(),
    },
    solution,
    problemStatement,
  );

      console.log(
        "[CodeSyncVault] Solution package built:",
        solutionPackage,
      );

      /*
       * Synchronize with GitHub.
       */
      const result =
        await syncSolution(
          solutionPackage,
        );

      console.log(
        "[CodeSyncVault] GitHub sync result:",
        result,
      );

      /*
       * Save the fingerprint ONLY when GitHub
       * synchronization actually succeeded.
       */
      if (!result.success) {
        console.error(
          "[CodeSyncVault] GitHub synchronization failed. Fingerprint will NOT be saved.",
        );

        return;
      }

      await saveFingerprint(
        fingerprint,
      );

      console.log(
        "[CodeSyncVault] Fingerprint saved.",
      );

    } catch (error) {
      console.error(
        "[CodeSyncVault] ContentOrchestrator failed:",
        error,
      );

      throw error;
    }
  }

  /**
   * Validates metadata before synchronization.
   *
   * The purpose is to prevent malformed GitHub
   * structures such as:
   *
   * HackerRank/
   *   Unknown/
   *     Medium/
   *       Problem/
   *         Solution.txt
   */
  private static validateMetadata(
    metadata: {
      platform?: string;
      title?: string;
      slug?: string;
      difficulty?: string;
      language?: string;
    },
  ): void {
    /*
     * Platform is mandatory.
     */
    if (!metadata.platform?.trim()) {
      throw new Error(
        "Solution metadata validation failed: platform is missing.",
      );
    }

    /*
     * Problem title is mandatory.
     */
    if (!metadata.title?.trim()) {
      throw new Error(
        "Solution metadata validation failed: title is missing.",
      );
    }

    /*
     * Problem slug is mandatory because it is
     * part of the deterministic fingerprint.
     */
    if (!metadata.slug?.trim()) {
      throw new Error(
        `Solution metadata validation failed: slug is missing for "${metadata.title}".`,
      );
    }

    /*
     * Programming language is mandatory because
     * language is part of both:
     *
     * 1. GitHub path
     * 2. Synchronization fingerprint
     */
    if (!metadata.language?.trim()) {
      throw new Error(
        `Solution metadata validation failed: language is missing for "${metadata.title}".`,
      );
    }

    /*
     * Difficulty can legitimately be unknown on
     * platforms that do not expose it.
     */
    if (!metadata.difficulty?.trim()) {
      metadata.difficulty =
        "Unknown";
    }

    console.log(
      "[CodeSyncVault] Validated metadata:",
      {
        platform:
          metadata.platform,

        title:
          metadata.title,

        slug:
          metadata.slug,

        difficulty:
          metadata.difficulty,

        language:
          metadata.language,
      },
    );
  }
}
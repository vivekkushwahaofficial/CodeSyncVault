import { commitSolution } from "../services/github-commit-service";

import type { SolutionPackage } from "./types/solution-package";

export interface SyncResult {
  success: boolean;
  message: string;
}

/**
 * Global synchronization queue.
 *
 * Every GitHub synchronization goes through this queue.
 *
 * This is important when the user submits multiple
 * solutions without refreshing the coding-platform page.
 *
 * Example:
 *
 * Java submission
 *      ↓
 * GitHub Sync A
 *      ↓
 * completed
 *      ↓
 * C++ submission
 *      ↓
 * GitHub Sync B
 *      ↓
 * completed
 *
 * Therefore two GitHub branch updates can never happen
 * concurrently.
 */
let syncQueue: Promise<void> = Promise.resolve();

/**
 * Synchronizes one solution with GitHub.
 *
 * Every synchronization is serialized through the
 * global queue.
 */
export function syncSolution(
  solution: SolutionPackage,
): Promise<SyncResult> {

  /*
   * Add this synchronization to the end of the queue.
   *
   * If nothing is running:
   *
   *     execute immediately.
   *
   * If another synchronization is running:
   *
   *     wait until it finishes.
   */
  const queuedSync =
    syncQueue.then(
      async () => {

        console.log(
          "[CodeSyncVault] 🔒 GitHub sync entered queue.",
        );

        console.log(
          "[CodeSyncVault] 📦 Synchronizing:",
          {
            platform:
              solution.metadata.platform,

            title:
              solution.metadata.title,

            language:
              solution.metadata.language,
          },
        );

        /*
         * Execute the actual GitHub synchronization.
         */
        await commitSolution(
          solution,
        );

        console.log(
          "[CodeSyncVault] 🔓 GitHub sync completed.",
        );
      },
    );

  /*
   * IMPORTANT:
   *
   * Keep the queue alive even if this synchronization
   * fails.
   *
   * Otherwise one failed synchronization would poison
   * the entire queue and every future submission would
   * remain blocked.
   */
  syncQueue =
    queuedSync.then(
      () => undefined,
      () => undefined,
    );

  /*
   * Return the original promise.
   *
   * Therefore the caller still receives the actual
   * success/failure of THIS synchronization.
   */
  return queuedSync
    .then(
      () => ({
        success:
          true,

        message:
          "Solution committed successfully.",
      }),
    )
    .catch(
      (error) => {

        console.error(
          "[CodeSyncVault] GitHub sync failed:",
          error,
        );

        return {
          success:
            false,

          message:
            error instanceof Error
              ? error.message
              : "GitHub synchronization failed.",
        };
      },
    );
}
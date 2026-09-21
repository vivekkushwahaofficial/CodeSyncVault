import { getGithubClient } from "../client/github-client";
import { getGithubSettings } from "../github-auth/github-storage";

import type {
  SolutionPackage,
} from "../sync/types/solution-package";

/**
 * Maximum number of times CodeSyncVault will rebuild
 * the synchronization against a changed branch.
 */
const MAX_SYNC_ATTEMPTS = 3;

/**
 * Maximum number of times CodeSyncVault will retry
 * updating the same GitHub reference.
 *
 * This handles GitHub's temporary ref propagation
 * / non-fast-forward response when the branch has
 * NOT actually changed.
 */
const MAX_REF_UPDATE_ATTEMPTS = 3;

/**
 * GitHub API error shape used for safe error handling.
 */
type GithubApiError = {
  status?: number;
  message?: string;
  response?: {
    data?: {
      message?: string;
      errors?: unknown;
      documentation_url?: string;
    };
  };
};

/**
 * Convert UTF-8 text to Base64.
 *
 * Browser-safe replacement for:
 *
 * Buffer.from(content, "utf-8").toString("base64")
 *
 * CodeSyncVault runs inside a browser extension, so
 * Node.js Buffer is not available here.
 */
function encodeBase64Utf8(
  content: string,
): string {

  const bytes =
    new TextEncoder().encode(
      content,
    );

  let binary = "";

  const CHUNK_SIZE = 0x8000;

  for (
    let i = 0;
    i < bytes.length;
    i += CHUNK_SIZE
  ) {

    const chunk =
      bytes.subarray(
        i,
        Math.min(
          i + CHUNK_SIZE,
          bytes.length,
        ),
      );

    binary += String.fromCharCode(
      ...chunk,
    );
  }

  return btoa(binary);
}

/**
 * Wait before retrying a GitHub API operation.
 *
 * 500 ms
 * 1000 ms
 * 2000 ms
 */
function waitBeforeRetry(
  attempt: number,
): Promise<void> {

  const delay =
    500 * Math.pow(
      2,
      attempt - 1,
    );

  return new Promise(
    (resolve) => {
      setTimeout(
        resolve,
        delay,
      );
    },
  );
}

/**
 * Creates one Git commit containing all files
 * from a SolutionPackage.
 *
 * Workflow:
 *
 * 1. Validate GitHub configuration.
 * 2. Create blobs.
 * 3. Read current branch HEAD.
 * 4. Create tree.
 * 5. Create commit.
 * 6. Verify commit parent.
 * 7. Update branch reference.
 *
 * Empty repository handling:
 *
 * If GitHub reports that the Git repository is empty,
 * CodeSyncVault initializes it through the Contents API.
 *
 * After initialization, the existing Git Database
 * synchronization pipeline continues unchanged.
 */
export async function commitSolution(
  solution: SolutionPackage,
): Promise<void> {

  /*
   * --------------------------------------------------
   * 1. Validate GitHub settings.
   * --------------------------------------------------
   */

  const settings =
    await getGithubSettings();

  if (!settings) {
    throw new Error(
      "GitHub settings not found. Please connect GitHub and configure the repository.",
    );
  }

  if (!settings.owner?.trim()) {
    throw new Error(
      "GitHub repository owner is not configured.",
    );
  }

  if (!settings.repo?.trim()) {
    throw new Error(
      "GitHub repository name is not configured.",
    );
  }

  if (!settings.branch?.trim()) {
    throw new Error(
      "GitHub branch is not configured.",
    );
  }

  /*
   * --------------------------------------------------
   * 2. Validate solution package.
   * --------------------------------------------------
   */

  if (
    !solution.files ||
    solution.files.length === 0
  ) {
    throw new Error(
      "No files to commit.",
    );
  }

  const bootstrapFile =
    solution.files[0];

  if (!bootstrapFile) {
    throw new Error(
      "Unable to initialize repository because the first solution file is missing.",
    );
  }

  if (!solution.commitMessage?.trim()) {
    throw new Error(
      "GitHub commit message is missing.",
    );
  }

  for (const file of solution.files) {

    if (!file.path?.trim()) {
      throw new Error(
        "A file path is missing.",
      );
    }

    if (!file.content?.trim()) {
      throw new Error(
        `File "${file.path}" is empty.`,
      );
    }
  }

  /*
   * --------------------------------------------------
   * 3. Create authenticated GitHub client.
   * --------------------------------------------------
   */

  const github =
    await getGithubClient();

  console.log(
    "================================",
  );

  console.log(
    "📦 Preparing GitHub Commit",
  );

  console.log(
    "Repository:",
    `${settings.owner}/${settings.repo}`,
  );

  console.log(
    "Branch:",
    settings.branch,
  );

  console.log(
    "Commit:",
    solution.commitMessage,
  );

  console.log(
    "Files:",
  );

  for (const file of solution.files) {
    console.log(
      " -",
      file.path,
    );
  }

  console.log(
    "================================",
  );

  /*
   * --------------------------------------------------
   * 4. Create blobs once.
   * --------------------------------------------------
   *
   * Blobs are independent from branch state.
   * They can therefore be reused when a commit
   * needs to be rebuilt.
   *
   * IMPORTANT:
   *
   * GitHub returns 409 when the repository has
   * no Git history yet.
   *
   * In that case we initialize the repository
   * through the Contents API and retry this
   * exact blob creation stage.
   */

  let treeEntries:
    {
      path: string;
      mode: "100644";
      type: "blob";
      sha: string;
    }[] = [];

  let repositoryInitialized =
    false;

  for (; ;) {

    try {

      treeEntries = [];

      for (const file of solution.files) {

        console.log(
          "[GitHub] Creating blob:",
          file.path,
        );

        const blob =
          await github.git.createBlob({
            owner:
              settings.owner,

            repo:
              settings.repo,

            content:
              file.content,

            encoding:
              "utf-8",
          });

        treeEntries.push({
          path:
            file.path,

          mode:
            "100644",

          type:
            "blob",

          sha:
            blob.data.sha,
        });
      }

      /*
       * Blob creation succeeded.
       *
       * The repository already has Git history,
       * or it has just been initialized.
       */
      break;

    } catch (error) {

      const githubError =
        error as GithubApiError;

      const status =
        githubError.status;

      const message =
        githubError.response?.data?.message ??
        githubError.message ??
        "Unknown GitHub error.";

      /*
       * Only handle 409 here.
       *
       * A 401, 403, 404, 422, etc. must continue
       * through normal error handling.
       */
      if (
        status !== 409 ||
        repositoryInitialized
      ) {

        throw new Error(
          `[GitHub] Failed to prepare repository files. ${message}`,
        );
      }

      console.warn(
        "[GitHub] Repository has no Git history. Initializing empty repository.",
      );

      /*
       * ------------------------------------------------
       * Initialize empty repository.
       * ------------------------------------------------
       */

      await initializeEmptyRepository(
        github,
        settings.owner,
        settings.repo,
        settings.branch,
        bootstrapFile,
      );

      repositoryInitialized =
        true;

      console.log(
        "[GitHub] Empty repository initialized successfully.",
      );

      /*
       * Give GitHub a short moment to propagate
       * the newly-created branch/reference before
       * continuing with the existing pipeline.
       */
      await waitBeforeRetry(1);
    }
  }

  /*
   * --------------------------------------------------
   * 5. Synchronization attempts.
   * --------------------------------------------------
   */

  for (
    let syncAttempt = 1;
    syncAttempt <= MAX_SYNC_ATTEMPTS;
    syncAttempt++
  ) {

    console.log(
      `[GitHub] Synchronization attempt ${syncAttempt}/${MAX_SYNC_ATTEMPTS}`,
    );

    /*
     * ------------------------------------------------
     * 5.1 Read current branch HEAD.
     * ------------------------------------------------
     */

    const branchReference =
      await getCurrentBranchReference(
        github,
        settings.owner,
        settings.repo,
        settings.branch,
      );

    const currentCommitSha =
      branchReference.data.object.sha;

    console.log(
      "[GitHub] Current commit:",
      currentCommitSha,
    );

    /*
     * ------------------------------------------------
     * 5.2 Read current commit.
     * ------------------------------------------------
     */

    let currentCommit;

    try {

      currentCommit =
        await github.git.getCommit({
          owner:
            settings.owner,

          repo:
            settings.repo,

          commit_sha:
            currentCommitSha,
        });

    } catch (error) {

      const githubError =
        error as GithubApiError;

      const message =
        githubError.response?.data?.message ??
        githubError.message ??
        "Unknown GitHub error.";

      throw new Error(
        `[GitHub] Failed to read the current repository commit. ${message}`,
      );
    }

    const baseTreeSha =
      currentCommit.data.tree.sha;

    console.log(
      "[GitHub] Base tree:",
      baseTreeSha,
    );

    /*
     * ------------------------------------------------
     * 5.3 Create tree.
     * ------------------------------------------------
     */

    let newTree;

    try {

      newTree =
        await github.git.createTree({
          owner:
            settings.owner,

          repo:
            settings.repo,

          base_tree:
            baseTreeSha,

          tree:
            treeEntries,
        });

    } catch (error) {

      const githubError =
        error as GithubApiError;

      const message =
        githubError.response?.data?.message ??
        githubError.message ??
        "Unknown GitHub error.";

      throw new Error(
        `[GitHub] Failed to create the repository tree. ${message}`,
      );
    }

    console.log(
      "[GitHub] New tree:",
      newTree.data.sha,
    );

    /*
     * ------------------------------------------------
     * 5.4 Create commit.
     * ------------------------------------------------
     */

    let newCommit;

    try {

      newCommit =
        await github.git.createCommit({
          owner:
            settings.owner,

          repo:
            settings.repo,

          message:
            solution.commitMessage,

          tree:
            newTree.data.sha,

          parents: [
            currentCommitSha,
          ],
        });

    } catch (error) {

      const githubError =
        error as GithubApiError;

      const message =
        githubError.response?.data?.message ??
        githubError.message ??
        "Unknown GitHub error.";

      throw new Error(
        `[GitHub] Failed to create commit "${solution.commitMessage}". ${message}`,
      );
    }

    console.log(
      "[GitHub] New commit:",
      newCommit.data.sha,
    );

    /*
     * ------------------------------------------------
     * 5.5 Verify commit parent.
     * ------------------------------------------------
     */

    const parentSha =
      newCommit.data.parents?.[0]?.sha;

    if (
      parentSha !==
      currentCommitSha
    ) {

      throw new Error(
        `[GitHub] Commit parent mismatch. Expected parent "${currentCommitSha}", received "${parentSha ?? "none"}".`,
      );
    }

    console.log(
      "[GitHub] Commit parent verified:",
      parentSha,
    );

    /*
     * ------------------------------------------------
     * 5.6 Update branch reference.
     * ------------------------------------------------
     */

    let rebuildRequired =
      false;

    for (
      let refAttempt = 1;
      refAttempt <= MAX_REF_UPDATE_ATTEMPTS;
      refAttempt++
    ) {

      try {

        console.log(
          `[GitHub] Updating branch "${settings.branch}" to commit ${newCommit.data.sha} (ref attempt ${refAttempt}/${MAX_REF_UPDATE_ATTEMPTS})`,
        );

        await github.git.updateRef({
          owner:
            settings.owner,

          repo:
            settings.repo,

          ref:
            `heads/${settings.branch}`,

          sha:
            newCommit.data.sha,

          force:
            false,
        });

        /*
         * ------------------------------------------------
         * SUCCESS
         * ------------------------------------------------
         */

        console.log(
          "================================",
        );

        console.log(
          "🚀 GitHub commit completed",
        );

        console.log(
          "Commit:",
          solution.commitMessage,
        );

        console.log(
          "Commit SHA:",
          newCommit.data.sha,
        );

        console.log(
          "Files committed:",
          solution.files.length,
        );

        console.log(
          "Synchronization attempt:",
          syncAttempt,
        );

        console.log(
          "Reference update attempt:",
          refAttempt,
        );

        console.log(
          "================================",
        );

        return;

      } catch (error) {

        const githubError =
          error as GithubApiError;

        const status =
          githubError.status;

        const apiMessage =
          githubError.response?.data?.message ??
          githubError.message ??
          "Unknown GitHub error.";

        console.error(
          "[GitHub] Branch update failed:",
          {
            status,

            message:
              apiMessage,

            branch:
              settings.branch,

            expectedParent:
              currentCommitSha,

            newCommit:
              newCommit.data.sha,

            errors:
              githubError.response?.data?.errors,

            documentationUrl:
              githubError.response?.data?.documentation_url,
          },
        );

        const isNonFastForward =
          status === 422 &&
          apiMessage
            .toLowerCase()
            .includes(
              "update is not a fast forward",
            );

        const isRetryableConflict =
          status === 409 ||
          isNonFastForward;

        if (!isRetryableConflict) {

          if (status === 401) {
            throw new Error(
              "[GitHub] Authentication failed while updating the repository. Please reconnect GitHub.",
            );
          }

          if (status === 403) {
            throw new Error(
              `[GitHub] Permission denied while updating branch "${settings.branch}". Please make sure the connected GitHub account has write access.`,
            );
          }

          if (status === 404) {
            throw new Error(
              `[GitHub] Branch "${settings.branch}" was not found in repository "${settings.owner}/${settings.repo}".`,
            );
          }

          if (status === 422) {
            throw new Error(
              `[GitHub] GitHub rejected the branch update (422): ${apiMessage}`,
            );
          }

          throw new Error(
            `[GitHub] Failed to update branch "${settings.branch}". ${apiMessage}`,
          );
        }

        /*
         * ------------------------------------------------
         * Check the branch HEAD.
         * ------------------------------------------------
         */

        const latestBranchReference =
          await getCurrentBranchReference(
            github,
            settings.owner,
            settings.repo,
            settings.branch,
          );

        const latestCommitSha =
          latestBranchReference.data.object.sha;

        console.log(
          "[GitHub] Latest branch commit after conflict:",
          latestCommitSha,
        );

        /*
         * CASE 1:
         *
         * Branch changed.
         *
         * Rebuild against latest branch state.
         */

        if (
          latestCommitSha !==
          currentCommitSha
        ) {

          console.warn(
            `[GitHub] Branch "${settings.branch}" changed from ${currentCommitSha} to ${latestCommitSha}. Rebuilding against the latest branch state.`,
          );

          rebuildRequired =
            true;

          break;
        }

        /*
         * CASE 2:
         *
         * Branch did NOT change.
         *
         * Retry same commit.
         */

        console.warn(
          `[GitHub] Branch "${settings.branch}" did not change. Retrying the SAME commit ${newCommit.data.sha}.`,
        );

        if (
          refAttempt <
          MAX_REF_UPDATE_ATTEMPTS
        ) {

          await waitBeforeRetry(
            refAttempt,
          );

          continue;
        }

        throw new Error(
          `[GitHub] GitHub rejected the branch update after ${MAX_REF_UPDATE_ATTEMPTS} attempts, although branch "${settings.branch}" did not change. Last error: ${apiMessage}`,
        );
      }
    }

    /*
     * --------------------------------------------------
     * 5.7 Rebuild only when branch changed.
     * --------------------------------------------------
     */

    if (rebuildRequired) {

      if (
        syncAttempt >=
        MAX_SYNC_ATTEMPTS
      ) {

        throw new Error(
          `[GitHub] Synchronization could not complete because branch "${settings.branch}" changed repeatedly.`,
        );
      }

      await waitBeforeRetry(
        syncAttempt,
      );

      continue;
    }
  }

  throw new Error(
    "[GitHub] Synchronization failed unexpectedly.",
  );
}

/**
 * Initializes an empty GitHub repository.
 *
 * GitHub's Git Database API cannot create raw Git
 * objects in an empty repository. The Contents API
 * must first create a file and establish the initial
 * repository history.
 *
 * This function is ONLY called after a 409 Conflict
 * confirms that the repository has no Git history.
 */
async function initializeEmptyRepository(
  github: Awaited<
    ReturnType<typeof getGithubClient>
  >,
  owner: string,
  repo: string,
  branch: string,
  file: SolutionPackage["files"][number],
): Promise<void> {

  try {

    console.log(
      "[GitHub] Initializing repository with:",
      file.path,
    );

    const result =
      await github.repos.createOrUpdateFileContents({
        owner,

        repo,

        path:
          file.path,

        message:
          "chore(codesyncvault): initialize repository",

        /*
         * Browser-safe UTF-8 Base64 encoding.
         *
         * IMPORTANT:
         *
         * Do NOT use Buffer here because CodeSyncVault
         * runs inside a browser extension.
         */
        content:
          encodeBase64Utf8(
            file.content,
          ),

        branch,
      });

    console.log(
      "[GitHub] Repository initialization commit:",
      result.data.commit.sha,
    );

  } catch (error) {

    const githubError =
      error as GithubApiError;

    const status =
      githubError.status;

    const message =
      githubError.response?.data?.message ??
      githubError.message ??
      "Unknown GitHub error.";

    if (status === 401) {
      throw new Error(
        "[GitHub] Authentication failed while initializing the repository. Please reconnect GitHub.",
      );
    }

    if (status === 403) {
      throw new Error(
        `[GitHub] Permission denied while initializing "${owner}/${repo}". The GitHub token needs write access to repository contents.`,
      );
    }

    if (status === 404) {
      throw new Error(
        `[GitHub] Repository "${owner}/${repo}" was not found while initializing the empty repository.`,
      );
    }

    if (status === 409) {
      throw new Error(
        `[GitHub] Repository "${owner}/${repo}" is still unavailable for initialization. Please retry after GitHub finishes creating the repository.`,
      );
    }

    if (status === 422) {
      throw new Error(
        `[GitHub] GitHub rejected repository initialization (422): ${message}`,
      );
    }

    throw new Error(
      `[GitHub] Failed to initialize empty repository "${owner}/${repo}". ${message}`,
    );
  }
}

/**
 * Reads the current branch reference.
 */
async function getCurrentBranchReference(
  github: Awaited<
    ReturnType<typeof getGithubClient>
  >,
  owner: string,
  repo: string,
  branch: string,
) {

  try {

    return await github.git.getRef({
      owner,

      repo,

      ref:
        `heads/${branch}`,
    });

  } catch (error) {

    throw createGithubReadError(
      error,
      owner,
      repo,
      branch,
    );
  }
}

/**
 * Creates a clear error for GitHub branch reads.
 */
function createGithubReadError(
  error: unknown,
  owner: string,
  repo: string,
  branch: string,
): Error {

  const githubError =
    error as GithubApiError;

  const status =
    githubError.status;

  const message =
    githubError.response?.data?.message ??
    githubError.message ??
    "Unknown GitHub error.";

  if (status === 404) {

    return new Error(
      `[GitHub] Branch "${branch}" was not found in repository "${owner}/${repo}". Please check your repository and branch settings.`,
    );
  }

  if (status === 401) {

    return new Error(
      "[GitHub] Authentication failed while accessing the repository. Please reconnect GitHub.",
    );
  }

  if (status === 403) {

    return new Error(
      `[GitHub] Permission denied for "${owner}/${repo}". Please make sure the connected GitHub account can write to this repository.`,
    );
  }

  return new Error(
    `[GitHub] Failed to read branch "${branch}". ${message}`,
  );
}
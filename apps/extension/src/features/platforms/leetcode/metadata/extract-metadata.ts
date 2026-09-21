import type { ProblemMetadata } from "../../shared/problem-metadata";
import { PlatformType } from "../../shared/platform-type";
import { extractLeetCodeLanguage } from "./leetcode-language";

/**
 * Extracts the current LeetCode problem slug
 * from the browser URL.
 *
 * The URL is the source of truth for the
 * problem currently being processed.
 */
function getCurrentProblemSlug(): string {
  const match =
    window.location.pathname.match(
      /^\/problems\/([^/]+)/i,
    );

  if (!match?.[1]) {
    throw new Error(
      "LeetCode problem slug could not be determined from current URL.",
    );
  }

  try {
    return decodeURIComponent(match[1])
      .trim()
      .toLowerCase();
  } catch {
    return match[1]
      .trim()
      .toLowerCase();
  }
}

/**
 * Builds the canonical LeetCode URL.
 */
function buildLeetCodeUrl(
  slug: string,
): string {
  const currentUrl =
    new URL(
      window.location.href,
    );

  const pathParts =
    currentUrl.pathname
      .split("/")
      .filter(Boolean);

  const problemsIndex =
    pathParts.indexOf(
      "problems",
    );

  if (
    problemsIndex !== -1 &&
    pathParts.length >
    problemsIndex + 1
  ) {
    const remainingPath =
      pathParts.slice(
        problemsIndex + 1,
      );

    const submissionIndex =
      remainingPath.indexOf(
        "submissions",
      );

    if (
      submissionIndex !== -1 &&
      remainingPath.length >
      submissionIndex + 1
    ) {
      const submissionId =
        remainingPath[
        submissionIndex + 1
        ];

      return `https://leetcode.com/problems/${slug}/submissions/${submissionId}/`;
    }
  }

  return `https://leetcode.com/problems/${slug}/`;
}

/**
 * Extracts normalized metadata from the
 * current LeetCode problem.
 *
 * Metadata comes from LeetCode's __NEXT_DATA__
 * React Query state.
 *
 * The current URL slug is used to ensure that
 * stale data from another SPA-rendered problem
 * is never accepted.
 */
export function extractMetadata(
  document: Document,
): ProblemMetadata {
  const currentSlug =
    getCurrentProblemSlug();

  console.log(
    "[CodeSyncVault] Extracting metadata for:",
    currentSlug,
  );

  /*
   * --------------------------------------------------
   * Read __NEXT_DATA__
   * --------------------------------------------------
   */
  const script =
    document.getElementById(
      "__NEXT_DATA__",
    );

  if (!script?.textContent) {
    throw new Error(
      `LeetCode __NEXT_DATA__ not found for "${currentSlug}".`,
    );
  }

  let nextData: unknown;

  try {
    nextData =
      JSON.parse(
        script.textContent,
      );
  } catch {
    throw new Error(
      `Failed to parse LeetCode __NEXT_DATA__ for "${currentSlug}".`,
    );
  }

  /*
   * --------------------------------------------------
   * Read dehydrated React Query state
   * --------------------------------------------------
   */
  const queries =
    (
      nextData as {
        props?: {
          pageProps?: {
            dehydratedState?: {
              queries?: unknown;
            };
          };
        };
      }
    )
      ?.props
      ?.pageProps
      ?.dehydratedState
      ?.queries;

  if (!Array.isArray(queries)) {
    throw new Error(
      `LeetCode queries not found for "${currentSlug}".`,
    );
  }

  /*
   * --------------------------------------------------
   * Find questionDetail query for current slug
   * --------------------------------------------------
   */
  const questionQuery =
    queries.find(
      (query: unknown) => {
        if (
          typeof query !==
          "object" ||
          query === null
        ) {
          return false;
        }

        const record =
          query as {
            queryKey?: unknown;
          };

        if (
          !Array.isArray(
            record.queryKey,
          )
        ) {
          return false;
        }

        if (
          record.queryKey[0] !==
          "questionDetail"
        ) {
          return false;
        }

        return record.queryKey.some(
          (value: unknown) =>
            typeof value ===
            "string" &&
            value
              .trim()
              .toLowerCase() ===
            currentSlug,
        );
      },
    );

  /*
   * Some page states may expose exactly one
   * questionDetail query without the slug in
   * the query key. Allow that safe fallback.
   */
  const resolvedQuestionQuery =
    questionQuery ??
    (() => {
      const questionQueries =
        queries.filter(
          (query: unknown) => {
            if (
              typeof query !==
              "object" ||
              query === null
            ) {
              return false;
            }

            const record =
              query as {
                queryKey?: unknown;
              };

            return (
              Array.isArray(
                record.queryKey,
              ) &&
              record.queryKey[0] ===
              "questionDetail"
            );
          },
        );

      return questionQueries.length ===
        1
        ? questionQueries[0]
        : null;
    })();

  if (!resolvedQuestionQuery) {
    throw new Error(
      `LeetCode questionDetail query not found for "${currentSlug}".`,
    );
  }

  /*
   * --------------------------------------------------
   * Extract question
   * --------------------------------------------------
   */
  const question =
    (
      resolvedQuestionQuery as {
        state?: {
          data?: {
            question?: unknown;
          };
        };
      }
    )
      ?.state
      ?.data
      ?.question;

  if (
    typeof question !==
    "object" ||
    question === null
  ) {
    throw new Error(
      `LeetCode question metadata not found for "${currentSlug}".`,
    );
  }

  const questionRecord =
    question as {
      title?: unknown;
      titleSlug?: unknown;
      difficulty?: unknown;
    };

  const title =
    typeof questionRecord.title ===
      "string"
      ? questionRecord.title.trim()
      : "";

  const slug =
    typeof questionRecord.titleSlug ===
      "string"
      ? questionRecord.titleSlug
        .trim()
        .toLowerCase()
      : "";

  const difficulty =
    typeof questionRecord.difficulty ===
      "string"
      ? questionRecord.difficulty
        .trim()
        .toLowerCase()
      : "";

  if (!title) {
    throw new Error(
      `LeetCode problem title not found for "${currentSlug}".`,
    );
  }

  if (!slug) {
    throw new Error(
      `LeetCode problem slug not found for "${title}".`,
    );
  }

  if (!difficulty) {
    throw new Error(
      `LeetCode difficulty not found for "${title}".`,
    );
  }

  /*
   * --------------------------------------------------
   * Critical SPA identity validation
   * --------------------------------------------------
   */
  if (
    slug !==
    currentSlug
  ) {
    throw new Error(
      `LeetCode metadata belongs to "${slug}", but current problem is "${currentSlug}".`,
    );
  }

  /*
   * --------------------------------------------------
   * Extract current language
   * --------------------------------------------------
   */
  const language =
    extractLeetCodeLanguage(
      document,
    );

  console.log(
    "[CodeSyncVault] LeetCode language:",
    language || "NOT FOUND",
  );

  if (!language) {
    throw new Error(
      `LeetCode programming language could not be detected for "${title}".`,
    );
  }

  /*
   * --------------------------------------------------
   * Build canonical URL
   * --------------------------------------------------
   */
  const url =
    buildLeetCodeUrl(
      currentSlug,
    );

  console.log(
    "[CodeSyncVault] LeetCode URL:",
    url,
  );

  /*
   * --------------------------------------------------
   * Return normalized metadata
   * --------------------------------------------------
   */
  return {
    platform:
      PlatformType.LEETCODE,

    title,

    slug:
      currentSlug,

    difficulty,

    language,

    url,

    solvedAt:
      new Date(),
  };
}
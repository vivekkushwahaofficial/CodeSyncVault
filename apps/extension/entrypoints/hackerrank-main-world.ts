declare global {
  interface Window {
    __codevaultHackerRankInitialized?: boolean;
  }
}

interface HackerRankSubmission {
  id?: number;
  status?: string;
  language?: string;
  code?: string;
  name?: string;
  slug?: string;
  challenge_slug?: string;
  difficulty_name?: string;
  created_at?: string;
  problem_statement?: string;
  input_format?: string;
  constraints?: string;
  output_format?: string;
}

interface HackerRankResponse {
  model?: HackerRankSubmission;
}

interface HackerRankChallengeResponse {
  model?: {
    difficulty_name?: string;
    difficulty_score?: string | number;
    level?: number;
  };
}

/**
 * Normalizes HackerRank language identifiers.
 *
 * Examples:
 *
 * cpp
 * cpp11
 * cpp14
 * cpp17
 * C++
 * C++17
 * GNU C++17
 *
 * -> C++
 */
function normalizeHackerRankLanguage(
  language: unknown,
): string {
  if (typeof language !== "string") {
    return "";
  }

  const normalized = language
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  if (!normalized) {
    return "";
  }

  // Java
  if (
    normalized === "java" ||
    /^java\s*\d+/.test(normalized)
  ) {
    return "Java";
  }

  // Python
  if (
    normalized === "python" ||
    normalized === "python2" ||
    normalized === "python3" ||
    normalized === "python 2" ||
    normalized === "python 3" ||
    normalized.startsWith("python ") ||
    normalized.startsWith("pypy")
  ) {
    return "Python";
  }

  // C++
  if (
    normalized === "c++" ||
    normalized.startsWith("c++") ||
    normalized === "cpp" ||
    normalized.startsWith("cpp") ||
    normalized.includes("gnu c++") ||
    normalized.includes("gcc c++")
  ) {
    return "C++";
  }

  // C
  if (
    normalized === "c" ||
    normalized === "gnu c" ||
    /^c\s*\d+$/.test(normalized)
  ) {
    return "C";
  }

  // JavaScript
  if (
    normalized === "javascript" ||
    normalized === "js" ||
    normalized === "node" ||
    normalized === "node.js"
  ) {
    return "JavaScript";
  }

  // TypeScript
  if (
    normalized === "typescript" ||
    normalized === "ts"
  ) {
    return "TypeScript";
  }

  // C#
  if (
    normalized === "c#" ||
    normalized === "csharp" ||
    normalized === "c sharp"
  ) {
    return "C#";
  }

  // Go
  if (
    normalized === "go" ||
    normalized === "golang"
  ) {
    return "Go";
  }

  // Rust
  if (normalized === "rust") {
    return "Rust";
  }

  // Kotlin
  if (normalized === "kotlin") {
    return "Kotlin";
  }

  // Swift
  if (normalized === "swift") {
    return "Swift";
  }

  // Ruby
  if (normalized === "ruby") {
    return "Ruby";
  }

  // PHP
  if (normalized === "php") {
    return "PHP";
  }

  // Scala
  if (normalized === "scala") {
    return "Scala";
  }

  console.warn(
    "[CodeSyncVault] Unsupported HackerRank language:",
    language,
  );

  return "";
}

export default defineUnlistedScript(() => {
  if (
    window.__codevaultHackerRankInitialized
  ) {
    console.debug(
      "[CodeSyncVault] HackerRank bridge already initialized.",
    );

    return;
  }

  window.__codevaultHackerRankInitialized =
    true;

  console.log(
    "[CodeSyncVault] HackerRank MAIN WORLD bridge initialized.",
  );

  const OriginalXHR = XMLHttpRequest;

  const originalOpen =
    OriginalXHR.prototype.open;

  const originalSend =
    OriginalXHR.prototype.send;

  /**
   * IMPORTANT:
   *
   * Keeps track of submissions created during
   * this page session.
   *
   * This fixes the previous TypeScript error:
   *
   * Cannot find name 'submissionIds'
   */
  const submissionIds =
    new Set<string>();

  /**
   * submission ID -> challenge slug
   */
  const submissionSlugs =
    new Map<string, string>();

  /**
   * submission ID -> normalized language
   */
  const submissionLanguages =
    new Map<string, string>();

  /**
   * Intercept XMLHttpRequest.open().
   */
  OriginalXHR.prototype.open =
    function (
      method: string,
      url: string | URL,
      async?: boolean,
      username?: string | null,
      password?: string | null,
    ) {
      const xhr =
        this as XMLHttpRequest & {
          __codevaultMethod?: string;
          __codevaultUrl?: string;
        };

      xhr.__codevaultMethod =
        method.toUpperCase();

      xhr.__codevaultUrl =
        String(url);

      return originalOpen.call(
        this,
        method,
        url,
        async ?? true,
        username,
        password,
      );
    };

  /**
   * Intercept XMLHttpRequest.send().
   */
  OriginalXHR.prototype.send =
    function (
      body?: Document |
        XMLHttpRequestBodyInit |
        null,
    ) {
      const xhr =
        this as XMLHttpRequest & {
          __codevaultMethod?: string;
          __codevaultUrl?: string;
        };

      const method =
        xhr.__codevaultMethod ?? "";

      const url =
        xhr.__codevaultUrl ?? "";

      if (
        !isHackerRankSubmissionUrl(url)
      ) {
        return originalSend.call(
          this,
          body,
        );
      }

      this.addEventListener(
        "load",
        () => {
          handleXHRResponse(
            method,
            url,
            this,
          );
        },
      );

      return originalSend.call(
        this,
        body,
      );
    };

  /**
   * Intercept fetch().
   */
  const originalFetch =
    window.fetch;

  window.fetch =
    async function (
      input: RequestInfo | URL,
      init?: RequestInit,
    ): Promise<Response> {
      const method =
        getFetchMethod(
          input,
          init,
        );

      const url =
        getFetchUrl(input);

      const response =
        await originalFetch.call(
          this,
          input,
          init,
        );

      if (
        isHackerRankSubmissionUrl(url)
      ) {
        void handleFetchResponse(
          method,
          url,
          response.clone(),
        );
      }

      return response;
    };

  /**
   * Handles XHR responses.
   */
  function handleXHRResponse(
    method: string,
    url: string,
    xhr: XMLHttpRequest,
  ): void {
    if (
      xhr.status < 200 ||
      xhr.status >= 300
    ) {
      return;
    }

    const data =
      parseXHRResponse(xhr);

    if (!data?.model) {
      return;
    }

    void handleSubmissionResponse(
      method,
      url,
      data,
    );
  }

  /**
   * Handles fetch responses.
   */
  async function handleFetchResponse(
    method: string,
    url: string,
    response: Response,
  ): Promise<void> {
    if (
      response.status < 200 ||
      response.status >= 300
    ) {
      return;
    }

    try {
      const data =
        (await response.json()) as HackerRankResponse;

      if (!data?.model) {
        return;
      }

      await handleSubmissionResponse(
        method,
        url,
        data,
      );
    } catch {
      // Ignore non-JSON responses.
    }
  }

  /**
   * Handles HackerRank submission responses.
   */
  async function handleSubmissionResponse(
    method: string,
    url: string,
    data: HackerRankResponse,
  ): Promise<void> {
    const model =
      data.model;

    if (!model) {
      return;
    }

    console.log(
      "[CodeSyncVault] HackerRank submission response:",
      method,
      url,
      model,
    );

    /**
     * POST /submissions
     *
     * Store submission information because the
     * later GET request may not contain language.
     */
    if (
      method === "POST" &&
      model.id
    ) {
      const submissionId =
        String(model.id);

      const slug =
        model.slug ??
        model.challenge_slug ??
        extractSlugFromSubmissionUrl(
          url,
        );

      const language =
        normalizeHackerRankLanguage(
          model.language,
        );

      submissionIds.add(
        submissionId,
      );

      if (slug) {
        submissionSlugs.set(
          submissionId,
          slug,
        );
      }

      if (language) {
        submissionLanguages.set(
          submissionId,
          language,
        );
      }

      console.log(
        "[CodeSyncVault] Submission created:",
        submissionId,
      );

      console.log(
        "[CodeSyncVault] Submission language:",
        language || "missing",
      );

      return;
    }

    /**
     * GET /submissions/{id}
     *
     * Process only accepted submissions
     * created during this page session.
     */
    if (
      method === "GET" &&
      model.id &&
      model.status === "Accepted"
    ) {
      const submissionId =
        String(model.id);

      if (
        !submissionIds.has(
          submissionId,
        )
      ) {
        console.debug(
          "[CodeSyncVault] Accepted submission was not created in this page session:",
          submissionId,
        );

        return;
      }

      /**
       * Remove it immediately so the same
       * accepted submission cannot be dispatched
       * multiple times.
       */
      submissionIds.delete(
        submissionId,
      );

      console.log(
        "[CodeSyncVault] HackerRank submission ACCEPTED:",
        submissionId,
      );

      /**
       * Resolve challenge slug.
       */
      const slug =
        model.slug ??
        model.challenge_slug ??
        submissionSlugs.get(
          submissionId,
        ) ??
        extractSlugFromSubmissionUrl(
          url,
        ) ??
        "";

      /**
       * Resolve language.
       *
       * First preference:
       * accepted response language
       *
       * Second preference:
       * language captured from POST
       */
      const language =
        normalizeHackerRankLanguage(
          model.language,
        ) ||
        submissionLanguages.get(
          submissionId,
        ) ||
        "";

      /**
       * Clean temporary state.
       */
      submissionSlugs.delete(
        submissionId,
      );

      submissionLanguages.delete(
        submissionId,
      );

      /**
       * Never create an Unknown language
       * folder.
       */
      if (!language) {
        console.error(
          "[CodeSyncVault] Accepted HackerRank submission has no supported language. Sync skipped.",
          {
            submissionId,
            rawLanguage:
              model.language,
            slug,
          },
        );

        return;
      }

      /**
       * Fetch difficulty.
       */
      const difficulty =
        await getChallengeDifficulty(
          slug,
        );

      console.log(
        "[CodeSyncVault] HackerRank difficulty:",
        difficulty,
      );

      console.log(
        "[CodeSyncVault] HackerRank normalized language:",
        language,
      );

      /**
       * Send normalized accepted submission
       * to the CodeSyncVault content script.
       */
      window.postMessage(
        {
          type:
            "CODEVAULT_HACKERRANK_SUBMISSION_ACCEPTED",

          submission: {
            id:
              model.id,

            status:
              model.status,

            language,

            code:
              model.code ?? "",

            title:
              model.name ?? "",

            slug,

            difficulty:
              difficulty ??
              model.difficulty_name ??
              "Unknown",

            url:
              window.location.href,

            solvedAt:
              model.created_at ??
              new Date().toISOString(),

            problemStatement:
              model.problem_statement ??
              "",

            inputFormat:
              model.input_format ??
              "",

            constraints:
              model.constraints ??
              "",

            outputFormat:
              model.output_format ??
              "",
          },
        },
        "*",
      );

      console.log(
        "[CodeSyncVault] Accepted submission event dispatched.",
      );
    }
  }

  /**
   * Determines whether a URL is a HackerRank
   * submission API endpoint.
   */
  function isHackerRankSubmissionUrl(
    url: string,
  ): boolean {
    return (
      url.includes(
        "/rest/contests/master/challenges/",
      ) &&
      url.includes(
        "/submissions",
      )
    );
  }

  /**
   * Gets URL from fetch input.
   */
  function getFetchUrl(
    input: RequestInfo | URL,
  ): string {
    if (
      typeof input === "string"
    ) {
      return new URL(
        input,
        window.location.href,
      ).href;
    }

    if (
      input instanceof URL
    ) {
      return input.href;
    }

    return input.url;
  }

  /**
   * Gets HTTP method from fetch input.
   */
  function getFetchMethod(
    input: RequestInfo | URL,
    init?: RequestInit,
  ): string {
    if (init?.method) {
      return init.method.toUpperCase();
    }

    if (
      typeof Request !== "undefined" &&
      input instanceof Request
    ) {
      return input.method.toUpperCase();
    }

    return "GET";
  }

  /**
   * Parses XHR response.
   */
  function parseXHRResponse(
    xhr: XMLHttpRequest,
  ): HackerRankResponse | null {
    try {
      if (
        xhr.responseType === "json" &&
        xhr.response
      ) {
        return xhr.response as HackerRankResponse;
      }

      const text =
        xhr.responseText;

      if (!text) {
        return null;
      }

      return JSON.parse(
        text,
      ) as HackerRankResponse;
    } catch {
      return null;
    }
  }

  /**
   * Extracts challenge slug from submission URL.
   */
  function extractSlugFromSubmissionUrl(
    url: string,
  ): string {
    const match =
      url.match(
        /\/challenges\/([^/]+)\/submissions/,
      );

    return match?.[1] ?? "";
  }

  /**
   * Fetches HackerRank challenge difficulty.
   */
  async function getChallengeDifficulty(
    slug: string,
  ): Promise<string | null> {
    if (!slug) {
      console.warn(
        "[CodeSyncVault] HackerRank challenge slug missing.",
      );

      return null;
    }

    const endpoint =
      `/rest/contests/master/challenges/${encodeURIComponent(slug)}/`;

    try {
      console.log(
        "[CodeSyncVault] Fetching challenge metadata:",
        endpoint,
      );

      const response =
        await fetch(endpoint);

      if (!response.ok) {
        console.warn(
          "[CodeSyncVault] Challenge metadata request failed:",
          response.status,
          endpoint,
        );

        return null;
      }

      const data =
        (await response.json()) as HackerRankChallengeResponse;

      const difficulty =
        data.model?.difficulty_name?.trim();

      return difficulty || null;
    } catch (error) {
      console.warn(
        "[CodeSyncVault] Failed to fetch HackerRank difficulty:",
        error,
      );

      return null;
    }
  }
});
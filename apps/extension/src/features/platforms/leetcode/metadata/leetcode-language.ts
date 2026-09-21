/**
 * Supported programming languages returned by CodeSyncVault.
 */
const LANGUAGE_PATTERNS: Array<{
  pattern: RegExp;
  value: string;
}> = [
  {
    pattern: /^c\+\+\s*$/i,
    value: "C++",
  },
  {
    pattern: /^java\s*$/i,
    value: "Java",
  },
  {
    pattern: /^python(?:3)?\s*$/i,
    value: "Python",
  },
  {
    pattern: /^javascript\s*$/i,
    value: "JavaScript",
  },
  {
    pattern: /^typescript\s*$/i,
    value: "TypeScript",
  },
  {
    pattern: /^c\s*$/i,
    value: "C",
  },
  {
    pattern: /^c#\s*$/i,
    value: "C#",
  },
  {
    pattern: /^go\s*$/i,
    value: "Go",
  },
  {
    pattern: /^rust\s*$/i,
    value: "Rust",
  },
  {
    pattern: /^kotlin\s*$/i,
    value: "Kotlin",
  },
  {
    pattern: /^swift\s*$/i,
    value: "Swift",
  },
];

/**
 * Extracts the currently selected LeetCode programming language.
 *
 * The LeetCode UI can change its internal class names, therefore
 * this implementation intentionally relies on semantic attributes
 * and normalized visible text instead of generated CSS classes.
 */
export function extractLeetCodeLanguage(
  document: Document = window.document,
): string {
  /*
   * First inspect elements that explicitly behave like
   * language selectors.
   */
  const semanticCandidates = Array.from(
    document.querySelectorAll<HTMLElement>(
      [
        "button[aria-haspopup='listbox']",
        "[role='combobox']",
        "[aria-label*='language' i]",
        "[title*='language' i]",
      ].join(","),
    ),
  );

  for (const element of semanticCandidates) {
    const language =
      normalizeLanguageText(
        element.textContent,
      );

    if (language) {
      return language;
    }
  }

  /*
   * LeetCode's language selector is commonly a button
   * whose visible text is exactly the selected language.
   *
   * We inspect buttons as a fallback but only accept
   * exact known language names.
   */
  const buttons = Array.from(
    document.querySelectorAll<HTMLButtonElement>(
      "button",
    ),
  );

  for (const button of buttons) {
    const language =
      normalizeLanguageText(
        button.textContent,
      );

    if (language) {
      return language;
    }
  }

  /*
   * Some LeetCode versions expose the language through
   * a select element.
   */
  const selects = Array.from(
    document.querySelectorAll<HTMLSelectElement>(
      "select",
    ),
  );

  for (const select of selects) {
    const selectedText =
      select.selectedOptions[0]?.textContent;

    const language =
      normalizeLanguageText(
        selectedText,
      );

    if (language) {
      return language;
    }
  }

  /*
   * Never return a fake default language.
   *
   * Returning "Java" here would silently place a Python,
   * C++, JavaScript, etc. solution into the wrong language
   * directory.
   */
  return "";
}

/**
 * Normalizes visible language text into CodeSyncVault's
 * canonical language names.
 */
function normalizeLanguageText(
  value: string | null | undefined,
): string {
  if (!value) {
    return "";
  }

  const normalized =
    value
      .replace(/\s+/g, " ")
      .trim();

  if (!normalized) {
    return "";
  }

  const match =
    LANGUAGE_PATTERNS.find(
      ({ pattern }) =>
        pattern.test(normalized),
    );

  return match?.value ?? "";
}
import { ContentOrchestrator } from "../src/features/content/content-orchestrator";
import { setLatestSubmission } from "../src/features/platforms/hackerrank/submission/hackerrank-submission-store";

export default defineContentScript({
  matches: [
    "*://leetcode.com/*",
    "*://*.leetcode.com/*",
    "*://geeksforgeeks.org/*",
    "*://*.geeksforgeeks.org/*",
    "*://hackerrank.com/*",
    "*://*.hackerrank.com/*",
  ],

  async main() {
    console.log(
      "[CodeSyncVault] Content script initialized.",
    );

    const hostname =
      window.location.hostname;

    // --------------------------------------------------
    // LeetCode
    // --------------------------------------------------

    if (
      hostname.includes("leetcode.com")
    ) {
      await injectScript(
        "/leetcode-main-world.js",
        {
          keepInDom: true,
        },
      );

      console.log(
        "[CodeSyncVault] Waiting for LeetCode submission...",
      );

      const submitButton =
        await waitForLeetCodeSubmitButton();

      if (!submitButton) {
        console.log(
          "[CodeSyncVault] LeetCode submit button not found.",
        );

        return;
      }

      submitButton.addEventListener(
        "click",
        async () => {
          console.log(
            "[CodeSyncVault] LeetCode Submit clicked. Checking result...",
          );

          setTimeout(
            async () => {
              await ContentOrchestrator.start();
            },
            2000,
          );
        },
      );

      return;
    }

    // --------------------------------------------------
    // GeeksforGeeks
    // --------------------------------------------------

    if (
      hostname.includes(
        "geeksforgeeks.org",
      )
    ) {
      console.log(
        "[CodeSyncVault] GFG content script initialized.",
      );

      await injectScript(
        "/gfg-page-bridge.js",
        {
          keepInDom: true,
        },
      );

      console.log(
        "[CodeSyncVault] GFG page bridge injected.",
      );

      const submitButton =
        await waitForGfgSubmitButton();

      if (!submitButton) {
        console.log(
          "[CodeSyncVault] GFG submit button not found.",
        );

        return;
      }

      console.log(
        "[CodeSyncVault] GFG submit button found.",
      );

      submitButton.addEventListener(
        "click",
        async () => {
          console.log(
            "[CodeSyncVault] GFG Submit clicked.",
          );

          const accepted =
            await waitForGfgAcceptedResult();

          if (!accepted) {
            console.log(
              "[CodeSyncVault] GFG submission was not accepted.",
            );

            return;
          }

          console.log(
            "[CodeSyncVault] GFG submission accepted.",
          );

          await ContentOrchestrator.start();
        },
      );

      return;
    }

    // --------------------------------------------------
    // HackerRank
    // --------------------------------------------------

    if (
      hostname.includes("hackerrank.com")
    ) {
      console.log(
        "[CodeSyncVault] HackerRank content script initialized.",
      );

      await injectScript(
        "/hackerrank-main-world.js",
        {
          keepInDom: true,
        },
      );

      console.log(
        "[CodeSyncVault] HackerRank main-world bridge injected.",
      );

      return;
    }
  },
});

// --------------------------------------------------
// LeetCode Submit Button
// --------------------------------------------------

async function waitForLeetCodeSubmitButton(): Promise<HTMLButtonElement | null> {
  const timeout = 30_000;
  const interval = 500;
  const startTime = Date.now();

  while (
    Date.now() - startTime <
    timeout
  ) {
    const button =
      document.querySelector(
        "button[data-e2e-locator='console-submit-button']",
      );

    if (
      button instanceof
      HTMLButtonElement
    ) {
      return button;
    }

    await sleep(interval);
  }

  return null;
}

// --------------------------------------------------
// GFG Submit Button
// --------------------------------------------------

async function waitForGfgSubmitButton(): Promise<HTMLButtonElement | null> {
  const timeout = 30_000;
  const interval = 500;
  const startTime = Date.now();

  while (
    Date.now() - startTime <
    timeout
  ) {
    const buttons =
      Array.from(
        document.querySelectorAll(
          "button",
        ),
      );

    const submitButton =
      buttons.find(
        (button) => {
          const text =
            button.textContent?.trim();

          return (
            text === "Submit" &&
            !button.disabled
          );
        },
      );

    if (submitButton) {
      return submitButton;
    }

    await sleep(interval);
  }

  return null;
}

// --------------------------------------------------
// GFG Accepted Result
// --------------------------------------------------

async function waitForGfgAcceptedResult(): Promise<boolean> {
  const timeout = 30_000;
  const interval = 500;
  const startTime = Date.now();

  while (
    Date.now() - startTime <
    timeout
  ) {
    const bodyText =
      document.body.innerText;

    if (
      bodyText.includes(
        "Problem Solved Successfully",
      )
    ) {
      return true;
    }

    await sleep(interval);
  }

  return false;
}

// --------------------------------------------------
// HackerRank Message Listener
// --------------------------------------------------

window.addEventListener(
  "message",
  async (
    event: MessageEvent,
  ) => {
    if (
      event.source !== window
    ) {
      return;
    }

    if (
      event.data?.type !==
      "CODEVAULT_HACKERRANK_SUBMISSION_ACCEPTED"
    ) {
      return;
    }

    const submission =
      event.data.submission;

    if (!submission) {
      console.warn(
        "[CodeSyncVault] HackerRank submission data missing.",
      );

      return;
    }

    console.log(
      "[CodeSyncVault] HackerRank accepted submission received.",
    );

    console.log(
      "[CodeSyncVault] HackerRank submission:",
      submission,
    );

    setLatestSubmission(
      submission,
    );

    console.log(
      "[CodeSyncVault] HackerRank accepted submission stored.",
    );

    await ContentOrchestrator.start();
  },
);

// --------------------------------------------------
// Utility
// --------------------------------------------------

function sleep(
  milliseconds: number,
): Promise<void> {
  return new Promise(
    (resolve) => {
      setTimeout(
        resolve,
        milliseconds,
      );
    },
  );
}
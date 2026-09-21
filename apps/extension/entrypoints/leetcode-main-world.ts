import { SOLUTION_MESSAGE } from "../src/features/platforms/leetcode/solution/solution-message";

declare global {
  interface Window {
    __codevaultMainWorldInitialized?: boolean;
  }
}

export default defineUnlistedScript(() => {
  if (window.__codevaultMainWorldInitialized) {
    console.debug(
      "[CodeSyncVault] Main world already initialized.",
    );

    return;
  }

  window.__codevaultMainWorldInitialized = true;

  console.log(
    "[CodeSyncVault] LeetCode main world initialized.",
  );

  window.addEventListener(
    "message",
    async (event: MessageEvent) => {
      if (
        event.source !== window
      ) {
        return;
      }

      if (
        event.data?.type !==
        "CODEVAULT_REQUEST_SOLUTION"
      ) {
        return;
      }

      console.log(
        "[CodeSyncVault] Solution request received.",
      );

      const model =
        await waitForMonacoModel();

      if (!model) {
        console.warn(
          "[CodeSyncVault] Monaco editor model not found.",
        );

        return;
      }

      const solution =
        model.getValue();

      console.log(
        "[CodeSyncVault] Solution received:",
        solution.length,
        "characters.",
      );

      window.postMessage(
        {
          type: SOLUTION_MESSAGE,
          solution,
        },
        "*",
      );
    },
  );

  async function waitForMonacoModel(): Promise<
    ReturnType<
      NonNullable<
        NonNullable<
          Window["monaco"]
        >["editor"]
      >["getModels"]
    >[number] | undefined
  > {
    const timeoutMs =
      30_000;

    const intervalMs =
      500;

    const startTime =
      Date.now();

    while (
      Date.now() - startTime <
      timeoutMs
    ) {
      const getModels =
        window.monaco
          ?.editor
          ?.getModels;

      if (
        typeof getModels ===
        "function"
      ) {
        const models =
          getModels();

        if (
          models.length > 0
        ) {
          return models[0];
        }
      }

      await new Promise<void>(
        (resolve) => {
          setTimeout(
            resolve,
            intervalMs,
          );
        },
      );
    }

    return undefined;
  }
});
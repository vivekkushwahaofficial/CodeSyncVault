/**
 * Extract the submitted source code from the GFG Ace Editor.
 *
 * The actual Ace editor instance exists in the page world,
 * so the content script requests the value through gfg-page-bridge.ts.
 */
export async function extractSolution(
  document: Document,
): Promise<string> {
  const REQUEST_EVENT = "codevault:gfg:get-solution";
  const RESPONSE_EVENT = "codevault:gfg:solution";

  return new Promise((resolve) => {
    let resolved = false;

    // Handle the response from the page-world bridge.
    const handleResponse = (event: Event) => {
      if (resolved) {
        return;
      }

      resolved = true;

      document.removeEventListener(
        RESPONSE_EVENT,
        handleResponse,
      );

      const customEvent =
        event as CustomEvent<string>;

      const code =
        customEvent.detail?.trim() ?? "";

      if (code) {
        console.log(
          "[CodeSyncVault] GFG solution extracted:",
          code.length,
          "characters",
        );
      } else {
        console.log(
          "[CodeSyncVault] GFG solution not found.",
        );
      }

      resolve(code);
    };

    // Listen before sending the request.
    document.addEventListener(
      RESPONSE_EVENT,
      handleResponse,
    );

    // Ask the page-world bridge for the Ace editor value.
    document.dispatchEvent(
      new CustomEvent(REQUEST_EVENT),
    );

    // Prevent the extension from waiting forever.
    setTimeout(() => {
      if (resolved) {
        return;
      }

      resolved = true;

      document.removeEventListener(
        RESPONSE_EVENT,
        handleResponse,
      );

      console.log(
        "[CodeSyncVault] GFG solution extraction timed out.",
      );

      resolve("");
    }, 5_000);
  });
}
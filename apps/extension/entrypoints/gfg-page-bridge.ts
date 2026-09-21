export default defineUnlistedScript(() => {
  const REQUEST_EVENT = "codevault:gfg:get-solution";
  const RESPONSE_EVENT = "codevault:gfg:solution";

  console.log("[CodeSyncVault] GFG page bridge initialized.");

  document.addEventListener(REQUEST_EVENT, () => {
    const editors = Array.from(
      document.querySelectorAll(".ace_editor"),
    );

    for (const editor of editors) {
      const aceEditor = (
        editor as HTMLElement & {
          env?: {
            editor?: {
              getValue?: () => string;
            };
          };
        }).env?.editor;

      const code = aceEditor?.getValue?.()?.trim();

      if (code) {
        console.log(
          "[CodeSyncVault] GFG bridge extracted:",
          code.length,
          "characters",
        );

        document.dispatchEvent(
          new CustomEvent(RESPONSE_EVENT, {
            detail: code,
          }),
        );

        return;
      }
    }

    console.log(
      "[CodeSyncVault] GFG bridge could not find Ace editor value.",
    );

    document.dispatchEvent(
      new CustomEvent(RESPONSE_EVENT, {
        detail: "",
      }),
    );
  });
});
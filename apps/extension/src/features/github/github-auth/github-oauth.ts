import { exchangeGithubCode } from "../api/github-token";
import { waitForBackend } from "../api/backend-health";
import { saveGithubSettings } from "./github-storage";

const GITHUB_CLIENT_ID =
  "Ov23liPu0u6Ux2Q6GgRS";

let authInFlight: Promise<string> | null = null;

async function authenticateGithubInternal(): Promise<string> {
  console.log(
    "[CodeSyncVault] Starting GitHub connection..."
  );

  try {
    console.log(
      "[CodeSyncVault] Checking backend availability..."
    );

    await waitForBackend();

    console.log(
      "[CodeSyncVault] Backend is ready."
    );

    const redirectUri =
      browser.identity.getRedirectURL();

    const githubUrl =
      new URL(
        "https://github.com/login/oauth/authorize"
      );

    githubUrl.searchParams.set(
      "client_id",
      GITHUB_CLIENT_ID
    );

    githubUrl.searchParams.set(
      "redirect_uri",
      redirectUri
    );

    githubUrl.searchParams.set(
      "scope",
      "repo user"
    );

    const oauthUrl =
      githubUrl.toString();

    console.log(
      "[CodeSyncVault] Starting GitHub OAuth..."
    );

    let responseUrl: string | undefined;

    try {
      responseUrl =
        await browser.identity.launchWebAuthFlow({
          url: oauthUrl,
          interactive: true,
        });
    } catch (oauthError) {
      console.error(
        "[CodeSyncVault] GitHub OAuth request failed."
      );

      throw oauthError;
    }

    if (!responseUrl) {
      throw new Error(
        "GitHub did not return response URL"
      );
    }

    const response =
      new URL(responseUrl);

    const code =
      response.searchParams.get("code");

    const githubError =
      response.searchParams.get("error");

    if (githubError) {
      throw new Error(
        `GitHub OAuth error: ${githubError}`
      );
    }

    if (!code) {
      throw new Error(
        "Authorization code not found"
      );
    }

    console.log(
      "[CodeSyncVault] Sending code to backend..."
    );

    const accessToken =
      await exchangeGithubCode(code);

    console.log(
      "[CodeSyncVault] GitHub authentication successful."
    );

    await saveGithubSettings({
      owner: "",
      repo: "",
      branch: "main",
      token: accessToken,
    });

    console.log(
      "[CodeSyncVault] GitHub settings saved"
    );

    return accessToken;
  } catch (error) {
    console.error(
      "[CodeSyncVault] GitHub OAuth failed:",
      error
    );

    alert(
      error instanceof Error
        ? error.message
        : String(error)
    );

    throw error;
  }
}

export function authenticateGithub(): Promise<string> {
  if (authInFlight) {
    console.log(
      "[CodeSyncVault] GitHub authentication already in progress."
    );

    return authInFlight;
  }

  authInFlight =
    authenticateGithubInternal().finally(() => {
      authInFlight = null;
    });

  return authInFlight;
}
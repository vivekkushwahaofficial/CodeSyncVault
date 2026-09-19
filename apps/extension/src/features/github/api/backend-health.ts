const BACKEND_HEALTH_URL =
  "https://codevault-backend-me91.onrender.com/api/health";

const RETRY_DELAY_MS = 3_000;
const REQUEST_TIMEOUT_MS = 5_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function checkBackendHealth(): Promise<boolean> {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(BACKEND_HEALTH_URL, {
      method: "GET",
      signal: controller.signal,
      cache: "no-store",
    });

    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function waitForBackend(): Promise<void> {
  while (true) {
    const healthy = await checkBackendHealth();

    if (healthy) {
      return;
    }

    await sleep(RETRY_DELAY_MS);
  }
}
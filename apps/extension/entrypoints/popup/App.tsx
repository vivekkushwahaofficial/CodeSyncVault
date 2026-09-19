import { useEffect, useState } from "react";

import Dashboard from "./components/Dashboard";
import RepositorySetup from "./components/RepositorySetup";

import { authenticateGithub } from "../../src/features/github/github-auth/github-oauth";
import { getGithubSettings } from "../../src/features/github/github-auth/github-storage";

const BACKEND_WAIT_SECONDS = 60;

export default function App() {
  const [loading, setLoading] = useState(true);

  const [githubConnected, setGithubConnected] = useState(false);

  const [repositoryConfigured, setRepositoryConfigured] = useState(false);

  const [connectingGithub, setConnectingGithub] = useState(false);

  const [remainingSeconds, setRemainingSeconds] =
    useState(BACKEND_WAIT_SECONDS);

  useEffect(() => {
    async function loadSettings() {
      const settings = await getGithubSettings();

      setGithubConnected(!!settings?.token);
      setRepositoryConfigured(!!settings?.repo);

      setLoading(false);
    }

    loadSettings();
  }, []);

  useEffect(() => {
    if (!connectingGithub) {
      return;
    }

    const startedAt = Date.now();

    const intervalId = window.setInterval(() => {
      const elapsedSeconds = Math.floor(
        (Date.now() - startedAt) / 1000,
      );

      const remaining = Math.max(
        BACKEND_WAIT_SECONDS - elapsedSeconds,
        0,
      );

      setRemainingSeconds(remaining);
    }, 250);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [connectingGithub]);

  async function connectGithub() {
    if (connectingGithub) {
      console.log(
        "[CodeVault] GitHub connection already in progress.",
      );

      return;
    }

    setConnectingGithub(true);
    setRemainingSeconds(BACKEND_WAIT_SECONDS);

    try {
      await authenticateGithub();

      setGithubConnected(true);
    } catch (error) {
      console.error(
        "[CodeVault] GitHub connection failed:",
        error,
      );
    } finally {
      setConnectingGithub(false);
      setRemainingSeconds(BACKEND_WAIT_SECONDS);
    }
  }

  const progressPercent = Math.min(
    ((BACKEND_WAIT_SECONDS - remainingSeconds) /
      BACKEND_WAIT_SECONDS) *
      100,
    100,
  );

  if (loading) {
    return (
      <div
        style={{
          width: "340px",
          boxSizing: "border-box",
          minHeight: "100vh",
          padding: "20px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!githubConnected) {
    return (
      <div
        style={{
          width: "340px",
          boxSizing: "border-box",
          minHeight: "100vh",
          padding: "20px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h2
          style={{
            margin: "0 0 16px",
            fontSize: "20px",
          }}
        >
          🚀 Welcome to CodeVault
        </h2>

        {!connectingGithub ? (
          <>
            <p
              style={{
                margin: "0 0 16px",
                fontSize: "13px",
              }}
            >
              Connect your GitHub account to continue.
            </p>

            <button
              onClick={connectGithub}
              style={{
                width: "100%",
                height: "40px",
                padding: "0 12px",
                border: "none",
                borderRadius: "10px",
                background: "#2563eb",
                color: "white",
                cursor: "pointer",
                boxSizing: "border-box",
              }}
            >
              Connect GitHub
            </button>
          </>
        ) : (
          <div
            style={{
              width: "100%",
              boxSizing: "border-box",
              marginTop: "16px",
              padding: "16px",
              borderRadius: "12px",
              background: "#f3f4f6",
              color: "#111827",
            }}
          >
            <div
              style={{
                fontSize: "15px",
                fontWeight: 600,
                marginBottom: "8px",
              }}
            >
              🔄 Connecting to GitHub
            </div>

            <p
              style={{
                margin: "0 0 12px",
                fontSize: "13px",
                lineHeight: 1.5,
              }}
            >
              CodeVault is starting its backend. This can
              take up to about 60 seconds when the server is
              waking up.
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              <span>Estimated startup progress</span>

              <span>
                {remainingSeconds > 0
                  ? `${Math.round(progressPercent)}%`
                  : "100%"}
              </span>
            </div>

            <div
              style={{
                marginTop: "10px",
                height: "6px",
                borderRadius: "999px",
                background: "#d1d5db",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${progressPercent}%`,
                  height: "100%",
                  background: "#2563eb",
                  transition: "width 250ms linear",
                }}
              />
            </div>

            <div
              style={{
                marginTop: "10px",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              {remainingSeconds > 0
                ? `Estimated wait: ${remainingSeconds}s`
                : "Still starting the backend..."}
            </div>

            <p
              style={{
                margin: "10px 0 0",
                fontSize: "12px",
                color: "#6b7280",
              }}
            >
              {remainingSeconds > 0
                ? "Please wait. GitHub will open automatically when the backend is ready."
                : "The server is taking longer than expected. We're still checking automatically. You don't need to click anything."}
            </p>
          </div>
        )}
      </div>
    );
  }

  if (!repositoryConfigured) {
    return (
      <RepositorySetup
        onRepositoryConfigured={() =>
          setRepositoryConfigured(true)
        }
      />
    );
  }

  return <Dashboard />;
}
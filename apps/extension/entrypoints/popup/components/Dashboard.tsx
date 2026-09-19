import { useEffect, useState } from "react";

import {
  getGithubSettings,
  type GithubSettings,
} from "../../../src/features/github/github-auth/github-storage";

const SUPPORTED_PLATFORMS = ["LeetCode", "GeeksforGeeks", "HackerRank"];

export default function Dashboard() {
  const [settings, setSettings] = useState<GithubSettings | null>(null);

  useEffect(() => {
    async function loadSettings() {
      const githubSettings = await getGithubSettings();

      setSettings(githubSettings);
    }

    loadSettings();
  }, []);

  return (
    <div
      style={{
        width: "340px",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2
        style={{
          margin: 0,
        }}
      >
        🚀 CodeVault
      </h2>

      <div
        style={{
          marginTop: "20px",
          padding: "12px",
          borderRadius: "10px",
          background: "#1f2937",
          border: "1px solid #374151",
        }}
      >
        <strong
          style={{
            color: "#22c55e",
          }}
        >
          🟢 Ready to Sync
        </strong>
      </div>

      <div
        style={{
          marginTop: "20px",
        }}
      >
        <p
          style={{
            color: "#9ca3af",
            marginBottom: "4px",
          }}
        >
          GitHub
        </p>

        <strong>{settings?.owner ?? "Not connected"}</strong>
      </div>

      <div
        style={{
          marginTop: "18px",
        }}
      >
        <p
          style={{
            color: "#9ca3af",
            marginBottom: "4px",
          }}
        >
          Repository
        </p>

        <strong>{settings?.repo ?? "No repository selected"}</strong>
      </div>

      <div
        style={{
          marginTop: "18px",
        }}
      >
        <p
          style={{
            color: "#9ca3af",
            marginBottom: "4px",
          }}
        >
          Branch
        </p>

        <strong>{settings?.branch ?? "Not configured"}</strong>
      </div>

      <hr
        style={{
          margin: "24px 0",
          border: "none",
          borderTop: "1px solid #444",
        }}
      />

      <div
        style={{
          textAlign: "center",
        }}
      >
        <p
          style={{
            marginBottom: "6px",
          }}
        >
          ⏳ Waiting for accepted solutions...
        </p>

        <p
          style={{
            margin: 0,
            color: "#9ca3af",
            fontSize: "12px",
          }}
        >
          {SUPPORTED_PLATFORMS.join(" • ")}
        </p>
      </div>
    </div>
  );
}

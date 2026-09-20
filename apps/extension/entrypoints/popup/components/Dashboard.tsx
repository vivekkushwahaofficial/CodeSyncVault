import { useEffect, useState } from "react";

import {
  getGithubSettings,
  type GithubSettings,
} from "../../../src/features/github/github-auth/github-storage";

import {
  loadStreakStats,
} from "../../../src/features/streak/streak-service";

import type {
  StreakStats,
} from "../../../src/features/streak/streak-types";

import StreakPage from "../pages/StreakPage";

const SUPPORTED_PLATFORMS = [
  "LeetCode",
  "GeeksforGeeks",
  "HackerRank",
];

export default function Dashboard() {
  const [settings, setSettings] =
    useState<GithubSettings | null>(null);

  const [streakStats, setStreakStats] =
    useState<StreakStats>({
      currentStreak: 0,
      longestStreak: 0,
      activeDays: 0,
      totalSolutions: 0,
      averageSolutionsPerActiveDay: 0,
      activityDates: [],
    });

  const [showStreak, setShowStreak] =
    useState(false);

  useEffect(() => {
    async function loadSettings() {
      const githubSettings =
        await getGithubSettings();

      setSettings(githubSettings);
    }

    loadSettings();
  }, []);

  useEffect(() => {
    async function loadStreak() {
      try {
        const stats =
          await loadStreakStats();

        setStreakStats(stats);
      } catch (error) {
        console.error(
          "[CodeVault] Failed to load streak:",
          error,
        );
      }
    }

    loadStreak();
  }, []);

  if (showStreak) {
    return (
      <StreakPage
        stats={streakStats}
        onBack={() => setShowStreak(false)}
      />
    );
  }

  return (
    <div
      style={{
        width: "340px",
        boxSizing: "border-box",
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

        <strong>
          {settings?.owner ?? "Not connected"}
        </strong>
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

        <strong>
          {settings?.repo ?? "No repository selected"}
        </strong>
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

        <strong>
          {settings?.branch ?? "Not configured"}
        </strong>
      </div>

      <button
        type="button"
        onClick={() => setShowStreak(true)}
        style={{
          width: "100%",
          marginTop: "24px",
          padding: "12px",
          border: "none",
          borderRadius: "10px",
          background: "#1f2937",
          color: "white",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: 600,
        }}
      >
        🔥 View Coding Streak
      </button>

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
import {
  useEffect,
  useState,
} from "react";

import type { StreakStats } from "../../../src/features/streak/streak-types";

interface StreakPageProps {
  stats: StreakStats;
  onBack: () => void;
}

interface Theme {
  pageBackground: string;
  text: string;
  secondaryText: string;
  mutedText: string;
  cardBackground: string;
  cardBorder: string;
  heroBackground: string;
  activityInactive: string;
  activityBorder: string;
  accent: string;
}

const DARK_THEME: Theme = {
  pageBackground: "#1f1f1f",
  text: "#f5f7fa",
  secondaryText: "#d1d5db",
  mutedText: "#9ca3af",
  cardBackground: "#202b3b",
  cardBorder: "#344154",
  heroBackground: "#182233",
  activityInactive: "#273244",
  activityBorder: "#344154",
  accent: "#22c55e",
};

const LIGHT_THEME: Theme = {
  pageBackground: "#ffffff",
  text: "#111827",
  secondaryText: "#374151",
  mutedText: "#6b7280",
  cardBackground: "#f8fafc",
  cardBorder: "#d9dee7",
  heroBackground: "#f8fafc",
  activityInactive: "#e5e7eb",
  activityBorder: "#d1d5db",
  accent: "#16a34a",
};

function useTheme(): Theme {
  const [isDark, setIsDark] =
    useState(() =>
      window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches,
    );

  useEffect(() => {
    const mediaQuery =
      window.matchMedia(
        "(prefers-color-scheme: dark)",
      );

    const handleChange = (
      event: MediaQueryListEvent,
    ) => {
      setIsDark(event.matches);
    };

    mediaQuery.addEventListener(
      "change",
      handleChange,
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        handleChange,
      );
    };
  }, []);

  return isDark
    ? DARK_THEME
    : LIGHT_THEME;
}

function usePageBackground(
  theme: Theme,
) {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    const previousHtmlBackground =
      html.style.backgroundColor;

    const previousBodyBackground =
      body.style.backgroundColor;

    const previousBodyColor =
      body.style.color;

    html.style.backgroundColor =
      theme.pageBackground;

    body.style.backgroundColor =
      theme.pageBackground;

    body.style.color = theme.text;

    return () => {
      html.style.backgroundColor =
        previousHtmlBackground;

      body.style.backgroundColor =
        previousBodyBackground;

      body.style.color =
        previousBodyColor;
    };
  }, [theme]);
}

function StatCard({
  icon,
  label,
  value,
  suffix,
  theme,
}: {
  icon: string;
  label: string;
  value: number | string;
  suffix?: string;
  theme: Theme;
}) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        padding: "9px 10px",
        borderRadius: "10px",
        background:
          theme.cardBackground,
        border:
          `1px solid ${theme.cardBorder}`,
      }}
    >
      <div
        style={{
          fontSize: "13px",
          lineHeight: 1,
          marginBottom: "6px",
        }}
      >
        {icon}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "3px",
          fontSize: "16px",
          lineHeight: 1.1,
          fontWeight: 700,
          color: theme.text,
        }}
      >
        <span>{value}</span>

        {suffix && (
          <span
            style={{
              fontSize: "9px",
              color: theme.mutedText,
              fontWeight: 500,
            }}
          >
            {suffix}
          </span>
        )}
      </div>

      <div
        style={{
          marginTop: "4px",
          color: theme.mutedText,
          fontSize: "9px",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function getLastSevenDays(): Date[] {
  const now = new Date();

  const today = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
    ),
  );

  return Array.from(
    { length: 7 },
    (_, index) => {
      const date = new Date(today);

      date.setUTCDate(
        today.getUTCDate() -
          (6 - index),
      );

      return date;
    },
  );
}

function formatDay(
  date: Date,
): string {
  return date.toLocaleDateString(
    undefined,
    {
      weekday: "short",
      timeZone: "UTC",
    },
  );
}

function formatDateKey(
  date: Date,
): string {
  return [
    date.getUTCFullYear(),
    String(
      date.getUTCMonth() + 1,
    ).padStart(2, "0"),
    String(
      date.getUTCDate(),
    ).padStart(2, "0"),
  ].join("-");
}

export default function StreakPage({
  stats,
  onBack,
}: StreakPageProps) {
  const theme = useTheme();

  usePageBackground(theme);

  const currentStreakLabel =
    stats.currentStreak === 1
      ? "day"
      : "days";

  const longestStreakLabel =
    stats.longestStreak === 1
      ? "day"
      : "days";

  const lastSevenDays =
    getLastSevenDays();

  return (
    <div
      style={{
        width: "340px",
        minHeight: "100vh",
        boxSizing: "border-box",
        padding: "12px 20px 9px",
        fontFamily:
          "Arial, sans-serif",
        color: theme.text,
        background:
          theme.pageBackground,
      }}
    >
      {/* Header */}

      <button
        onClick={onBack}
        style={{
          border: "none",
          background: "transparent",
          padding: 0,
          cursor: "pointer",
          color: theme.mutedText,
          fontSize: "11px",
          marginBottom: "7px",
        }}
      >
        ← Back
      </button>

      <div
        style={{
          fontSize: "10px",
          color: theme.mutedText,
          marginBottom: "2px",
          textTransform: "uppercase",
          letterSpacing: "0.07em",
        }}
      >
        Coding Consistency
      </div>

      <h2
        style={{
          margin: 0,
          fontSize: "18px",
          lineHeight: 1.2,
          fontWeight: 700,
          color: theme.text,
        }}
      >
        Keep the streak alive{" "}
        <span>🔥</span>
      </h2>

      {/* Current Streak */}

      <div
        style={{
          marginTop: "9px",
          padding: "14px 16px",
          borderRadius: "11px",
          background:
            theme.heroBackground,
          border:
            `1px solid ${theme.cardBorder}`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "31px",
            lineHeight: 1,
            fontWeight: 800,
            color: theme.text,
          }}
        >
          {stats.currentStreak}
        </div>

        <div
          style={{
            marginTop: "5px",
            color: theme.secondaryText,
            fontSize: "10px",
          }}
        >
          {currentStreakLabel} current streak
        </div>
      </div>

      {/* Statistics */}

      <div
        style={{
          display: "flex",
          gap: "7px",
          marginTop: "7px",
        }}
      >
        <StatCard
          icon="🏆"
          label="Longest Streak"
          value={stats.longestStreak}
          suffix={longestStreakLabel}
          theme={theme}
        />

        <StatCard
          icon="📅"
          label="Active Days"
          value={stats.activeDays}
          suffix="days"
          theme={theme}
        />
      </div>

      <div
        style={{
          display: "flex",
          gap: "7px",
          marginTop: "7px",
        }}
      >
        <StatCard
          icon="💻"
          label="Total Solutions"
          value={stats.totalSolutions}
          theme={theme}
        />

        <StatCard
          icon="📊"
          label="Avg / Active Day"
          value={
            stats.averageSolutionsPerActiveDay
          }
          theme={theme}
        />
      </div>

      {/* Last 7 Days */}

      <div
        style={{
          marginTop: "8px",
          padding: "10px",
          borderRadius: "10px",
          background:
            theme.cardBackground,
          border:
            `1px solid ${theme.cardBorder}`,
        }}
      >
        <div
          style={{
            fontSize: "11px",
            fontWeight: 600,
            marginBottom: "8px",
            color: theme.text,
          }}
        >
          Last 7 Days
        </div>

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            gap: "4px",
          }}
        >
          {lastSevenDays.map(
            (date) => {
              const dateKey =
                formatDateKey(date);

              const isActive =
                stats.activityDates.includes(
                  dateKey,
                );

              return (
                <div
                  key={dateKey}
                  style={{
                    flex: 1,
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "8px",
                      color:
                        theme.mutedText,
                      marginBottom: "3px",
                    }}
                  >
                    {formatDay(date)}
                  </div>

                  <div
                    title={
                      isActive
                        ? `${formatDay(date)} — Solved`
                        : `${formatDay(date)} — No activity`
                    }
                    style={{
                      width: "100%",
                      height: "20px",
                      borderRadius: "4px",
                      background:
                        isActive
                          ? theme.accent
                          : theme.activityInactive,
                      border:
                        `1px solid ${theme.activityBorder}`,
                      boxSizing:
                        "border-box",
                    }}
                  />
                </div>
              );
            },
          )}
        </div>
      </div>

      {/* Footer */}

      <div
        style={{
          marginTop: "7px",
          textAlign: "center",
          color: theme.mutedText,
          fontSize: "8px",
        }}
      >
        CodeVault • Coding Progress
      </div>
    </div>
  );
}
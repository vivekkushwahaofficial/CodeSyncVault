import type { RepositoryIndex } from "./types";

/**
 * Generates a GitHub-compatible coding activity heatmap.
 *
 * The heatmap represents the 365-day period ending on the
 * latest valid solved date in the repository index.
 *
 * Activity intensity is deterministic:
 *
 * 0      -> level 0
 * 1      -> level 1
 * 2      -> level 2
 * 3-4    -> level 3
 * 5+     -> level 4
 *
 * No external services are required.
 */
export function generateActivityHeatmap(
  index: RepositoryIndex,
): string {
  const dailyCounts = collectDailyCounts(index);

  if (dailyCounts.size === 0) {
    return generateEmptyHeatmap();
  }

  const latestDate = getLatestDate(dailyCounts);

  const endDate =
    endOfWeek(latestDate);

  const startDate =
    startOfWeek(
      addDays(endDate, -364),
    );

  const weeks =
    generateWeeks(
      startDate,
      endDate,
    );

  const cellSize = 10;
  const cellGap = 3;
  const cellStep =
    cellSize + cellGap;

  const gridX = 45;
  const gridY = 25;

  const width =
    Math.max(
      720,
      gridX +
      weeks.length *
      cellStep +
      5,
    );

  const height = 150;

  const cells: string[] = [];

  for (
    const [weekIndex, week] of
    weeks.entries()
  ) {
    for (
      const [dayIndex, date] of
      week.entries()
    ) {
      const key =
        toDateKey(date);

      const count =
        dailyCounts.get(key) ??
        0;

      const x =
        gridX +
        weekIndex *
        cellStep;

      const y =
        gridY +
        dayIndex *
        cellStep;

      const level =
        getActivityLevel(count);

      cells.push(
        createActivityCell({
          x,
          y,
          size: cellSize,
          level,
          dateKey: key,
          count,
        }),
      );
    }
  }

  const monthLabels =
    generateMonthLabels(
      startDate,
      endDate,
      gridX,
      cellStep,
    );

  return [
    `<svg`,
    `xmlns="http://www.w3.org/2000/svg"`,
    `width="${width}"`,
    `height="${height}"`,
    `viewBox="0 0 ${width} ${height}"`,
    `role="img"`,
    `aria-labelledby="title description"`,
    `>`,
    `<title id="title">CodeSyncVault Coding Activity</title>`,
    `<desc id="description">Daily coding solution activity for the latest 365 days represented in the CodeSyncVault repository.</desc>`,
    `<rect width="100%" height="100%" fill="#0d1117" rx="8"/>`,
    monthLabels,
    cells.join(""),
    generateWeekdayLabels(
      gridY,
      cellStep,
    ),
    generateLegend(
      width,
      height,
    ),
    `</svg>`,
  ].join(" ");
}

/**
 * Collects solution counts by UTC calendar date.
 *
 * Invalid or missing solvedAt values are ignored so one
 * malformed record cannot break README generation.
 */
function collectDailyCounts(
  index: RepositoryIndex,
): Map<string, number> {
  const counts =
    new Map<string, number>();

  for (
    const solution of
    index.solutions
  ) {
    if (!solution.solvedAt) {
      continue;
    }

    const date =
      new Date(
        solution.solvedAt,
      );

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      continue;
    }

    const key =
      toDateKey(date);

    counts.set(
      key,
      (counts.get(key) ?? 0) + 1,
    );
  }

  return counts;
}

/**
 * Returns the latest solved date.
 */
function getLatestDate(
  counts: Map<string, number>,
): Date {
  let latest =
    new Date(0);

  for (
    const key of counts.keys()
  ) {
    const date =
      fromDateKey(key);

    if (
      date.getTime() >
      latest.getTime()
    ) {
      latest = date;
    }
  }

  return latest;
}

/**
 * Generates all calendar weeks between two dates.
 */
function generateWeeks(
  startDate: Date,
  endDate: Date,
): Date[][] {
  const weeks: Date[][] = [];

  let current =
    new Date(startDate);

  while (
    current.getTime() <=
    endDate.getTime()
  ) {
    const week: Date[] = [];

    for (
      let day = 0;
      day < 7;
      day += 1
    ) {
      week.push(
        new Date(current),
      );

      current =
        addDays(
          current,
          1,
        );
    }

    weeks.push(week);
  }

  return weeks;
}

/**
 * Converts a Date to YYYY-MM-DD using UTC.
 */
function toDateKey(
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

/**
 * Converts YYYY-MM-DD to a UTC Date.
 */
function fromDateKey(
  value: string,
): Date {
  return new Date(
    `${value}T00:00:00.000Z`,
  );
}

/**
 * Adds days without mutating the input Date.
 */
function addDays(
  date: Date,
  days: number,
): Date {
  const result =
    new Date(date);

  result.setUTCDate(
    result.getUTCDate() +
    days,
  );

  return result;
}

/**
 * Returns Sunday at the beginning of the week.
 */
function startOfWeek(
  date: Date,
): Date {
  const result =
    new Date(date);

  result.setUTCDate(
    result.getUTCDate() -
    result.getUTCDay(),
  );

  return result;
}

/**
 * Returns Saturday at the end of the week.
 */
function endOfWeek(
  date: Date,
): Date {
  return addDays(
    startOfWeek(date),
    6,
  );
}

/**
 * Determines the deterministic activity level.
 *
 * 0      -> empty
 * 1      -> light
 * 2      -> medium-light
 * 3-4    -> medium
 * 5+     -> strongest
 */
function getActivityLevel(
  count: number,
): number {
  if (count <= 0) {
    return 0;
  }

  if (count === 1) {
    return 1;
  }

  if (count === 2) {
    return 2;
  }

  if (count <= 4) {
    return 3;
  }

  return 4;
}

/**
 * Creates one activity cell.
 */
function createActivityCell(
  options: {
    x: number;
    y: number;
    size: number;
    level: number;
    dateKey: string;
    count: number;
  },
): string {
  const {
    x,
    y,
    size,
    level,
    dateKey,
    count,
  } = options;

  return [
    `<rect`,
    `x="${x}"`,
    `y="${y}"`,
    `width="${size}"`,
    `height="${size}"`,
    `rx="2"`,
    `fill="${getLevelColor(level)}"`,
    `>`,
    `<title>${escapeXml(
      `${dateKey}: ${count} ${count === 1
        ? "solution"
        : "solutions"
      }`,
    )}</title>`,
    `</rect>`,
  ].join(" ");
}

/**
 * Returns the GitHub-style color
 * for an activity level.
 */
function getLevelColor(
  level: number,
): string {
  const colors: readonly string[] = [
    "#161b22",
    "#0e4429",
    "#006d32",
    "#26a641",
    "#39d353",
  ];

  return (
    colors[level] ??
    "#161b22"
  );
}

/**
 * Generates month labels.
 */
function generateMonthLabels(
  startDate: Date,
  endDate: Date,
  gridX: number,
  cellStep: number,
): string {
  const labels: string[] = [];

  let current =
    new Date(startDate);

  let previousMonth = -1;

  while (
    current.getTime() <=
    endDate.getTime()
  ) {
    const month =
      current.getUTCMonth();

    if (
      month !== previousMonth &&
      current.getUTCDay() === 0
    ) {
      const weekIndex =
        Math.floor(
          (
            current.getTime() -
            startDate.getTime()
          ) /
          (
            7 *
            24 *
            60 *
            60 *
            1000
          ),
        );

      labels.push(
        [
          `<text`,
          `x="${gridX + weekIndex * cellStep}"`,
          `y="20"`,
          `fill="#8b949e"`,
          `font-family="Arial, sans-serif"`,
          `font-size="9"`,
          `>`,
          getMonthName(month),
          `</text>`,
        ].join(" "),
      );

      previousMonth =
        month;
    }

    current =
      addDays(current, 1);
  }

  return labels.join("");
}

/**
 * Generates weekday labels.
 */
function generateWeekdayLabels(
  gridY: number,
  cellStep: number,
): string {
  return [
    `<text x="8" y="${gridY + cellStep * 1}" fill="#8b949e" font-family="Arial, sans-serif" font-size="8">Mon</text>`,
    `<text x="8" y="${gridY + cellStep * 3}" fill="#8b949e" font-family="Arial, sans-serif" font-size="8">Wed</text>`,
    `<text x="8" y="${gridY + cellStep * 5}" fill="#8b949e" font-family="Arial, sans-serif" font-size="8">Fri</text>`,
  ].join(" ");
}

/**
 * Generates the activity legend.
 */
function generateLegend(
  width: number,
  height: number,
): string {
  const startX =
    width - 125;

  const y =
    height - 13;

  const cells = [
    0,
    1,
    2,
    3,
    4,
  ].map(
    (level, index) =>
      `<rect x="${startX + 28 + index * 13}" y="${y - 8}" width="10" height="10" rx="2" fill="${getLevelColor(level)}"/>`,
  );

  return [
    `<text x="${startX}" y="${y}" fill="#8b949e" font-family="Arial, sans-serif" font-size="8">Less</text>`,
    cells.join(""),
    `<text x="${startX + 95}" y="${y}" fill="#8b949e" font-family="Arial, sans-serif" font-size="8">More</text>`,
  ].join(" ");
}

/**
 * Returns a short month name.
 */
function getMonthName(
  month: number,
): string {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return (
    months[month] ??
    ""
  );
}

/**
 * Generates the empty state.
 */
function generateEmptyHeatmap(): string {
  return [
    `<svg`,
    `xmlns="http://www.w3.org/2000/svg"`,
    `width="720"`,
    `height="80"`,
    `viewBox="0 0 720 80"`,
    `role="img"`,
    `aria-labelledby="title description"`,
    `>`,
    `<title id="title">CodeSyncVault Coding Activity</title>`,
    `<desc id="description">No coding activity yet.</desc>`,
    `<rect width="100%" height="100%" fill="#0d1117" rx="8"/>`,
    `<text x="360" y="44" text-anchor="middle" fill="#8b949e" font-family="Arial, sans-serif" font-size="12">No coding activity yet</text>`,
    `</svg>`,
  ].join(" ");
}

/**
 * Escapes text inserted into SVG/XML content.
 */
function escapeXml(
  value: string,
): string {
  return value
    .replaceAll(
      "&",
      "&amp;",
    )
    .replaceAll(
      "<",
      "&lt;",
    )
    .replaceAll(
      ">",
      "&gt;",
    )
    .replaceAll(
      "\"",
      "&quot;",
    )
    .replaceAll(
      "'",
      "&apos;",
    );
}
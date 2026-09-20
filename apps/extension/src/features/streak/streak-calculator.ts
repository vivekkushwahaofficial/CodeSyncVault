import type { StreakStats } from "./streak-types";

export function calculateStreak(
  solvedAtDates: string[],
): StreakStats {
  const dates = normalizeDates(solvedAtDates);

  const totalSolutions =
    solvedAtDates.filter(
      (date) => isValidDate(date),
    ).length;

  if (dates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      activeDays: 0,
      totalSolutions,
      averageSolutionsPerActiveDay: 0,
      activityDates: [],
    };
  }

  let longestStreak = 1;
  let currentRun = 1;

  for (
    let index = 1;
    index < dates.length;
    index += 1
  ) {
    const previousDate = dates[index - 1];
    const currentDate = dates[index];

    if (!previousDate || !currentDate) {
      continue;
    }

    if (
      isNextDay(
        previousDate,
        currentDate,
      )
    ) {
      currentRun += 1;

      longestStreak = Math.max(
        longestStreak,
        currentRun,
      );
    } else {
      currentRun = 1;
    }
  }

  const activeDays = dates.length;

  return {
    currentStreak:
      calculateCurrentStreak(dates),
    longestStreak,
    activeDays,
    totalSolutions,
    averageSolutionsPerActiveDay:
      Number(
        (
          totalSolutions / activeDays
        ).toFixed(1),
      ),
    activityDates: dates,
  };
}

function normalizeDates(
  solvedAtDates: string[],
): string[] {
  return [
    ...new Set(
      solvedAtDates
        .map(toDateKey)
        .filter(
          (date): date is string =>
            date !== null,
        ),
    ),
  ].sort();
}

function toDateKey(
  value: string,
): string | null {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

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

function isValidDate(
  value: string,
): boolean {
  const date = new Date(value);

  return !Number.isNaN(
    date.getTime(),
  );
}

function isNextDay(
  previous: string,
  current: string,
): boolean {
  const difference =
    fromDateKey(current).getTime() -
    fromDateKey(previous).getTime();

  return (
    difference ===
    24 * 60 * 60 * 1000
  );
}

function calculateCurrentStreak(
  dates: string[],
): number {
  const latestDateValue =
    dates[dates.length - 1];

  if (!latestDateValue) {
    return 0;
  }

  const latestDate =
    fromDateKey(latestDateValue);

  const today =
    startOfToday();

  const yesterday =
    addDays(today, -1);

  if (
    latestDate.getTime() !==
      today.getTime() &&
    latestDate.getTime() !==
      yesterday.getTime()
  ) {
    return 0;
  }

  let streak = 1;

  for (
    let index = dates.length - 1;
    index > 0;
    index -= 1
  ) {
    const previousDate =
      dates[index - 1];

    const currentDate =
      dates[index];

    if (
      !previousDate ||
      !currentDate
    ) {
      break;
    }

    if (
      isNextDay(
        previousDate,
        currentDate,
      )
    ) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
}

function fromDateKey(
  value: string,
): Date {
  return new Date(
    `${value}T00:00:00.000Z`,
  );
}

function startOfToday(): Date {
  const now = new Date();

  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
    ),
  );
}

function addDays(
  date: Date,
  days: number,
): Date {
  const result = new Date(date);

  result.setUTCDate(
    result.getUTCDate() + days,
  );

  return result;
}
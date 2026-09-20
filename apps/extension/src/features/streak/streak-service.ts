import type { RepositoryIndex } from "../repository-engine/types";

import {
  readRepositoryIndex,
} from "./streak-repository";

import {
  calculateStreak,
} from "./streak-calculator";

import type {
  StreakStats,
} from "./streak-types";

export function getStreakStats(
  index: RepositoryIndex,
): StreakStats {
  const solvedAtDates =
    index.solutions
      .map(
        (solution) =>
          solution.solvedAt,
      )
      .filter(
        (date): date is string =>
          Boolean(date),
      );

  return calculateStreak(
    solvedAtDates,
  );
}

export async function loadStreakStats(): Promise<StreakStats> {
  const index =
    await readRepositoryIndex();

  return getStreakStats(index);
}
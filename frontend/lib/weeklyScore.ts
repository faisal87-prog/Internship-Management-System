export interface WeeklyTaskScore {
  taskTitle: string;
  score: number;
}

export function averageWeeklyScore(scores: WeeklyTaskScore[]): number | null {
  if (!scores.length) return null;
  const total = scores.reduce((sum, row) => sum + row.score, 0);
  return Math.round(total / scores.length);
}

export function formatScoreOutOf100(score: number) {
  return `${score} / 100`;
}

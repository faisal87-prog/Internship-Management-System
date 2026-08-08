import { tasks, taskAssignments } from "@/mock/data";

export interface WeeklyTaskScore {
  taskTitle: string;
  score: number;
}

/** Average mentor scores for an intern's tasks in a given week (out of 100). */
export function getWeeklyTaskScores(
  internProfileId: string,
  weekNumber: number,
): WeeklyTaskScore[] {
  const weekTaskIds = new Set(
    tasks.filter((t) => t.weekNumber === weekNumber).map((t) => t.id),
  );

  return taskAssignments
    .filter(
      (ta) =>
        ta.internProfileId === internProfileId &&
        weekTaskIds.has(ta.taskId) &&
        typeof ta.score === "number",
    )
    .map((ta) => {
      const task = tasks.find((t) => t.id === ta.taskId);
      return {
        taskTitle: task?.title ?? "Task",
        score: ta.score as number,
      };
    });
}

export function averageWeeklyScore(scores: WeeklyTaskScore[]): number | null {
  if (!scores.length) return null;
  const total = scores.reduce((sum, row) => sum + row.score, 0);
  return Math.round(total / scores.length);
}

export function formatScoreOutOf100(score: number) {
  return `${score} / 100`;
}

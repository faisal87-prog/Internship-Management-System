import type { FinalSummary } from "@/types";

export function FinalSummaryContent({
  content,
}: {
  content: FinalSummary["content"];
}) {
  return (
    <div className="space-y-4 text-sm">
      <div>
        <h2 className="font-semibold text-ink">Overall Performance Summary</h2>
        <p className="mt-1 text-ink-muted">{content.overallPerformanceSummary}</p>
      </div>
      <div>
        <h2 className="font-semibold text-ink">Learning Journey</h2>
        <p className="mt-1 text-ink-muted">{content.learningJourney}</p>
      </div>
      <div>
        <h2 className="font-semibold text-ink">Main Achievements</h2>
        <ul className="mt-1 list-disc pl-5 text-ink-muted">
          {content.mainAchievements.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="font-semibold text-ink">Goal Achievement</h2>
        <p className="mt-1 text-ink-muted">{content.goalAchievement}</p>
      </div>
      <div>
        <h2 className="font-semibold text-ink">Final Performance Summary</h2>
        <p className="mt-1 text-ink-muted">{content.finalPerformanceSummary}</p>
      </div>
    </div>
  );
}

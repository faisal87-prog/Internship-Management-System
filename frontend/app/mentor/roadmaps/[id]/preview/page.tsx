"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { roadmaps } from "@/mock/data";

export default function RoadmapPreviewPage() {
  const params = useParams<{ id: string }>();
  const roadmap = roadmaps.find((r) => r.id === params.id);
  if (!roadmap) return <p>Roadmap not found.</p>;

  return (
    <div>
      <PageHeader
        title="Intern preview"
        description="Preview how assigned interns will see weekly focus, objectives, and tasks."
        actions={
          <Link href={`/mentor/roadmaps/${roadmap.id}`} className="btn-secondary">
            Back to roadmap
          </Link>
        }
      />
      <div className="mx-auto max-w-3xl space-y-4">
        <section className="card p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand">Your learning roadmap</p>
          <h2 className="mt-2 text-2xl font-bold text-ink">{roadmap.title}</h2>
          <p className="mt-2 text-ink-muted">{roadmap.summary}</p>
        </section>
        {roadmap.weeks.map((week) => (
          <section key={week.weekNumber} className="card p-5">
            <h3 className="text-lg font-semibold text-ink">
              Week {week.weekNumber}: {week.weeklyFocus}
            </h3>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink-muted">
              {week.weeklyLearningObjectives.map((obj) => (
                <li key={obj}>{obj}</li>
              ))}
            </ul>
            <div className="mt-4 space-y-2">
              {week.suggestedTasks.map((task) => (
                <div key={task.id} className="rounded-xl bg-surface-muted px-3 py-2 text-sm">
                  <p className="font-medium text-ink">{task.title}</p>
                  <p className="text-ink-muted">{task.estimatedTime}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { roadmapScopeLabel } from "@/lib/labels";
import { getProgram, roadmaps } from "@/mock/data";

export default function RoadmapDetailPage() {
  const params = useParams<{ id: string }>();
  const roadmap = roadmaps.find((r) => r.id === params.id);
  const [status, setStatus] = useState(roadmap?.status);
  const [message, setMessage] = useState("");

  if (!roadmap || !status) return <p>Roadmap not found.</p>;
  const program = getProgram(roadmap.programId);

  function publish() {
    if (status !== "DRAFT") return;
    setStatus("PUBLISHED");
    setMessage(
      "Mock publish complete. All approved roadmap tasks for all weeks would be created and assigned.",
    );
  }

  return (
    <div>
      <PageHeader
        title={roadmap.title}
        description={roadmap.summary}
        actions={
          <>
            <Link href={`/mentor/roadmaps/${roadmap.id}/edit`} className="btn-secondary">
              Edit draft
            </Link>
            <Link href={`/mentor/roadmaps/${roadmap.id}/preview`} className="btn-secondary">
              Preview
            </Link>
            {status === "DRAFT" ? (
              <button type="button" className="btn-primary" onClick={publish}>
                Publish roadmap
              </button>
            ) : null}
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <StatusBadge kind="roadmap" value={status} />
        <span className="rounded-full bg-brand-light px-2.5 py-1 text-xs font-semibold text-brand-dark">
          {roadmapScopeLabel[roadmap.scope]}
        </span>
        <span className="text-sm text-ink-muted">{program?.title}</span>
      </div>
      {message ? (
        <p className="mb-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700" role="status">
          {message}
        </p>
      ) : null}

      <div className="space-y-4">
        {roadmap.weeks.map((week) => (
          <section key={week.weekNumber} className="card p-5">
            <h2 className="section-title">
              Week {week.weekNumber}: {week.weeklyFocus}
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              Objectives: {week.weeklyLearningObjectives.join(" · ")}
            </p>
            <ul className="mt-4 space-y-3">
              {week.suggestedTasks.map((task) => (
                <li key={task.id} className="rounded-xl border border-line p-3">
                  <p className="font-semibold text-ink">{task.title}</p>
                  <p className="mt-1 text-sm text-ink-muted">{task.description}</p>
                  <p className="mt-2 text-xs text-ink-muted">
                    {task.difficulty} · {task.estimatedTime} · {task.requirementType}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

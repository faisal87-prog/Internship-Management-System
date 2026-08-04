"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ProgramSummary } from "@/components/programs/ProgramSummary";
import { RoadmapReadOnlyView } from "@/components/roadmaps/RoadmapWeekView";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { roadmapScopeLabel } from "@/lib/labels";
import { getProgram, roadmaps as initialRoadmaps } from "@/mock/data";
import type { Roadmap } from "@/types";

export default function RoadmapDetailPage() {
  const params = useParams<{ id: string }>();
  const seed = initialRoadmaps.find((r) => r.id === params.id);
  const [roadmap, setRoadmap] = useState<Roadmap | undefined>(
    seed ? structuredClone(seed) : undefined,
  );
  const [message, setMessage] = useState("");

  if (!roadmap) return <p>Roadmap not found.</p>;
  const program = getProgram(roadmap.programId);

  function publish() {
    setRoadmap((prev) => {
      if (!prev || prev.status !== "DRAFT") return prev;
      return { ...prev, status: "PUBLISHED" };
    });
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
              Edit roadmap
            </Link>
            <Link href={`/mentor/roadmaps/${roadmap.id}/preview`} className="btn-secondary">
              Preview
            </Link>
            {roadmap.status === "DRAFT" ? (
              <button type="button" className="btn-primary" onClick={publish}>
                Publish roadmap
              </button>
            ) : null}
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <StatusBadge kind="roadmap" value={roadmap.status} />
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

      {program ? (
        <section className="card mb-4 p-5">
          <h2 className="section-title mb-3">Program summary</h2>
          <ProgramSummary program={program} compact />
        </section>
      ) : null}

      <RoadmapReadOnlyView roadmap={roadmap} />
    </div>
  );
}

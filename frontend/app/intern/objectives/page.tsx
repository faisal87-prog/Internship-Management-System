"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { useMockAuth } from "@/context/MockAuthContext";
import { getInternContext } from "@/lib/intern";

export default function InternObjectivesPage() {
  const { user } = useMockAuth();
  const ctx = user ? getInternContext(user.id) : null;
  const weeks = ctx?.roadmap?.weeks ?? [];

  return (
    <div>
      <PageHeader
        title="Weekly learning objectives"
        description="Objectives from your published roadmap. Draft roadmaps are not shown to interns."
      />
      {weeks.length === 0 ? (
        <EmptyState
          title="No published objectives yet"
          description="Your mentor will publish a roadmap before weekly objectives appear here."
        />
      ) : (
        <div className="space-y-4">
          {weeks.map((week) => (
            <section key={week.weekNumber} className="card p-5">
              <h2 className="section-title">
                Week {week.weekNumber}: {week.weeklyFocus}
              </h2>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink-muted">
                {week.weeklyLearningObjectives.map((obj) => (
                  <li key={obj}>{obj}</li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-ink">
                Expected skills: {week.expectedSkillsGained.join(", ")}
              </p>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

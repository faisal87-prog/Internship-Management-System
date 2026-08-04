"use client";

import { RoadmapReadOnlyView } from "@/components/roadmaps/RoadmapWeekView";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { useMockAuth } from "@/context/MockAuthContext";
import { getInternContext } from "@/lib/intern";

export default function InternObjectivesPage() {
  const { user } = useMockAuth();
  const ctx = user ? getInternContext(user.id) : null;
  const roadmap = ctx?.roadmap;

  return (
    <div>
      <PageHeader
        title="Weekly learning objectives"
        description="Read-only view of your published roadmap. Draft roadmaps and mentor editing controls are not shown."
      />
      {!roadmap ? (
        <EmptyState
          title="No published objectives yet"
          description="Your mentor will publish a roadmap before weekly objectives appear here."
        />
      ) : (
        <RoadmapReadOnlyView roadmap={roadmap} />
      )}
    </div>
  );
}

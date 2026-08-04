"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { RoadmapReadOnlyView } from "@/components/roadmaps/RoadmapWeekView";
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
      <div className="mx-auto max-w-3xl">
        <RoadmapReadOnlyView roadmap={roadmap} />
      </div>
    </div>
  );
}

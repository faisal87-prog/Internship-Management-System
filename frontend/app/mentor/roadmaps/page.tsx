"use client";

import Link from "next/link";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useMockAuth } from "@/context/MockAuthContext";
import { roadmapScopeLabel } from "@/lib/labels";
import { getProgram, programs, roadmaps } from "@/mock/data";

export default function MentorRoadmapsPage() {
  const { user } = useMockAuth();
  const myProgramIds = programs.filter((p) => p.mentorId === user?.id).map((p) => p.id);
  const mine = roadmaps.filter((r) => myProgramIds.includes(r.programId));

  return (
    <div>
      <PageHeader
        title="Roadmaps"
        description="Generate AI roadmaps as drafts, edit content, preview, and publish. Publishing creates tasks for all weeks."
        actions={
          <Link href="/mentor/roadmaps/generate" className="btn-primary">
            Generate roadmap
          </Link>
        }
      />
      <DataTable
        rows={mine}
        mobileTitle={(row) => row.title}
        columns={[
          {
            key: "title",
            header: "Roadmap",
            render: (row) => (
              <Link href={`/mentor/roadmaps/${row.id}`} className="font-medium text-brand hover:underline">
                {row.title}
              </Link>
            ),
          },
          {
            key: "program",
            header: "Program",
            render: (row) => getProgram(row.programId)?.title ?? "—",
          },
          {
            key: "scope",
            header: "Scope",
            render: (row) => roadmapScopeLabel[row.scope],
          },
          {
            key: "status",
            header: "Status",
            render: (row) => <StatusBadge kind="roadmap" value={row.status} />,
          },
          {
            key: "weeks",
            header: "Weeks",
            render: (row) => row.numberOfWeeks,
          },
        ]}
      />
    </div>
  );
}

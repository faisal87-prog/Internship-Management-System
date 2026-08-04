"use client";

import Link from "next/link";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useMockAuth } from "@/context/MockAuthContext";
import { finalSummaries, fullName, getUser, internProfiles, programs } from "@/mock/data";

export default function MentorFinalSummariesPage() {
  const { user } = useMockAuth();
  const myProgramIds = programs.filter((p) => p.mentorId === user?.id).map((p) => p.id);
  const visible = finalSummaries.filter((fs) => myProgramIds.includes(fs.programId));

  return (
    <div>
      <PageHeader
        title="Final internship summaries"
        description="Generate, review, add final score/comments, approve, and download PDF (ReportLab on backend later)."
        actions={
          <Link href="/mentor/final-summaries/generate" className="btn-primary">
            Generate summary
          </Link>
        }
      />
      <DataTable
        rows={visible}
        mobileTitle={(row) => row.id}
        columns={[
          {
            key: "intern",
            header: "Intern",
            render: (row) => {
              const u = getUser(
                internProfiles.find((ip) => ip.id === row.internProfileId)?.userId ?? "",
              );
              return u ? fullName(u) : "—";
            },
          },
          {
            key: "status",
            header: "Status",
            render: (row) => <StatusBadge kind="ai" value={row.status} />,
          },
          {
            key: "preview",
            header: "Summary preview",
            render: (row) => (
              <p className="max-w-xs text-xs text-ink-muted line-clamp-2">
                {row.content.overallPerformanceSummary}
              </p>
            ),
          },
          {
            key: "score",
            header: "Final score",
            render: (row) =>
              typeof row.mentorFinalScore === "number" ? `${row.mentorFinalScore}/100` : "—",
          },
          {
            key: "action",
            header: "Action",
            render: (row) => (
              <Link href={`/mentor/final-summaries/${row.id}`} className="btn-secondary px-3 py-1.5 text-xs">
                Open
              </Link>
            ),
          },
        ]}
      />
    </div>
  );
}

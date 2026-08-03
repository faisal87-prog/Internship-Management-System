"use client";

import Link from "next/link";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useMockAuth } from "@/context/MockAuthContext";
import { fullName, getUser, internProfiles, weeklyReports } from "@/mock/data";

export default function MentorWeeklyReportsPage() {
  const { user } = useMockAuth();
  const myInterns = internProfiles.filter((ip) => ip.mentorId === user?.id);
  const mine = weeklyReports.filter((r) =>
    myInterns.some((ip) => ip.id === r.internProfileId),
  );

  return (
    <div>
      <PageHeader
        title="Weekly performance reports"
        description="Generate reports manually after reviewing submissions and scores. Interns see reports only after approval."
        actions={
          <Link href="/mentor/weekly-reports/generate" className="btn-primary">
            Generate report
          </Link>
        }
      />
      <DataTable
        rows={mine}
        mobileTitle={(row) => `Week ${row.weekNumber}`}
        columns={[
          {
            key: "week",
            header: "Week",
            render: (row) => `Week ${row.weekNumber}`,
          },
          {
            key: "intern",
            header: "Intern",
            render: (row) => {
              const u = getUser(
                myInterns.find((ip) => ip.id === row.internProfileId)?.userId ?? "",
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
            key: "action",
            header: "Action",
            render: (row) => (
              <Link href={`/mentor/weekly-reports/${row.id}`} className="btn-secondary px-3 py-1.5 text-xs">
                Open
              </Link>
            ),
          },
        ]}
      />
    </div>
  );
}

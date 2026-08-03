"use client";

import Link from "next/link";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useMockAuth } from "@/context/MockAuthContext";
import { formatDate } from "@/lib/labels";
import { programs } from "@/mock/data";

export default function MentorProgramsPage() {
  const { user } = useMockAuth();
  const mine = programs.filter((p) => p.mentorId === user?.id);

  return (
    <div>
      <PageHeader
        title="Programs"
        description="Create and manage internship programs you own. Program status changes are manual."
        actions={
          <Link href="/mentor/programs/new" className="btn-primary">
            Create program
          </Link>
        }
      />
      <DataTable
        rows={mine}
        mobileTitle={(row) => row.title}
        columns={[
          {
            key: "title",
            header: "Program",
            render: (row) => (
              <Link href={`/mentor/programs/${row.id}`} className="font-medium text-brand hover:underline">
                {row.title}
              </Link>
            ),
          },
          {
            key: "role",
            header: "Role",
            render: (row) => row.role,
          },
          {
            key: "status",
            header: "Status",
            render: (row) => <StatusBadge kind="program" value={row.status} />,
          },
          {
            key: "dates",
            header: "Dates",
            render: (row) => `${formatDate(row.startDate)} – ${formatDate(row.endDate)}`,
          },
          {
            key: "actions",
            header: "Actions",
            render: (row) => (
              <div className="flex flex-wrap gap-2">
                <Link href={`/mentor/programs/${row.id}/edit`} className="btn-secondary px-3 py-1.5 text-xs">
                  Edit
                </Link>
                <Link href={`/mentor/programs/${row.id}/materials`} className="btn-secondary px-3 py-1.5 text-xs">
                  Materials
                </Link>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}

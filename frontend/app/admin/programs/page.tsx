import Link from "next/link";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/labels";
import { fullName, getUser, programs } from "@/mock/data";

export default function AdminProgramsPage() {
  return (
    <div>
      <PageHeader
        title="Programs"
        description="Admin can view all internship programs and content in read-only mode. Editing program content is a Mentor-only action."
      />
      <DataTable
        rows={programs}
        mobileTitle={(row) => row.title}
        columns={[
          {
            key: "title",
            header: "Program",
            render: (row) => (
              <Link href={`/admin/programs/${row.id}`} className="font-medium text-brand hover:underline">
                {row.title}
              </Link>
            ),
          },
          {
            key: "mentor",
            header: "Mentor",
            render: (row) => {
              const mentor = getUser(row.mentorId);
              return mentor ? fullName(mentor) : "—";
            },
          },
          {
            key: "status",
            header: "Status",
            render: (row) => <StatusBadge kind="program" value={row.status} />,
          },
          {
            key: "dates",
            header: "Dates",
            render: (row) =>
              `${formatDate(row.startDate)} – ${formatDate(row.endDate)}`,
          },
          {
            key: "actions",
            header: "Actions",
            render: (row) => (
              <Link href={`/admin/programs/${row.id}`} className="btn-secondary px-3 py-1.5 text-xs">
                View
              </Link>
            ),
          },
        ]}
      />
    </div>
  );
}

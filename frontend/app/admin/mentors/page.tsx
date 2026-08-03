import Link from "next/link";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { fullName, internProfiles, programs, users } from "@/mock/data";

export default function AdminMentorsPage() {
  const mentors = users.filter((u) => u.role === "MENTOR");

  return (
    <div>
      <PageHeader
        title="Mentors"
        description="View all mentors and how interns and programs are grouped under them."
        actions={
          <Link href="/admin/users/new" className="btn-primary">
            Create mentor
          </Link>
        }
      />
      <DataTable
        rows={mentors}
        mobileTitle={(row) => fullName(row)}
        columns={[
          {
            key: "name",
            header: "Mentor",
            render: (row) => (
              <div>
                <p className="font-medium">{fullName(row)}</p>
                <p className="text-xs text-ink-muted">{row.email}</p>
              </div>
            ),
          },
          {
            key: "programs",
            header: "Programs",
            render: (row) => programs.filter((p) => p.mentorId === row.id).length,
          },
          {
            key: "interns",
            header: "Assigned interns",
            render: (row) =>
              internProfiles.filter((ip) => ip.mentorId === row.id).length,
          },
          {
            key: "status",
            header: "Account",
            render: (row) => (row.isActive ? "Active" : "Deactivated"),
          },
        ]}
      />
    </div>
  );
}

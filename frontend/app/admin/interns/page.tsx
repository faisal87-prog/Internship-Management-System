import Link from "next/link";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { fullName, getProgram, getUser, internProfiles, users } from "@/mock/data";

export default function AdminInternsPage() {
  const rows = internProfiles.map((ip) => {
    const intern = getUser(ip.userId)!;
    const mentor = getUser(ip.mentorId)!;
    const program = getProgram(ip.programId)!;
    return {
      id: ip.id,
      intern,
      mentor,
      program,
    };
  });

  const mentors = users.filter((u) => u.role === "MENTOR");

  return (
    <div>
      <PageHeader
        title="Interns"
        description="Interns grouped under each mentor. Admin can view assignments and account status."
        actions={
          <Link href="/admin/users/new?role=INTERN" className="btn-primary">
            Create Intern
          </Link>
        }
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        {mentors.map((mentor) => {
          const assigned = rows.filter((r) => r.mentor.id === mentor.id);
          return (
            <section key={mentor.id} className="card p-5">
              <h2 className="section-title">{fullName(mentor)}</h2>
              <p className="mt-1 text-sm text-ink-muted">
                {assigned.length} intern{assigned.length === 1 ? "" : "s"}
              </p>
              <ul className="mt-4 space-y-2">
                {assigned.map((row) => (
                  <li
                    key={row.id}
                    className="flex items-center justify-between rounded-xl bg-surface-muted px-3 py-2 text-sm"
                  >
                    <span className="font-medium text-ink">{fullName(row.intern)}</span>
                    <StatusBadge kind="program" value={row.program.status} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <DataTable
        rows={rows}
        mobileTitle={(row) => fullName(row.intern)}
        columns={[
          {
            key: "intern",
            header: "Intern",
            render: (row) => fullName(row.intern),
          },
          {
            key: "mentor",
            header: "Mentor",
            render: (row) => fullName(row.mentor),
          },
          {
            key: "program",
            header: "Program",
            render: (row) => row.program.title,
          },
          {
            key: "account",
            header: "Account",
            render: (row) => (row.intern.isActive ? "Active" : "Deactivated"),
          },
        ]}
      />
    </div>
  );
}

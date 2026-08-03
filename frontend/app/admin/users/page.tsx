"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { roleLabel } from "@/lib/labels";
import { fullName, users as initialUsers } from "@/mock/data";
import type { User } from "@/types";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);

  const rows = useMemo(() => users, [users]);

  return (
    <div>
      <PageHeader
        title="User management"
        description="Create Mentor and Intern accounts, deactivate users, and reactivate intern accounts. Mock actions update local state only."
        actions={
          <Link href="/admin/users/new" className="btn-primary">
            Create account
          </Link>
        }
      />

      {rows.length === 0 ? (
        <EmptyState title="No users" description="Create a Mentor or Intern account to get started." />
      ) : (
        <DataTable
          rows={rows}
          mobileTitle={(row) => fullName(row)}
          columns={[
            {
              key: "name",
              header: "Name",
              render: (row) => (
                <div>
                  <p className="font-medium">{fullName(row)}</p>
                  <p className="text-xs text-ink-muted">{row.email}</p>
                </div>
              ),
            },
            {
              key: "role",
              header: "Role",
              render: (row) => roleLabel[row.role],
            },
            {
              key: "status",
              header: "Account",
              render: (row) => (
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                    row.isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {row.isActive ? "Active" : "Deactivated"}
                </span>
              ),
            },
            {
              key: "actions",
              header: "Actions",
              render: (row) => (
                <div className="flex flex-wrap justify-end gap-2">
                  {row.role !== "ADMIN" ? (
                    <button
                      type="button"
                      className="btn-secondary px-3 py-1.5 text-xs"
                      onClick={() =>
                        setUsers((prev) =>
                          prev.map((u) =>
                            u.id === row.id ? { ...u, isActive: !u.isActive } : u,
                          ),
                        )
                      }
                    >
                      {row.isActive
                        ? "Deactivate"
                        : row.role === "INTERN"
                          ? "Reactivate"
                          : "Activate"}
                    </button>
                  ) : (
                    <span className="text-xs text-ink-muted">Protected</span>
                  )}
                </div>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}

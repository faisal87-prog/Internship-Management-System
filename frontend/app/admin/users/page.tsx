"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { roleLabel } from "@/lib/labels";
import { fullName, users as initialUsers } from "@/mock/data";
import type { User } from "@/types";

type PendingAction =
  | { type: "deactivate" | "delete"; user: User }
  | null;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [pending, setPending] = useState<PendingAction>(null);
  const rows = useMemo(() => users, [users]);

  function confirmAction() {
    if (!pending) return;
    if (pending.type === "delete") {
      setUsers((prev) => prev.filter((u) => u.id !== pending.user.id));
    } else {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === pending.user.id ? { ...u, isActive: false } : u,
        ),
      );
    }
    setPending(null);
  }

  return (
    <div>
      <PageHeader
        title="User management"
        description="Create Mentor and Intern accounts. Deactivate or delete Mentor and Intern accounts using confirmation dialogs."
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
              key: "username",
              header: "Username",
              render: (row) => row.username,
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
              className: "min-w-[220px]",
              render: (row) =>
                row.role === "ADMIN" ? (
                  <span className="text-xs text-ink-muted">Protected</span>
                ) : (
                  <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
                    {row.isActive ? (
                      <button
                        type="button"
                        className="btn-secondary whitespace-nowrap px-3 py-1.5 text-xs"
                        onClick={() => setPending({ type: "deactivate", user: row })}
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn-secondary whitespace-nowrap px-3 py-1.5 text-xs"
                        onClick={() =>
                          setUsers((prev) =>
                            prev.map((u) =>
                              u.id === row.id ? { ...u, isActive: true } : u,
                            ),
                          )
                        }
                      >
                        {row.role === "INTERN" ? "Reactivate" : "Activate"}
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn-danger whitespace-nowrap px-3 py-1.5 text-xs"
                      onClick={() => setPending({ type: "delete", user: row })}
                    >
                      Delete
                    </button>
                  </div>
                ),
            },
          ]}
        />
      )}

      <ConfirmDialog
        open={pending?.type === "deactivate"}
        title="Deactivate account?"
        description={
          pending
            ? `Deactivate ${fullName(pending.user)} (${roleLabel[pending.user.role]})? They will no longer be able to sign in.`
            : ""
        }
        confirmLabel="Deactivate"
        danger
        onCancel={() => setPending(null)}
        onConfirm={confirmAction}
      />
      <ConfirmDialog
        open={pending?.type === "delete"}
        title="Delete account?"
        description={
          pending
            ? `Permanently delete ${fullName(pending.user)} from the mock user list? This cannot be undone in this demo.`
            : ""
        }
        confirmLabel="Delete"
        danger
        onCancel={() => setPending(null)}
        onConfirm={confirmAction}
      />
    </div>
  );
}

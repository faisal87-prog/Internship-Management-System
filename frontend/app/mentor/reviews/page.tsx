"use client";

import Link from "next/link";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useMockAuth } from "@/context/MockAuthContext";
import { formatDate } from "@/lib/labels";
import {
  fullName,
  getUser,
  internProfiles,
  taskAssignments,
  tasks,
} from "@/mock/data";

export default function MentorReviewsPage() {
  const { user } = useMockAuth();
  const myInterns = internProfiles.filter((ip) => ip.mentorId === user?.id);
  const queue = taskAssignments.filter(
    (ta) =>
      myInterns.some((ip) => ip.id === ta.internProfileId) &&
      (ta.status === "SUBMITTED" || ta.status === "NEEDS_REVISION"),
  );

  return (
    <div>
      <PageHeader
        title="Submission reviews"
        description="Review each intern’s submission individually, provide feedback, and assign an integer score from 0–100."
      />
      <DataTable
        rows={queue}
        mobileTitle={(row) => tasks.find((t) => t.id === row.taskId)?.title ?? row.id}
        columns={[
          {
            key: "task",
            header: "Task",
            render: (row) => tasks.find((t) => t.id === row.taskId)?.title ?? "—",
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
            render: (row) => <StatusBadge kind="task" value={row.status} />,
          },
          {
            key: "deadline",
            header: "Deadline",
            render: (row) => formatDate(row.deadline),
          },
          {
            key: "action",
            header: "Action",
            render: (row) => (
              <Link href={`/mentor/reviews/${row.id}`} className="btn-primary px-3 py-1.5 text-xs">
                Review
              </Link>
            ),
          },
        ]}
      />
    </div>
  );
}

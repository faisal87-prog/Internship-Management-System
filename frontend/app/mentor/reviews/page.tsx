"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ErrorState, LoadingState } from "@/components/ui/AsyncState";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAuth } from "@/context/AuthContext";
import { listInternProfiles } from "@/lib/api/accounts";
import { getErrorMessage } from "@/lib/api/errors";
import { listAssignments, listTasks } from "@/lib/api/tasks";
import { formatDate } from "@/lib/labels";
import { fullName } from "@/lib/names";
import type { Task, TaskAssignment } from "@/types";

export default function MentorReviewsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [queue, setQueue] = useState<TaskAssignment[]>([]);
  const [tasksById, setTasksById] = useState<Record<string, Task>>({});
  const [internNames, setInternNames] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ips, assigns, tasks] = await Promise.all([
        listInternProfiles(),
        listAssignments(),
        listTasks(),
      ]);
      const myInterns = ips.filter((ip) => ip.mentorId === user?.id);
      const internIds = new Set(myInterns.map((ip) => ip.id));
      const names: Record<string, string> = {};
      myInterns.forEach((ip) => {
        names[ip.id] = fullName(ip.user) || ip.id;
      });
      const byId: Record<string, Task> = {};
      tasks.forEach((t) => {
        byId[t.id] = t;
      });
      setInternNames(names);
      setTasksById(byId);
      setQueue(
        assigns.filter(
          (ta) =>
            internIds.has(ta.internProfileId) &&
            (ta.status === "SUBMITTED" || ta.status === "NEEDS_REVISION"),
        ),
      );
    } catch (err) {
      setError(getErrorMessage(err, "Could not load review queue."));
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <LoadingState label="Loading reviews…" />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;

  return (
    <div>
      <PageHeader
        title="Submission reviews"
        description="Review each intern’s submission individually, provide feedback, and assign an integer score from 0–100."
      />
      <DataTable
        rows={queue}
        mobileTitle={(row) => tasksById[row.taskId]?.title ?? row.id}
        columns={[
          {
            key: "task",
            header: "Task",
            render: (row) => tasksById[row.taskId]?.title ?? "—",
          },
          {
            key: "intern",
            header: "Intern",
            render: (row) => internNames[row.internProfileId] || "—",
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

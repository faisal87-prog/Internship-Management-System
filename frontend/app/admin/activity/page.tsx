import { PageHeader } from "@/components/ui/PageHeader";
import { formatDateTime } from "@/lib/labels";
import {
  activityFeed,
  finalSummaries,
  submissions,
  taskAssignments,
  weeklyReports,
} from "@/mock/data";

export default function AdminActivityPage() {
  return (
    <div>
      <PageHeader
        title="System activity"
        description="Monitor task, submission, weekly report, and final summary activity across the platform."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card p-4">
          <p className="text-sm text-ink-muted">Task assignments</p>
          <p className="mt-1 text-2xl font-bold">{taskAssignments.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-ink-muted">Submissions</p>
          <p className="mt-1 text-2xl font-bold">{submissions.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-ink-muted">Weekly reports</p>
          <p className="mt-1 text-2xl font-bold">{weeklyReports.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-ink-muted">Final summaries</p>
          <p className="mt-1 text-2xl font-bold">{finalSummaries.length}</p>
        </div>
      </div>

      <section className="card overflow-hidden">
        <ul className="divide-y divide-line">
          {activityFeed.map((item) => (
            <li key={item.id} className="px-5 py-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-ink">{item.description}</p>
                  <p className="text-sm text-ink-muted">
                    {item.type} · {item.actorName}
                  </p>
                </div>
                <time className="text-sm text-ink-muted" dateTime={item.timestamp}>
                  {formatDateTime(item.timestamp)}
                </time>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

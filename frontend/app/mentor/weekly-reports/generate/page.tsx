"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { ErrorState, LoadingState } from "@/components/ui/AsyncState";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAuth } from "@/context/AuthContext";
import { listInternProfiles } from "@/lib/api/accounts";
import { getErrorMessage } from "@/lib/api/errors";
import { listWeeklyReports } from "@/lib/api/reports";
import { fullName } from "@/lib/names";
import type { WeeklyReport } from "@/types";

export default function GenerateWeeklyReportPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [internOptions, setInternOptions] = useState<{ id: string; name: string }[]>([]);
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [message, setMessage] = useState(
    "AI generation is not connected yet. Existing weekly reports are listed below.",
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ips, weekly] = await Promise.all([listInternProfiles(), listWeeklyReports()]);
      const myInterns = ips.filter((ip) => ip.mentorId === user?.id);
      const internIds = new Set(myInterns.map((ip) => ip.id));
      setInternOptions(
        myInterns.map((ip) => ({ id: ip.id, name: fullName(ip.user) || ip.id })),
      );
      setReports(weekly.filter((r) => internIds.has(r.internProfileId)));
    } catch (err) {
      setError(getErrorMessage(err, "Could not load data."));
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage("AI generation is not connected yet. Open an existing report to edit and approve.");
  }

  if (loading) return <LoadingState label="Loading…" />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;

  return (
    <div>
      <PageHeader
        title="Generate weekly report"
        description="Trigger after reviewing submissions, assigning scores, and providing feedback."
        actions={<Link href="/mentor/weekly-reports" className="btn-secondary">Cancel</Link>}
      />
      <form onSubmit={onSubmit} className="card mx-auto max-w-xl space-y-4 p-6">
        <div>
          <label className="label" htmlFor="intern">Intern</label>
          <select id="intern" className="input" required>
            {internOptions.map((ip) => (
              <option key={ip.id} value={ip.id}>
                {ip.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="week">Week number</label>
          <input id="week" type="number" min={1} className="input" defaultValue={2} required />
        </div>
        {message ? (
          <p className="rounded-xl bg-brand-light px-3 py-2 text-sm text-brand-dark">{message}</p>
        ) : null}
        <button type="submit" className="btn-primary">Generate draft report</button>
      </form>

      <section className="card mx-auto mt-6 max-w-xl space-y-3 p-6">
        <h2 className="section-title">Existing weekly reports</h2>
        {reports.length === 0 ? (
          <p className="text-sm text-ink-muted">No weekly reports yet.</p>
        ) : (
          <ul className="space-y-2">
            {reports.map((report) => (
              <li
                key={report.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-line px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium text-ink">Week {report.weekNumber}</p>
                  <p className="text-ink-muted">
                    {internOptions.find((ip) => ip.id === report.internProfileId)?.name || "Intern"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge kind="ai" value={report.status} />
                  <Link
                    href={`/mentor/weekly-reports/${report.id}`}
                    className="text-sm font-semibold text-brand"
                  >
                    Open
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { ErrorState, LoadingState } from "@/components/ui/AsyncState";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAuth } from "@/context/AuthContext";
import { listInternProfiles } from "@/lib/api/accounts";
import { getErrorMessage } from "@/lib/api/errors";
import { listPrograms } from "@/lib/api/programs";
import { listFinalSummaries } from "@/lib/api/reports";
import { fullName } from "@/lib/names";
import type { FinalSummary } from "@/types";

export default function GenerateFinalSummaryPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [internOptions, setInternOptions] = useState<{ id: string; name: string }[]>([]);
  const [summaries, setSummaries] = useState<FinalSummary[]>([]);
  const [message, setMessage] = useState(
    "AI generation is not connected yet. Existing final summaries are listed below.",
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [programs, ips, finals] = await Promise.all([
        listPrograms(),
        listInternProfiles(),
        listFinalSummaries(),
      ]);
      const myProgramIds = new Set(
        programs.filter((p) => p.mentorId === user?.id).map((p) => p.id),
      );
      const myInterns = ips.filter((ip) => myProgramIds.has(ip.programId));
      setInternOptions(
        myInterns.map((ip) => ({ id: ip.id, name: fullName(ip.user) || ip.id })),
      );
      setSummaries(finals.filter((fs) => myProgramIds.has(fs.programId)));
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
    setMessage(
      "AI generation is not connected yet. AI never makes hiring decisions. Open an existing summary to edit and approve.",
    );
  }

  if (loading) return <LoadingState label="Loading…" />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;

  return (
    <div>
      <PageHeader
        title="Generate final summary"
        description="Use after internship completion. Output is stored as Draft until mentor approval."
        actions={<Link href="/mentor/final-summaries" className="btn-secondary">Cancel</Link>}
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
        {message ? (
          <p className="rounded-xl bg-brand-light px-3 py-2 text-sm text-brand-dark">{message}</p>
        ) : null}
        <button type="submit" className="btn-primary">Generate draft summary</button>
      </form>

      <section className="card mx-auto mt-6 max-w-xl space-y-3 p-6">
        <h2 className="section-title">Existing final summaries</h2>
        {summaries.length === 0 ? (
          <p className="text-sm text-ink-muted">No final summaries yet.</p>
        ) : (
          <ul className="space-y-2">
            {summaries.map((summary) => (
              <li
                key={summary.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-line px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium text-ink">
                    {internOptions.find((ip) => ip.id === summary.internProfileId)?.name ||
                      "Intern"}
                  </p>
                  <p className="line-clamp-1 text-ink-muted">
                    {summary.content.overallPerformanceSummary || "No preview"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge kind="ai" value={summary.status} />
                  <Link
                    href={`/mentor/final-summaries/${summary.id}`}
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

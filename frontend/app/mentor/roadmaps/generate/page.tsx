"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { InternChipPicker } from "@/components/interns/InternChips";
import { ProgramSummary } from "@/components/programs/ProgramSummary";
import { ErrorState, LoadingState } from "@/components/ui/AsyncState";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { listInternProfiles } from "@/lib/api/accounts";
import { getErrorMessage } from "@/lib/api/errors";
import { listPrograms } from "@/lib/api/programs";
import { createRoadmap, createRoadmapWeek } from "@/lib/api/roadmaps";
import { fullName } from "@/lib/names";
import type { InternshipProgram } from "@/types";

export default function GenerateRoadmapPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myPrograms, setMyPrograms] = useState<InternshipProgram[]>([]);
  const [interns, setInterns] = useState<
    Awaited<ReturnType<typeof listInternProfiles>>
  >([]);
  const [scope, setScope] = useState<"PROGRAM" | "GROUP" | "INDIVIDUAL">("PROGRAM");
  const [programId, setProgramId] = useState("");
  const [selectedInternIds, setSelectedInternIds] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [programs, ips] = await Promise.all([listPrograms(), listInternProfiles()]);
      const mine = programs.filter((p) => p.mentorId === user?.id);
      setMyPrograms(mine);
      setInterns(ips);
      setProgramId((prev) => prev || mine[0]?.id || "");
    } catch (err) {
      setError(getErrorMessage(err, "Could not load programs."));
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const selectedProgram = myPrograms.find((p) => p.id === programId);

  const internOptions = useMemo(
    () =>
      interns
        .filter((ip) => ip.mentorId === user?.id && ip.programId === programId)
        .map((ip) => ({ id: ip.id, name: fullName(ip.user) || ip.id })),
    [interns, programId, user?.id],
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selectedProgram) return;
    if (scope !== "PROGRAM" && selectedInternIds.length === 0) {
      setMessage("Select at least one intern for this roadmap scope.");
      return;
    }
    if (scope === "INDIVIDUAL" && selectedInternIds.length !== 1) {
      setMessage("Individual scope requires exactly one intern.");
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      const weeks = Math.max(1, selectedProgram.durationWeeks || 1);
      const roadmap = await createRoadmap({
        program: Number(selectedProgram.id),
        title: `${selectedProgram.title} — Learning Roadmap`,
        summary: "Draft roadmap created for mentor editing.",
        assignment_scope: scope,
        number_of_weeks: weeks,
        assigned_intern_ids:
          scope === "PROGRAM" ? undefined : selectedInternIds.map(Number),
        generated_by_ai: false,
      });

      await Promise.all(
        Array.from({ length: weeks }, (_, index) =>
          createRoadmapWeek({
            roadmap: Number(roadmap.id),
            week_number: index + 1,
            weekly_focus: "",
            learning_objectives: [],
            expected_skills_gained: [],
            mentor_notes: "",
            display_order: index + 1,
          }),
        ),
      );

      setMessage("Draft roadmap created. AI generation is not connected yet.");
      router.push(`/mentor/roadmaps/${roadmap.id}/edit`);
    } catch (err) {
      setMessage(getErrorMessage(err, "Could not create draft roadmap."));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState label="Loading…" />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;

  return (
    <div>
      <PageHeader
        title="Generate AI roadmap"
        description="Choose roadmap scope, then request generation. Output is always saved as Draft for mentor review."
        actions={<Link href="/mentor/roadmaps" className="btn-secondary">Cancel</Link>}
      />
      <form onSubmit={onSubmit} className="card mx-auto max-w-2xl space-y-4 p-6">
        <div>
          <label className="label" htmlFor="programId">Program</label>
          <select
            id="programId"
            className="input"
            value={programId}
            onChange={(e) => {
              setProgramId(e.target.value);
              setSelectedInternIds([]);
            }}
            required
          >
            {myPrograms.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>
        {selectedProgram ? (
          <div className="rounded-xl border border-line bg-surface-muted/70 p-4">
            <p className="mb-2 text-sm font-semibold text-ink">Program summary</p>
            <ProgramSummary program={selectedProgram} compact />
          </div>
        ) : null}
        <fieldset>
          <legend className="label">Roadmap scope</legend>
          <div className="space-y-2">
            {(
              [
                ["PROGRAM", "Entire Program"],
                ["GROUP", "Selected Interns"],
                ["INDIVIDUAL", "Individual Intern"],
              ] as const
            ).map(([value, label]) => (
              <label key={value} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="scope"
                  value={value}
                  checked={scope === value}
                  onChange={() => {
                    setScope(value);
                    setSelectedInternIds([]);
                  }}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        {scope !== "PROGRAM" ? (
          <InternChipPicker
            options={internOptions}
            selectedIds={selectedInternIds}
            onChange={(ids) => {
              if (scope === "INDIVIDUAL") {
                setSelectedInternIds(ids.slice(-1));
              } else {
                setSelectedInternIds(ids);
              }
            }}
            label={scope === "INDIVIDUAL" ? "Assigned intern" : "Assigned interns"}
          />
        ) : null}
        {message ? (
          <p className="rounded-xl bg-brand-light px-3 py-2 text-sm text-brand-dark" role="status">
            {message}
          </p>
        ) : null}
        <button type="submit" className="btn-primary" disabled={saving || !programId}>
          {saving ? "Creating draft…" : "Request AI generation"}
        </button>
      </form>
    </div>
  );
}

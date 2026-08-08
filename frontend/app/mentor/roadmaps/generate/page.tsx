"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { InternChipPicker } from "@/components/interns/InternChips";
import { ProgramSummary } from "@/components/programs/ProgramSummary";
import { PageHeader } from "@/components/ui/PageHeader";
import { useMockAuth } from "@/context/MockAuthContext";
import { fullName, getProgram, getUser, internProfiles, programs } from "@/mock/data";

export default function GenerateRoadmapPage() {
  const { user } = useMockAuth();
  const router = useRouter();
  const myPrograms = programs.filter((p) => p.mentorId === user?.id);
  const [scope, setScope] = useState<"PROGRAM" | "GROUP" | "INDIVIDUAL">("PROGRAM");
  const [programId, setProgramId] = useState(myPrograms[0]?.id ?? "");
  const [selectedInternIds, setSelectedInternIds] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const selectedProgram = getProgram(programId);

  const internOptions = useMemo(
    () =>
      internProfiles
        .filter((ip) => ip.mentorId === user?.id && ip.programId === programId)
        .map((ip) => {
          const u = getUser(ip.userId);
          return { id: ip.id, name: u ? fullName(u) : ip.id };
        }),
    [programId, user?.id],
  );

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (scope !== "PROGRAM" && selectedInternIds.length === 0) {
      setMessage("Select at least one intern for this roadmap scope.");
      return;
    }
    if (scope === "INDIVIDUAL" && selectedInternIds.length !== 1) {
      setMessage("Individual scope requires exactly one intern.");
      return;
    }
    setMessage(
      "Mock AI request staged: Prompt Builder → LLM → Validation → Draft. No OpenAI call was made.",
    );
    setTimeout(() => router.push("/mentor/roadmaps"), 1400);
  }

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
        <button type="submit" className="btn-primary">Request AI generation</button>
      </form>
    </div>
  );
}

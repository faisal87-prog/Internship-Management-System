"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { useMockAuth } from "@/context/MockAuthContext";
import { fullName, getUser, internProfiles, programs } from "@/mock/data";

export default function GenerateRoadmapPage() {
  const { user } = useMockAuth();
  const router = useRouter();
  const myPrograms = programs.filter((p) => p.mentorId === user?.id);
  const [scope, setScope] = useState<"PROGRAM" | "GROUP" | "INDIVIDUAL">("PROGRAM");
  const [programId, setProgramId] = useState(myPrograms[0]?.id ?? "");
  const [message, setMessage] = useState("");
  const interns = internProfiles.filter(
    (ip) => ip.mentorId === user?.id && ip.programId === programId,
  );

  function onSubmit(e: FormEvent) {
    e.preventDefault();
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
            onChange={(e) => setProgramId(e.target.value)}
            required
          >
            {myPrograms.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>
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
                  onChange={() => setScope(value)}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        {scope !== "PROGRAM" ? (
          <div>
            <label className="label" htmlFor="interns">Assigned intern(s)</label>
            <select id="interns" className="input" multiple={scope === "GROUP"} required>
              {interns.map((ip) => {
                const u = getUser(ip.userId);
                return (
                  <option key={ip.id} value={ip.id}>
                    {u ? fullName(u) : ip.id}
                  </option>
                );
              })}
            </select>
            {scope === "GROUP" ? (
              <p className="mt-1 text-xs text-ink-muted">Hold Ctrl/Cmd to select multiple.</p>
            ) : null}
          </div>
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

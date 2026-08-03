"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useMockAuth } from "@/context/MockAuthContext";
import { getInternContext } from "@/lib/intern";
import { formatDate, skillLevelLabel } from "@/lib/labels";
import { fullName } from "@/mock/data";

export default function InternProgramPage() {
  const { user } = useMockAuth();
  const ctx = user ? getInternContext(user.id) : null;
  if (!ctx?.program || !ctx.mentor) return <p>No program assigned.</p>;

  const { program, mentor, profile } = ctx;

  return (
    <div>
      <PageHeader
        title="My program"
        description="You belong to one internship program and one mentor during the MVP."
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="card space-y-3 p-5 lg:col-span-2">
          <StatusBadge kind="program" value={program.status} />
          <h2 className="text-xl font-semibold">{program.title}</h2>
          <p className="text-sm text-ink-muted">{program.description}</p>
          <dl className="grid gap-3 sm:grid-cols-2 text-sm">
            <div>
              <dt className="font-semibold text-ink-muted">Role</dt>
              <dd>{program.role}</dd>
            </div>
            <div>
              <dt className="font-semibold text-ink-muted">Mentor</dt>
              <dd>{fullName(mentor)}</dd>
            </div>
            <div>
              <dt className="font-semibold text-ink-muted">Dates</dt>
              <dd>
                {formatDate(program.startDate)} – {formatDate(program.endDate)}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-ink-muted">Weekly hours</dt>
              <dd>{program.weeklyHours}</dd>
            </div>
          </dl>
          <div>
            <h3 className="font-semibold">Goals</h3>
            <p className="text-sm text-ink-muted">{program.goals}</p>
          </div>
        </section>
        <section className="card space-y-3 p-5">
          <h2 className="section-title">My profile snapshot</h2>
          <p className="text-sm text-ink-muted">{profile.learningGoals}</p>
          <ul className="space-y-2 text-sm">
            {profile.skills.map((skill) => (
              <li key={skill.name} className="flex justify-between rounded-lg bg-surface-muted px-3 py-2">
                <span>{skill.name}</span>
                <span className="text-ink-muted">{skillLevelLabel[skill.level]}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

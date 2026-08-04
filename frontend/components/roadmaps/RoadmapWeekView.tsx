import { formatDate } from "@/lib/labels";
import { fullName, getUser, internProfiles } from "@/mock/data";
import type { Roadmap, RoadmapTaskDraft, RoadmapWeek } from "@/types";

function InternNames({ ids }: { ids?: string[] }) {
  if (!ids?.length) return <span className="text-ink-muted">Program scope / unassigned</span>;
  return (
    <span>
      {ids
        .map((id) => {
          const profile = internProfiles.find((ip) => ip.id === id);
          const user = profile ? getUser(profile.userId) : undefined;
          return user ? fullName(user) : id;
        })
        .join(", ")}
    </span>
  );
}

export function RoadmapTaskCard({
  task,
  readOnly = true,
  actions,
}: {
  task: RoadmapTaskDraft;
  readOnly?: boolean;
  actions?: React.ReactNode;
}) {
  return (
    <article className="rounded-xl border border-line bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h4 className="font-semibold text-ink">{task.title}</h4>
          <p className="mt-1 text-sm text-ink-muted">{task.description}</p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            task.requirementType === "REQUIRED"
              ? "bg-orange-50 text-orange-800"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          {task.requirementType === "REQUIRED" ? "Required" : "Optional"}
        </span>
      </div>
      <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
        <div>
          <dt className="font-semibold text-ink-muted">Difficulty</dt>
          <dd>{task.difficulty}</dd>
        </div>
        <div>
          <dt className="font-semibold text-ink-muted">Estimated time</dt>
          <dd>{task.estimatedTime}</dd>
        </div>
        <div>
          <dt className="font-semibold text-ink-muted">Deliverable</dt>
          <dd>{task.deliverable}</dd>
        </div>
        <div>
          <dt className="font-semibold text-ink-muted">Due date</dt>
          <dd>{task.dueDate ? formatDate(task.dueDate) : "—"}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="font-semibold text-ink-muted">Success criteria</dt>
          <dd>{task.successCriteria}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="font-semibold text-ink-muted">Assigned interns</dt>
          <dd>
            <InternNames ids={task.assignedInternIds} />
          </dd>
        </div>
      </dl>
      {!readOnly && actions ? <div className="mt-3 flex flex-wrap gap-2">{actions}</div> : null}
    </article>
  );
}

export function RoadmapWeekCard({
  week,
  readOnly = true,
  actions,
  taskActions,
}: {
  week: RoadmapWeek;
  readOnly?: boolean;
  actions?: React.ReactNode;
  taskActions?: (task: RoadmapTaskDraft, weekNumber: number) => React.ReactNode;
}) {
  return (
    <section className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">
            Week {week.weekNumber}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-ink">{week.weeklyFocus}</h3>
        </div>
        {!readOnly && actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-semibold text-ink">Weekly learning objectives</h4>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-muted">
          {week.weeklyLearningObjectives.map((obj) => (
            <li key={obj}>{obj}</li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <h4 className="mb-2 text-sm font-semibold text-ink">Expected skills gained</h4>
        <ul className="flex flex-wrap gap-1.5">
          {week.expectedSkillsGained.map((skill) => (
            <li
              key={skill}
              className="rounded-full bg-brand-light px-2.5 py-1 text-xs font-medium text-brand-dark"
            >
              {skill}
            </li>
          ))}
        </ul>
      </div>

      {week.mentorNotes ? (
        <div className="mt-4 rounded-xl bg-brand-soft px-3 py-2 text-sm">
          <p className="font-semibold text-ink">Mentor notes</p>
          <p className="mt-1 text-ink-muted">{week.mentorNotes}</p>
        </div>
      ) : null}

      <div className="mt-4 space-y-3">
        <h4 className="text-sm font-semibold text-ink">
          Suggested tasks ({week.suggestedTasks.length})
        </h4>
        {week.suggestedTasks.map((task) => (
          <RoadmapTaskCard
            key={task.id}
            task={task}
            readOnly={readOnly}
            actions={taskActions?.(task, week.weekNumber)}
          />
        ))}
      </div>
    </section>
  );
}

export function RoadmapReadOnlyView({ roadmap }: { roadmap: Roadmap }) {
  return (
    <div className="space-y-4">
      <section className="card p-5">
        <h2 className="text-xl font-semibold text-ink">{roadmap.title}</h2>
        <p className="mt-2 text-sm text-ink-muted">{roadmap.summary}</p>
      </section>
      {roadmap.weeks.map((week) => (
        <RoadmapWeekCard key={week.weekNumber} week={week} readOnly />
      ))}
    </div>
  );
}

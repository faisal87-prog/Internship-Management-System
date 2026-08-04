"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PageHeader } from "@/components/ui/PageHeader";
import { RoadmapWeekCard } from "@/components/roadmaps/RoadmapWeekView";
import { fullName, getUser, internProfiles, programs, roadmaps as seedRoadmaps } from "@/mock/data";
import type { Roadmap, RoadmapScope, RoadmapTaskDraft, RoadmapWeek } from "@/types";

function newId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

function emptyTask(): RoadmapTaskDraft {
  return {
    id: newId("task"),
    title: "New task",
    description: "Describe the task",
    difficulty: "Beginner",
    estimatedTime: "4 hours",
    deliverable: "Deliverable",
    successCriteria: "Success criteria",
    source: "MANUAL",
    requirementType: "REQUIRED",
    dueDate: "",
    assignedInternIds: [],
  };
}

function emptyWeek(weekNumber: number): RoadmapWeek {
  return {
    weekNumber,
    weeklyFocus: `Week ${weekNumber} focus`,
    weeklyLearningObjectives: ["New learning objective"],
    suggestedTasks: [emptyTask(), emptyTask()],
    expectedSkillsGained: ["New skill"],
    mentorNotes: "",
  };
}

export default function EditRoadmapPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const seed = seedRoadmaps.find((r) => r.id === params.id);
  const [roadmap, setRoadmap] = useState<Roadmap | undefined>(
    seed ? structuredClone(seed) : undefined,
  );
  const [message, setMessage] = useState("");
  const [editingTask, setEditingTask] = useState<{
    weekNumber: number;
    task: RoadmapTaskDraft;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<
    | { type: "week"; weekNumber: number }
    | { type: "task"; weekNumber: number; taskId: string }
    | null
  >(null);

  const programInterns = useMemo(() => {
    if (!roadmap) return [];
    return internProfiles.filter((ip) => ip.programId === roadmap.programId);
  }, [roadmap]);

  if (!roadmap) return <p>Roadmap not found.</p>;

  const program = programs.find((p) => p.id === roadmap.programId);

  function updateWeek(weekNumber: number, updater: (week: RoadmapWeek) => RoadmapWeek) {
    setRoadmap((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        weeks: prev.weeks.map((w) => (w.weekNumber === weekNumber ? updater(w) : w)),
      };
    });
  }

  function renumberWeeks(weeks: RoadmapWeek[]) {
    return weeks.map((w, index) => ({ ...w, weekNumber: index + 1 }));
  }

  function moveWeek(weekNumber: number, direction: -1 | 1) {
    setRoadmap((prev) => {
      if (!prev) return prev;
      const index = prev.weeks.findIndex((w) => w.weekNumber === weekNumber);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= prev.weeks.length) return prev;
      const weeks = [...prev.weeks];
      const [item] = weeks.splice(index, 1);
      weeks.splice(target, 0, item);
      return { ...prev, weeks: renumberWeeks(weeks), numberOfWeeks: weeks.length };
    });
  }

  function moveTask(weekNumber: number, taskId: string, direction: -1 | 1) {
    updateWeek(weekNumber, (week) => {
      const index = week.suggestedTasks.findIndex((t) => t.id === taskId);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= week.suggestedTasks.length) return week;
      const tasks = [...week.suggestedTasks];
      const [item] = tasks.splice(index, 1);
      tasks.splice(target, 0, item);
      return { ...week, suggestedTasks: tasks };
    });
  }

  function moveTaskToWeek(fromWeek: number, taskId: string, toWeek: number) {
    if (fromWeek === toWeek) return;
    setRoadmap((prev) => {
      if (!prev) return prev;
      const source = prev.weeks.find((w) => w.weekNumber === fromWeek);
      const task = source?.suggestedTasks.find((t) => t.id === taskId);
      if (!source || !task) return prev;
      return {
        ...prev,
        weeks: prev.weeks.map((w) => {
          if (w.weekNumber === fromWeek) {
            return { ...w, suggestedTasks: w.suggestedTasks.filter((t) => t.id !== taskId) };
          }
          if (w.weekNumber === toWeek) {
            return { ...w, suggestedTasks: [...w.suggestedTasks, task] };
          }
          return w;
        }),
      };
    });
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    if (deleteTarget.type === "week") {
      setRoadmap((prev) => {
        if (!prev) return prev;
        const weeks = renumberWeeks(
          prev.weeks.filter((w) => w.weekNumber !== deleteTarget.weekNumber),
        );
        return { ...prev, weeks, numberOfWeeks: weeks.length };
      });
    } else {
      updateWeek(deleteTarget.weekNumber, (week) => ({
        ...week,
        suggestedTasks: week.suggestedTasks.filter((t) => t.id !== deleteTarget.taskId),
      }));
    }
    setDeleteTarget(null);
  }

  function saveTaskEdit() {
    if (!editingTask) return;
    updateWeek(editingTask.weekNumber, (week) => ({
      ...week,
      suggestedTasks: week.suggestedTasks.map((t) =>
        t.id === editingTask.task.id ? editingTask.task : t,
      ),
    }));
    setEditingTask(null);
    setMessage("Task updated in mock state.");
  }

  return (
    <div>
      <PageHeader
        title="Edit roadmap"
        description="Edit roadmap, week, and task structure using mock state. Drag-and-drop is not required."
        actions={
          <Link href={`/mentor/roadmaps/${roadmap.id}`} className="btn-secondary">
            Back
          </Link>
        }
      />

      {message ? (
        <p className="mb-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700" role="status">
          {message}
        </p>
      ) : null}

      <section className="card mb-6 space-y-4 p-5">
        <h2 className="section-title">Roadmap details</h2>
        {program ? (
          <p className="text-sm text-ink-muted">Program: {program.title}</p>
        ) : null}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="label" htmlFor="title">Roadmap title</label>
            <input
              id="title"
              className="input"
              value={roadmap.title}
              onChange={(e) => setRoadmap({ ...roadmap, title: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <label className="label" htmlFor="summary">Roadmap summary</label>
            <textarea
              id="summary"
              className="input"
              rows={3}
              value={roadmap.summary}
              onChange={(e) => setRoadmap({ ...roadmap, summary: e.target.value })}
            />
          </div>
          <div>
            <label className="label" htmlFor="scope">Assignment scope</label>
            <select
              id="scope"
              className="input"
              value={roadmap.scope}
              onChange={(e) =>
                setRoadmap({ ...roadmap, scope: e.target.value as RoadmapScope })
              }
            >
              <option value="PROGRAM">Entire Program</option>
              <option value="GROUP">Selected Interns</option>
              <option value="INDIVIDUAL">Individual Intern</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="weeksCount">Number of weeks</label>
            <input
              id="weeksCount"
              type="number"
              min={1}
              className="input"
              value={roadmap.numberOfWeeks}
              onChange={(e) => {
                const nextCount = Number(e.target.value) || 1;
                setRoadmap((prev) => {
                  if (!prev) return prev;
                  let weeks = [...prev.weeks];
                  if (nextCount > weeks.length) {
                    while (weeks.length < nextCount) {
                      weeks.push(emptyWeek(weeks.length + 1));
                    }
                  } else if (nextCount < weeks.length) {
                    weeks = weeks.slice(0, nextCount);
                  }
                  return {
                    ...prev,
                    numberOfWeeks: nextCount,
                    weeks: renumberWeeks(weeks),
                  };
                });
              }}
            />
          </div>
        </div>

        {roadmap.scope !== "PROGRAM" ? (
          <div>
            <p className="label">Assigned interns</p>
            <div className="space-y-2">
              {programInterns.map((ip) => {
                const user = getUser(ip.userId);
                const checked = roadmap.assignedInternIds.includes(ip.id);
                return (
                  <label key={ip.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        setRoadmap((prev) => {
                          if (!prev) return prev;
                          const ids = checked
                            ? prev.assignedInternIds.filter((id) => id !== ip.id)
                            : [...prev.assignedInternIds, ip.id];
                          return { ...prev, assignedInternIds: ids };
                        });
                      }}
                    />
                    {user ? fullName(user) : ip.id}
                  </label>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-secondary"
            onClick={() =>
              setRoadmap((prev) => {
                if (!prev) return prev;
                const weeks = [...prev.weeks, emptyWeek(prev.weeks.length + 1)];
                return { ...prev, weeks, numberOfWeeks: weeks.length };
              })
            }
          >
            Add week
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() =>
              setMessage("Mock regenerate requested. Draft content would be replaced after validation.")
            }
          >
            Regenerate entire roadmap
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              setMessage("Mock roadmap draft saved.");
              setTimeout(() => router.push(`/mentor/roadmaps/${roadmap.id}`), 800);
            }}
          >
            Save draft
          </button>
        </div>
      </section>

      <div className="space-y-4">
        {roadmap.weeks.map((week) => (
          <RoadmapWeekCard
            key={week.weekNumber}
            week={week}
            readOnly={false}
            actions={
              <>
                <button type="button" className="btn-secondary px-3 py-1.5 text-xs" onClick={() => moveWeek(week.weekNumber, -1)}>
                  Week up
                </button>
                <button type="button" className="btn-secondary px-3 py-1.5 text-xs" onClick={() => moveWeek(week.weekNumber, 1)}>
                  Week down
                </button>
                <button
                  type="button"
                  className="btn-secondary px-3 py-1.5 text-xs"
                  onClick={() =>
                    updateWeek(week.weekNumber, (w) => ({
                      ...w,
                      suggestedTasks: [...w.suggestedTasks, emptyTask()],
                    }))
                  }
                >
                  Add task
                </button>
                <button
                  type="button"
                  className="btn-danger px-3 py-1.5 text-xs"
                  onClick={() => setDeleteTarget({ type: "week", weekNumber: week.weekNumber })}
                >
                  Delete week
                </button>
              </>
            }
            taskActions={(task, weekNumber) => (
              <>
                <button
                  type="button"
                  className="btn-secondary px-3 py-1.5 text-xs"
                  onClick={() => setEditingTask({ weekNumber, task: { ...task } })}
                >
                  Edit task
                </button>
                <button
                  type="button"
                  className="btn-secondary px-3 py-1.5 text-xs"
                  onClick={() => moveTask(weekNumber, task.id, -1)}
                >
                  Up
                </button>
                <button
                  type="button"
                  className="btn-secondary px-3 py-1.5 text-xs"
                  onClick={() => moveTask(weekNumber, task.id, 1)}
                >
                  Down
                </button>
                <label className="inline-flex items-center gap-1 text-xs text-ink-muted">
                  Move to
                  <select
                    className="rounded-lg border border-line px-2 py-1"
                    defaultValue={weekNumber}
                    onChange={(e) =>
                      moveTaskToWeek(weekNumber, task.id, Number(e.target.value))
                    }
                  >
                    {roadmap.weeks.map((w) => (
                      <option key={w.weekNumber} value={w.weekNumber}>
                        Week {w.weekNumber}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  className="btn-danger px-3 py-1.5 text-xs"
                  onClick={() =>
                    setDeleteTarget({ type: "task", weekNumber, taskId: task.id })
                  }
                >
                  Delete
                </button>
              </>
            )}
          />
        ))}
      </div>

      {/* Week field editors under each week card via expand panels */}
      <section className="card mt-6 space-y-4 p-5">
        <h2 className="section-title">Week content editors</h2>
        {roadmap.weeks.map((week) => (
          <div key={`edit-${week.weekNumber}`} className="rounded-xl border border-line p-4">
            <p className="font-semibold text-ink">Week {week.weekNumber}</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="label">Weekly focus</label>
                <input
                  className="input"
                  value={week.weeklyFocus}
                  onChange={(e) =>
                    updateWeek(week.weekNumber, (w) => ({ ...w, weeklyFocus: e.target.value }))
                  }
                />
              </div>
              <div className="md:col-span-2">
                <label className="label">Learning objectives (one per line)</label>
                <textarea
                  className="input"
                  rows={3}
                  value={week.weeklyLearningObjectives.join("\n")}
                  onChange={(e) =>
                    updateWeek(week.weekNumber, (w) => ({
                      ...w,
                      weeklyLearningObjectives: e.target.value
                        .split("\n")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    }))
                  }
                />
              </div>
              <div>
                <label className="label">Expected skills gained (comma-separated)</label>
                <input
                  className="input"
                  value={week.expectedSkillsGained.join(", ")}
                  onChange={(e) =>
                    updateWeek(week.weekNumber, (w) => ({
                      ...w,
                      expectedSkillsGained: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    }))
                  }
                />
              </div>
              <div>
                <label className="label">Mentor notes</label>
                <input
                  className="input"
                  value={week.mentorNotes ?? ""}
                  onChange={(e) =>
                    updateWeek(week.weekNumber, (w) => ({
                      ...w,
                      mentorNotes: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>
        ))}
      </section>

      {editingTask ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
          <div className="card max-h-[90vh] w-full max-w-lg overflow-y-auto p-6" role="dialog" aria-modal="true">
            <h2 className="text-lg font-semibold text-ink">Edit task</h2>
            <div className="mt-4 space-y-3">
              {(
                [
                  ["title", "Title"],
                  ["description", "Description"],
                  ["difficulty", "Difficulty"],
                  ["estimatedTime", "Estimated time"],
                  ["deliverable", "Deliverable"],
                  ["successCriteria", "Success criteria"],
                  ["dueDate", "Due date"],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <label className="label">{label}</label>
                  {key === "description" || key === "successCriteria" ? (
                    <textarea
                      className="input"
                      rows={2}
                      value={String(editingTask.task[key] ?? "")}
                      onChange={(e) =>
                        setEditingTask({
                          ...editingTask,
                          task: { ...editingTask.task, [key]: e.target.value },
                        })
                      }
                    />
                  ) : (
                    <input
                      className="input"
                      type={key === "dueDate" ? "date" : "text"}
                      value={String(editingTask.task[key] ?? "")}
                      onChange={(e) =>
                        setEditingTask({
                          ...editingTask,
                          task: { ...editingTask.task, [key]: e.target.value },
                        })
                      }
                    />
                  )}
                </div>
              ))}
              <div>
                <label className="label">Requirement</label>
                <select
                  className="input"
                  value={editingTask.task.requirementType}
                  onChange={(e) =>
                    setEditingTask({
                      ...editingTask,
                      task: {
                        ...editingTask.task,
                        requirementType: e.target.value as "REQUIRED" | "OPTIONAL",
                      },
                    })
                  }
                >
                  <option value="REQUIRED">Required</option>
                  <option value="OPTIONAL">Optional</option>
                </select>
              </div>
              <div>
                <p className="label">Assigned interns</p>
                <div className="space-y-2">
                  {programInterns.map((ip) => {
                    const user = getUser(ip.userId);
                    const checked = editingTask.task.assignedInternIds?.includes(ip.id) ?? false;
                    return (
                      <label key={ip.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            const current = editingTask.task.assignedInternIds ?? [];
                            const next = checked
                              ? current.filter((id) => id !== ip.id)
                              : [...current, ip.id];
                            setEditingTask({
                              ...editingTask,
                              task: { ...editingTask.task, assignedInternIds: next },
                            });
                          }}
                        />
                        {user ? fullName(user) : ip.id}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => setEditingTask(null)}>
                Cancel
              </button>
              <button type="button" className="btn-primary" onClick={saveTaskEdit}>
                Save task
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={deleteTarget?.type === "week" ? "Delete week?" : "Delete task?"}
        description="This mock deletion updates local state only and cannot be undone in this demo session."
        confirmLabel="Delete"
        danger
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

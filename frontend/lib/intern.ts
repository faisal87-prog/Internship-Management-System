import {
  finalSummaries,
  getProgram,
  getUser,
  internProfiles,
  roadmaps,
  submissions,
  taskAssignments,
  tasks,
  weeklyReports,
} from "@/mock/data";

export function getInternContext(userId: string) {
  const profile = internProfiles.find((ip) => ip.userId === userId);
  if (!profile) return null;
  const program = getProgram(profile.programId);
  const mentor = getUser(profile.mentorId);
  const assignments = taskAssignments.filter((ta) => ta.internProfileId === profile.id);
  const myTasks = assignments
    .map((ta) => ({ assignment: ta, task: tasks.find((t) => t.id === ta.taskId)! }))
    .filter((row) => row.task);
  const approvedReports = weeklyReports.filter(
    (r) => r.internProfileId === profile.id && r.status === "APPROVED",
  );
  const finalSummary = finalSummaries.find(
    (fs) =>
      fs.internProfileId === profile.id &&
      fs.status === "APPROVED",
  );
  const roadmap = roadmaps.find(
    (r) => r.programId === profile.programId && r.status === "PUBLISHED",
  );
  const mySubmissions = submissions.filter((s) =>
    assignments.some((ta) => ta.id === s.taskAssignmentId),
  );

  return {
    profile,
    program,
    mentor,
    assignments,
    myTasks,
    approvedReports,
    finalSummary,
    roadmap,
    mySubmissions,
  };
}

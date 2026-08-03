export type UserRole = "ADMIN" | "MENTOR" | "INTERN";

export type ProgramStatus =
  | "DRAFT"
  | "ACTIVE"
  | "COMPLETED"
  | "ARCHIVED"
  | "CANCELLED";

export type RoadmapStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type RoadmapScope = "PROGRAM" | "GROUP" | "INDIVIDUAL";

export type TaskStatus =
  | "TO_DO"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "NEEDS_REVISION"
  | "COMPLETED";

export type AiContentStatus = "DRAFT" | "APPROVED" | "REJECTED";
export type TaskSource = "AI_GENERATED" | "MANUAL";
export type TaskRequirementType = "REQUIRED" | "OPTIONAL";
export type SkillLevel = 1 | 2 | 3 | 4 | 5;

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
}

export interface InternProfile {
  id: string;
  userId: string;
  mentorId: string;
  programId: string;
  preferences: string;
  learningGoals: string;
  skills: { name: string; level: SkillLevel }[];
}

export interface InternshipProgram {
  id: string;
  mentorId: string;
  title: string;
  description: string;
  role: string;
  startDate: string;
  endDate: string;
  durationWeeks: number;
  skillsToDevelop: string[];
  goals: string;
  skillsNeeded: string[];
  expectedOutcome: string;
  finalProject?: string;
  status: ProgramStatus;
  maxInterns: number;
  department: string;
  weeklyHours: number;
  additionalInstructions?: string;
}

export interface ReferenceMaterial {
  id: string;
  programId: string;
  title: string;
  fileName?: string;
  externalLink?: string;
}

export interface RoadmapTaskDraft {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  estimatedTime: string;
  deliverable: string;
  successCriteria: string;
  source: TaskSource;
  requirementType: TaskRequirementType;
  priority?: string;
}

export interface RoadmapWeek {
  weekNumber: number;
  weeklyFocus: string;
  weeklyLearningObjectives: string[];
  suggestedTasks: RoadmapTaskDraft[];
  expectedSkillsGained: string[];
  mentorNotes?: string;
}

export interface Roadmap {
  id: string;
  programId: string;
  title: string;
  summary: string;
  scope: RoadmapScope;
  status: RoadmapStatus;
  numberOfWeeks: number;
  weeks: RoadmapWeek[];
  assignedInternIds: string[];
  publishedAt?: string;
}

export interface Task {
  id: string;
  programId: string;
  roadmapId?: string;
  weekNumber: number;
  title: string;
  description: string;
  difficulty: string;
  estimatedTime: string;
  deliverable: string;
  successCriteria: string;
  priority?: string;
  source: TaskSource;
  requirementType: TaskRequirementType;
  defaultDeadline: string;
}

export interface TaskAssignment {
  id: string;
  taskId: string;
  internProfileId: string;
  status: TaskStatus;
  deadline: string;
  score?: number;
  mentorFeedback?: string;
  completedAt?: string;
}

export interface Submission {
  id: string;
  taskAssignmentId: string;
  writtenResponse?: string;
  files: string[];
  externalLink?: string;
  submissionVersion: number;
  internNotes?: string;
  submittedAt: string;
}

export interface WeeklyReport {
  id: string;
  internProfileId: string;
  programId: string;
  weekNumber: number;
  status: AiContentStatus;
  content: {
    performanceSummary: string;
    achievements: string[];
    learningProgress: string;
    productivityAnalysis: string;
    mentorFocusSuggestions: string[];
    recommendedFocusNextWeek: string;
  };
  approvedAt?: string;
}

export interface FinalSummary {
  id: string;
  internProfileId: string;
  programId: string;
  status: AiContentStatus;
  content: {
    overallPerformanceSummary: string;
    learningJourney: string;
    mainAchievements: string[];
    skillsDeveloped: string[];
    strengths: string[];
    areasForImprovement: string[];
    goalAchievement: string;
    finalPerformanceSummary: string;
  };
  mentorFinalScore?: number;
  mentorFinalComments?: string;
  pdfAvailable: boolean;
  approvedAt?: string;
}

export interface ActivityItem {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  actorName: string;
}

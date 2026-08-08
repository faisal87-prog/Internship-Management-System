"use client";

import { useMemo, useState } from "react";
import { ExportButtons } from "@/components/exports/ExportButtons";
import {
  defaultTimeRange,
  TimeRangeFilter,
  type TimeRangeValue,
} from "@/components/filters/TimeRangeFilter";
import { ChartPlaceholder, BarRow } from "@/components/ui/ChartPlaceholder";
import { DataTable } from "@/components/ui/DataTable";
import { MetricCard } from "@/components/ui/MetricCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/labels";
import { countByStatus, filterProgramsByRange } from "@/lib/programTime";
import { fullName, getUser, internProfiles, programs } from "@/mock/data";
import type { ProgramStatus } from "@/types";

interface ProgramRow {
  id: string;
  title: string;
  department: string;
  mentorName: string;
  role: string;
  startDate: string;
  endDate: string;
  status: ProgramStatus;
  internCount: number;
}

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState<TimeRangeValue>(defaultTimeRange);

  const filteredPrograms = useMemo(
    () => filterProgramsByRange(programs, range.startDate, range.endDate),
    [range.endDate, range.startDate],
  );

  const rows: ProgramRow[] = useMemo(
    () =>
      filteredPrograms.map((program) => {
        const mentor = getUser(program.mentorId);
        return {
          id: program.id,
          title: program.title,
          department: program.department,
          mentorName: mentor ? fullName(mentor) : program.mentorId,
          role: program.role,
          startDate: program.startDate,
          endDate: program.endDate,
          status: program.status,
          internCount: internProfiles.filter((ip) => ip.programId === program.id).length,
        };
      }),
    [filteredPrograms],
  );

  const metrics = useMemo(() => {
    const activePrograms = filteredPrograms.filter((p) => p.status === "ACTIVE").length;
    const completedPrograms = filteredPrograms.filter((p) => p.status === "COMPLETED").length;
    const programIds = new Set(filteredPrograms.map((p) => p.id));
    const internsInRange = internProfiles.filter((ip) => programIds.has(ip.programId));
    const mentorIds = new Set(filteredPrograms.map((p) => p.mentorId));
    const avgInterns =
      filteredPrograms.length === 0
        ? 0
        : Math.round(
            (rows.reduce((sum, row) => sum + row.internCount, 0) / filteredPrograms.length) * 10,
          ) / 10;

    const byDepartment = Object.entries(
      filteredPrograms.reduce<Record<string, number>>((acc, program) => {
        acc[program.department] = (acc[program.department] ?? 0) + 1;
        return acc;
      }, {}),
    ).map(([department, count]) => ({ department, count }));

    return {
      activePrograms,
      totalPrograms: filteredPrograms.length,
      totalInterns: internsInRange.length,
      completedPrograms,
      mentorsInvolved: mentorIds.size,
      avgInterns,
      byDepartment,
      byStatus: countByStatus(filteredPrograms),
    };
  }, [filteredPrograms, rows]);

  const excelContent = useMemo(() => {
    const header = [
      "Program title",
      "Department",
      "Mentor",
      "Role",
      "Start date",
      "End date",
      "Status",
      "Number of interns",
    ].join(",");
    const body = rows
      .map((row) =>
        [
          csv(row.title),
          csv(row.department),
          csv(row.mentorName),
          csv(row.role),
          row.startDate,
          row.endDate,
          row.status,
          String(row.internCount),
        ].join(","),
      )
      .join("\n");
    return `${header}\n${body}\n`;
  }, [rows]);

  const deptMax = Math.max(1, ...metrics.byDepartment.map((d) => d.count));
  const statusMax = Math.max(1, ...metrics.byStatus.map((s) => s.count));

  return (
    <div>
      <PageHeader
        title="Programs analytics"
        description="Management overview of internship programs for a selected time range. Mock data only — exports are frontend placeholders."
        actions={
          <ExportButtons
            excelFilename="programs-overview.csv"
            pdfFilename="programs-overview.pdf"
            excelContent={excelContent}
          />
        }
      />

      <div className="mb-6">
        <TimeRangeFilter value={range} onChange={setRange} idPrefix="analytics" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Active programs" value={metrics.activePrograms} accent />
        <MetricCard label="Total programs" value={metrics.totalPrograms} />
        <MetricCard label="Total interns" value={metrics.totalInterns} />
        <MetricCard label="Completed programs" value={metrics.completedPrograms} />
        <MetricCard label="Mentors involved" value={metrics.mentorsInvolved} />
        <MetricCard label="Avg interns per program" value={metrics.avgInterns} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ChartPlaceholder
          title="Programs by department"
          metric="Programs in selected range"
          chartType="Bar chart"
        >
          {metrics.byDepartment.length === 0 ? (
            <p className="text-sm text-ink-muted">No programs in this range.</p>
          ) : (
            metrics.byDepartment.map((row) => (
              <BarRow
                key={row.department}
                label={row.department}
                value={row.count}
                max={deptMax}
              />
            ))
          )}
        </ChartPlaceholder>

        <ChartPlaceholder
          title="Programs by status"
          metric="Programs in selected range"
          chartType="Bar chart"
        >
          {metrics.byStatus.map((row) => (
            <BarRow key={row.status} label={row.status} value={row.count} max={statusMax} />
          ))}
        </ChartPlaceholder>
      </div>

      <section className="mt-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="section-title">Program details</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Internship programs that overlap the selected time range.
            </p>
          </div>
          <ExportButtons
            excelFilename="programs-overview.csv"
            pdfFilename="programs-overview.pdf"
            excelContent={excelContent}
          />
        </div>
        {rows.length === 0 ? (
          <div className="card p-6 text-sm text-ink-muted">
            No internship programs found for the selected time range.
          </div>
        ) : (
          <DataTable
            rows={rows}
            mobileTitle={(row) => row.title}
            columns={[
              { key: "title", header: "Program title", render: (row) => row.title },
              { key: "department", header: "Department", render: (row) => row.department },
              { key: "mentor", header: "Mentor", render: (row) => row.mentorName },
              { key: "role", header: "Role", render: (row) => row.role },
              {
                key: "start",
                header: "Start date",
                render: (row) => formatDate(row.startDate),
              },
              {
                key: "end",
                header: "End date",
                render: (row) => formatDate(row.endDate),
              },
              {
                key: "status",
                header: "Status",
                render: (row) => <StatusBadge kind="program" value={row.status} />,
              },
              {
                key: "interns",
                header: "Number of interns",
                render: (row) => row.internCount,
              },
            ]}
          />
        )}
      </section>
    </div>
  );
}

function csv(value: string) {
  if (value.includes(",") || value.includes('"')) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

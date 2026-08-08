"use client";

import { useMemo, useState } from "react";
import { ChartPlaceholder, BarRow } from "@/components/ui/ChartPlaceholder";
import {
  defaultTimeRange,
  TimeRangeFilter,
  type TimeRangeValue,
} from "@/components/filters/TimeRangeFilter";
import { countByStatus, filterProgramsByRange } from "@/lib/programTime";
import { programs } from "@/mock/data";
import type { ProgramStatus } from "@/types";

const STATUSES: ProgramStatus[] = [
  "DRAFT",
  "ACTIVE",
  "COMPLETED",
  "ARCHIVED",
  "CANCELLED",
];

export function ProgramStatusChart() {
  const [range, setRange] = useState<TimeRangeValue>(defaultTimeRange);

  const filtered = useMemo(
    () => filterProgramsByRange(programs, range.startDate, range.endDate),
    [range.endDate, range.startDate],
  );

  const programByStatus = useMemo(
    () => countByStatus(filtered, STATUSES),
    [filtered],
  );

  const activeCount = filtered.filter((p) => p.status === "ACTIVE").length;
  const max = Math.max(1, ...programByStatus.map((row) => row.count));

  return (
    <ChartPlaceholder
      title="Programs by status"
      metric="Count of programs per status for the selected period"
      chartType="Bar chart"
      summary={`${filtered.length} programs in range · ${activeCount} active.`}
    >
      <div className="mb-4">
        <TimeRangeFilter value={range} onChange={setRange} idPrefix="program-status" />
      </div>
      {programByStatus.map((row) => (
        <BarRow key={row.status} label={row.status} value={row.count} max={max} />
      ))}
    </ChartPlaceholder>
  );
}

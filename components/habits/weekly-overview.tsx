"use client";

import { useMemo, useState } from "react";

import type { WeeklyHabitStats } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const weekdayOrder = [1, 2, 3, 4, 5, 6, 0] as const;
const weekdayLabels = {
  0: "Paz",
  1: "Pzt",
  2: "Sal",
  3: "Car",
  4: "Per",
  5: "Cum",
  6: "Cmt"
} as const;

type FilterKey = "tumu" | "takip-eksik" | "veri-var" | "bos-planli";

function formatCell(value: number | null, planned: boolean) {
  if (!planned) {
    return "N/A";
  }

  return value ?? "-";
}

export function WeeklyOverview({ rows }: { rows: WeeklyHabitStats[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("tumu");

  const summary = useMemo(() => {
    const trackingMissing = rows.filter((row) =>
      row.weekdays.some((day) => day.planned && day.trackingConfirmed === false)
    ).length;
    const withEntries = rows.filter((row) => row.filledDays > 0).length;
    const complete = rows.filter((row) => row.plannedDays > 0 && row.filledDays === row.plannedDays).length;

    return {
      total: rows.length,
      trackingMissing,
      withEntries,
      complete
    };
  }, [rows]);

  const filteredRows = useMemo(() => {
    const loweredQuery = query.trim().toLocaleLowerCase("tr");

    return rows.filter((row) => {
      const matchesQuery =
        !loweredQuery ||
        [row.habitName, row.implementationIntention, row.habitStacking, row.trackingStacking]
          .join(" ")
          .toLocaleLowerCase("tr")
          .includes(loweredQuery);

      if (!matchesQuery) {
        return false;
      }

      if (filter === "takip-eksik") {
        return row.weekdays.some((day) => day.planned && day.trackingConfirmed === false);
      }

      if (filter === "veri-var") {
        return row.filledDays > 0;
      }

      if (filter === "bos-planli") {
        return row.plannedDays > 0 && row.filledDays === 0;
      }

      return true;
    });
  }, [filter, query, rows]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border bg-[var(--secondary)] p-5">
          <div className="text-sm text-black/55">Bu haftaki alışkanlık</div>
          <div className="mt-2 font-serif text-4xl font-semibold">{summary.total}</div>
        </div>
        <div className="rounded-3xl border bg-white p-5">
          <div className="text-sm text-black/55">Veri girilenler</div>
          <div className="mt-2 font-serif text-4xl font-semibold">{summary.withEntries}</div>
        </div>
        <div className="rounded-3xl border bg-amber-50 p-5">
          <div className="text-sm text-amber-900/70">Takip eksiği olanlar</div>
          <div className="mt-2 font-serif text-4xl font-semibold text-amber-950">{summary.trackingMissing}</div>
        </div>
        <div className="rounded-3xl border bg-white p-5">
          <div className="text-sm text-black/55">Tam dolu haftalar</div>
          <div className="mt-2 font-serif text-4xl font-semibold">{summary.complete}</div>
        </div>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div>
            <CardTitle>Haftalık skor tablosu</CardTitle>
            <CardDescription>
              Takip eksiği olan günler sarı vurgulanır. Planlı olmayan günler `N/A`, planlı ama boş günler `-` olarak
              kalır.
            </CardDescription>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
            <Input
              placeholder="Alışkanlık, niyet, istif veya takip metninde ara"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              {[
                ["tumu", "Tümü"],
                ["takip-eksik", "Takip eksiği"],
                ["veri-var", "Veri girilen"],
                ["bos-planli", "Planlı ama boş"]
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value as FilterKey)}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    filter === value ? "border-[var(--primary)] bg-[var(--secondary)]" : "bg-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3 text-sm text-black/60">
            <span className="rounded-full border bg-white px-3 py-1">Görünen kayıt: {filteredRows.length}</span>
            <span className="rounded-full border bg-amber-50 px-3 py-1">Sarı hücre: takip girilmemiş gün</span>
            <span className="rounded-full border bg-white px-3 py-1">Yüzde sadece planlı günler üstünden hesaplanır</span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[1080px] text-sm">
              <thead>
                <tr className="border-b text-left text-black/55">
                  <th className="py-3 pr-4 font-medium">Alışkanlık</th>
                  {weekdayOrder.map((weekday) => (
                    <th key={weekday} className="py-3 px-3 text-center font-medium">
                      {weekdayLabels[weekday]}
                    </th>
                  ))}
                  <th className="py-3 px-3 text-center font-medium">Toplam</th>
                  <th className="py-3 px-3 text-center font-medium">Ortalama</th>
                  <th className="py-3 px-3 text-center font-medium">Yüzde</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => {
                  const weekdayMap = new Map(row.weekdays.map((day) => [day.weekday, day]));
                  const hasPlannedDays = row.plannedDays > 0;
                  const hasFilledDays = row.filledDays > 0;
                  const hasTrackingGap = row.weekdays.some((day) => day.planned && day.trackingConfirmed === false);

                  return (
                    <tr key={row.habitId} className="border-b align-top last:border-0">
                      <td className="py-4 pr-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="font-medium">{row.habitName}</div>
                          {hasTrackingGap ? (
                            <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-900">
                              Takip eksiği
                            </span>
                          ) : null}
                          {row.filledDays === row.plannedDays && row.plannedDays > 0 ? (
                            <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-900">
                              Tamamı dolu
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-2 grid gap-1 text-xs text-black/60">
                          <div>Uygulamaya koyma niyeti: {row.implementationIntention || "-"}</div>
                          <div>Alışkanlık istifi: {row.habitStacking || "-"}</div>
                          <div>Takip istifi: {row.trackingStacking}</div>
                        </div>
                        <div className="mt-2 text-xs text-black/55">
                          {row.filledDays}/{row.plannedDays || 0} planlı gün dolu
                        </div>
                      </td>

                      {weekdayOrder.map((weekday) => {
                        const day = weekdayMap.get(weekday);
                        const cellValue = day ? formatCell(day.score, day.planned) : "N/A";
                        const isNA = cellValue === "N/A";
                        const missingTracking = day?.planned && day.trackingConfirmed === false;

                        return (
                          <td
                            key={weekday}
                            className={`px-3 py-4 text-center font-medium ${
                              isNA ? "text-black/35" : missingTracking ? "bg-amber-100 text-amber-900" : "text-black"
                            }`}
                          >
                            {cellValue}
                          </td>
                        );
                      })}

                      <td className={`px-3 py-4 text-center font-medium ${hasFilledDays ? "text-black" : "text-black/35"}`}>
                        {row.sum ?? "N/A"}
                      </td>
                      <td className={`px-3 py-4 text-center font-medium ${hasFilledDays ? "text-black" : "text-black/35"}`}>
                        {row.avg ?? "N/A"}
                      </td>
                      <td className={`px-3 py-4 text-center font-medium ${hasPlannedDays ? "text-black" : "text-black/35"}`}>
                        {row.percent !== null ? `%${row.percent}` : "N/A"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredRows.length === 0 ? (
            <div className="rounded-3xl border border-dashed p-6 text-sm text-black/60">
              Bu filtrede gösterilecek alışkanlık bulunamadı.
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

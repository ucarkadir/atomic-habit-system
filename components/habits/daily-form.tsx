"use client";

import { useState } from "react";
import { toast } from "sonner";

import { calculateScore } from "@/lib/score-engine";
import { HabitRule } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type DailyHabit = {
  id: string;
  habitName: string;
  implementationIntention: string;
  habitStacking: string;
  trackingStacking: string;
  metric1Label: string | null;
  metric1Unit: string | null;
  metric2Label: string | null;
  metric2Unit: string | null;
  supportsCompletedOnly: boolean;
  invertScore: boolean;
  ruleJson: unknown;
  entries: Array<{
    metric1Value: number | null;
    metric2Value: number | null;
    completed: boolean;
    trackingConfirmed: boolean;
    notes: string | null;
    score: number;
  }>;
};

export function DailyForm({
  date,
  habits
}: {
  date: string;
  habits: DailyHabit[];
}) {
  function parseMetricValue(value: string) {
    return value === "" ? null : Number(value);
  }

  function formatMetricLabel(label: string | null, unit: string | null, fallback: string) {
    if (!label && !unit) {
      return fallback;
    }

    if (label && unit) {
      return `${label} (${unit})`;
    }

    return label || unit || fallback;
  }

  const [savingId, setSavingId] = useState<string | null>(null);
  const [state, setState] = useState(() =>
    Object.fromEntries(
      habits.map((habit) => [
        habit.id,
        {
          metric1Value: habit.entries[0]?.metric1Value?.toString() ?? "",
          metric2Value: habit.entries[0]?.metric2Value?.toString() ?? "",
          completed: habit.entries[0]?.completed ?? false,
          trackingConfirmed: habit.entries[0]?.trackingConfirmed ?? false,
          notes: habit.entries[0]?.notes ?? "",
          score: habit.entries[0]?.score ?? null
        }
      ])
    )
  );

  async function saveHabit(habitId: string) {
    setSavingId(habitId);

    const current = state[habitId];
    const response = await fetch("/api/entries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        habitId,
        date,
        metric1Value: parseMetricValue(current.metric1Value),
        metric2Value: parseMetricValue(current.metric2Value),
        completed: current.completed,
        trackingConfirmed: current.trackingConfirmed,
        notes: current.notes || null
      })
    });

    const result = await response.json();
    setSavingId(null);

    if (!response.ok) {
      toast.error(result.error ?? "Kayit basarisiz");
      return;
    }

    setState((prev) => ({
      ...prev,
      [habitId]: {
        ...prev[habitId],
        score: result.entry.score
      }
    }));
    toast.success(`Kaydedildi. Skor: ${result.entry.score}`);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {habits.map((habit) => {
        const form = state[habit.id];
        const previewScore = calculateScore(
          habit.ruleJson as HabitRule,
          {
            metric1Value: parseMetricValue(form.metric1Value),
            metric2Value: parseMetricValue(form.metric2Value),
            completed: form.completed,
            trackingConfirmed: form.trackingConfirmed
          },
          habit.invertScore
        );
        const metric1Label = formatMetricLabel(habit.metric1Label, habit.metric1Unit, "Metric 1");
        const metric2Label = formatMetricLabel(habit.metric2Label, habit.metric2Unit, "Metric 2");

        return (
          <Card key={habit.id}>
            <CardHeader>
              <CardTitle>{habit.habitName}</CardTitle>
              <CardDescription>
                {habit.entries[0]?.score
                  ? `Kayitli skor: ${habit.entries[0].score} • Simdiki hesap: ${previewScore}`
                  : `Bugun icin giris yok • Simdiki hesap: ${previewScore}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 rounded-2xl border bg-black/[0.03] p-4 text-sm">
                <div>
                  <div className="text-black/55">Uygulamaya koyma niyeti</div>
                  <div className="font-medium">{habit.implementationIntention || "-"}</div>
                </div>
                <div>
                  <div className="text-black/55">Alışkanlık istifi</div>
                  <div className="font-medium">{habit.habitStacking || "-"}</div>
                </div>
                <div>
                  <div className="text-black/55">Takip istifi</div>
                  <div className="font-medium">{habit.trackingStacking}</div>
                </div>
              </div>

              {habit.metric1Label ? (
                <div className="space-y-2">
                  <Label>{metric1Label}</Label>
                  <Input
                    inputMode="decimal"
                    placeholder={habit.metric1Unit ?? "Deger gir"}
                    value={form.metric1Value}
                    onChange={(event) =>
                      setState((prev) => ({
                        ...prev,
                        [habit.id]: { ...prev[habit.id], metric1Value: event.target.value }
                      }))
                    }
                  />
                </div>
              ) : null}

              {habit.metric2Label ? (
                <div className="space-y-2">
                  <Label>{metric2Label}</Label>
                  <Input
                    inputMode="decimal"
                    placeholder={habit.metric2Unit ?? "Deger gir"}
                    value={form.metric2Value}
                    onChange={(event) =>
                      setState((prev) => ({
                        ...prev,
                        [habit.id]: { ...prev[habit.id], metric2Value: event.target.value }
                      }))
                    }
                  />
                </div>
              ) : null}

              <label className="flex items-center gap-3 rounded-2xl border p-4">
                <Checkbox
                  checked={form.completed}
                  onCheckedChange={(checked) =>
                    setState((prev) => ({
                      ...prev,
                      [habit.id]: { ...prev[habit.id], completed: checked === true }
                    }))
                  }
                />
                <div>
                  <div className="font-medium">Completed</div>
                  <div className="text-sm text-black/55">
                    {habit.supportsCompletedOnly
                      ? "Bu habit sadece completed ile de skor alabilir."
                      : "Completed bilgisi ruleJson içinde kullanılabilir."}
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <Checkbox
                  checked={form.trackingConfirmed}
                  onCheckedChange={(checked) =>
                    setState((prev) => ({
                      ...prev,
                      [habit.id]: { ...prev[habit.id], trackingConfirmed: checked === true }
                    }))
                  }
                />
                <div>
                  <div className="font-medium">Takibi tamamladım / puanı girdim</div>
                  <div className="text-sm text-black/55">Takip girilmeden alışkanlık tamamlanmaz.</div>
                </div>
              </label>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={form.notes}
                  onChange={(event) =>
                    setState((prev) => ({
                      ...prev,
                      [habit.id]: { ...prev[habit.id], notes: event.target.value }
                    }))
                  }
                />
              </div>

              <div className="rounded-2xl bg-black/[0.03] px-4 py-3 text-sm text-black/65">
                <p>
                  Hesaplanan skor: <span className="font-medium text-black">{previewScore}</span>
                </p>
                {!form.trackingConfirmed ? (
                  <p className="text-amber-700">Takip onayı verilmediği için alışkanlık tamamlanmış sayılmaz.</p>
                ) : null}
                {habit.invertScore ? <p>invertScore acik oldugu icin skor ters cevriliyor.</p> : null}
              </div>

              <Button onClick={() => saveHabit(habit.id)} disabled={savingId === habit.id}>
                {savingId === habit.id ? "Kaydediliyor..." : `Kaydet • skor ${previewScore}`}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

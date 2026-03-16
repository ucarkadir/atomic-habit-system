"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type DailyHabit = {
  id: string;
  habitName: string;
  metric1Label: string | null;
  metric1Unit: string | null;
  metric2Label: string | null;
  metric2Unit: string | null;
  supportsCompletedOnly: boolean;
  entries: Array<{
    metric1Value: number | null;
    metric2Value: number | null;
    completed: boolean;
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
  const [savingId, setSavingId] = useState<string | null>(null);
  const [state, setState] = useState(() =>
    Object.fromEntries(
      habits.map((habit) => [
        habit.id,
        {
          metric1Value: habit.entries[0]?.metric1Value?.toString() ?? "",
          metric2Value: habit.entries[0]?.metric2Value?.toString() ?? "",
          completed: habit.entries[0]?.completed ?? false,
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
        metric1Value: current.metric1Value === "" ? null : Number(current.metric1Value),
        metric2Value: current.metric2Value === "" ? null : Number(current.metric2Value),
        completed: current.completed,
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
        return (
          <Card key={habit.id}>
            <CardHeader>
              <CardTitle>{habit.habitName}</CardTitle>
              <CardDescription>
                {habit.entries[0]?.score ? `Bugunku skor: ${habit.entries[0].score}` : "Bugun icin giris yok"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {habit.metric1Label ? (
                <div className="space-y-2">
                  <Label>{habit.metric1Label}</Label>
                  <Input
                    inputMode="decimal"
                    placeholder={habit.metric1Unit ?? "Birim"}
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
                  <Label>{habit.metric2Label}</Label>
                  <Input
                    inputMode="decimal"
                    placeholder={habit.metric2Unit ?? "Birim"}
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

              <Button onClick={() => saveHabit(habit.id)} disabled={savingId === habit.id}>
                {savingId === habit.id ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

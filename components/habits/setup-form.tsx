"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RuleBuilder } from "@/components/habits/rule-builder";
import { UnitSelect } from "@/components/habits/unit-select";

type HabitRecord = {
  id: string;
  habitName: string;
  identityStatement: string | null;
  implementationIntention: string | null;
  habitStacking: string | null;
  trackingStacking: string | null;
  weeklyTargetText: string | null;
  metric1Label: string | null;
  metric1Unit: string | null;
  metric2Label: string | null;
  metric2Unit: string | null;
  supportsCompletedOnly: boolean;
  invertScore: boolean;
  ruleJson: unknown;
  schedules: Array<{ weekday: number; isPlanned: boolean }>;
};

const weekdayLabels = ["Paz", "Pzt", "Sal", "Car", "Per", "Cum", "Cmt"];

const emptyHabit = {
  habitName: "",
  identityStatement: "",
  implementationIntention: "",
  habitStacking: "",
  trackingStacking: "",
  weeklyTargetText: "",
  metric1Label: "",
  metric1Unit: "",
  metric2Label: "",
  metric2Unit: "",
  supportsCompletedOnly: false,
  invertScore: false,
  ruleJson: "",
  schedules: Array.from({ length: 7 }, (_, weekday) => ({ weekday, isPlanned: weekday !== 0 }))
};

export function SetupForm({ habits }: { habits: HabitRecord[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(habits[0]?.id ?? null);
  const selectedHabit = habits.find((habit) => habit.id === selectedId);
  const [form, setForm] = useState(() =>
    selectedHabit
      ? {
          ...selectedHabit,
          ruleJson: JSON.stringify(selectedHabit.ruleJson, null, 2)
        }
      : emptyHabit
  );
  const [saving, setSaving] = useState(false);

  function loadHabit(habit: HabitRecord | null) {
    setSelectedId(habit?.id ?? null);
    setForm(
      habit
        ? {
            ...habit,
            ruleJson: JSON.stringify(habit.ruleJson, null, 2)
          }
        : emptyHabit
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    const response = await fetch("/api/habits", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...form,
        id: selectedId ?? undefined
      })
    });

    const result = await response.json();
    setSaving(false);

    if (!response.ok) {
      toast.error(result.error ?? "Kayit basarisiz");
      return;
    }

    toast.success("Habit kaydedildi.");
    window.location.reload();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Habit listesi</CardTitle>
          <CardDescription>Mevcut bir habit sec veya yeni kayit ac.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full" onClick={() => loadHabit(null)}>
            Yeni habit
          </Button>
          {habits.map((habit) => (
            <button
              key={habit.id}
              type="button"
              onClick={() => loadHabit(habit)}
              className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                selectedId === habit.id ? "border-[var(--primary)] bg-[var(--secondary)]" : "bg-white"
              }`}
            >
              <div className="font-medium">{habit.habitName}</div>
              <div className="text-sm text-black/55">{habit.weeklyTargetText || "Hedef yazilmamis"}</div>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Setup</CardTitle>
          <CardDescription>
            Her habit icin 0..2 genel metrik, completed-only davranisi ve dinamik score kuralı tanımlanır.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="habitName">Habit name</Label>
                <Input
                  id="habitName"
                  value={form.habitName}
                  onChange={(event) => setForm((current) => ({ ...current, habitName: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weeklyTargetText">Weekly target text</Label>
                <Input
                  id="weeklyTargetText"
                  value={form.weeklyTargetText ?? ""}
                  onChange={(event) => setForm((current) => ({ ...current, weeklyTargetText: event.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="identityStatement">Identity statement</Label>
                <Textarea
                  id="identityStatement"
                  value={form.identityStatement ?? ""}
                  onChange={(event) => setForm((current) => ({ ...current, identityStatement: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="implementationIntention">Implementation intention</Label>
                <Textarea
                  id="implementationIntention"
                  value={form.implementationIntention ?? ""}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, implementationIntention: event.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="habitStacking">Habit stacking</Label>
                <Input
                  id="habitStacking"
                  value={form.habitStacking ?? ""}
                  onChange={(event) => setForm((current) => ({ ...current, habitStacking: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trackingStacking">Tracking stacking</Label>
                <Input
                  id="trackingStacking"
                  value={form.trackingStacking ?? ""}
                  onChange={(event) => setForm((current) => ({ ...current, trackingStacking: event.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="metric1Label">Metric 1 label</Label>
                <Input
                  id="metric1Label"
                  value={form.metric1Label ?? ""}
                  onChange={(event) => setForm((current) => ({ ...current, metric1Label: event.target.value }))}
                />
              </div>
              <UnitSelect
                id="metric1Unit"
                label="Metric 1 unit"
                value={form.metric1Unit ?? ""}
                onChange={(value) => setForm((current) => ({ ...current, metric1Unit: value }))}
              />
              <div className="space-y-2">
                <Label htmlFor="metric2Label">Metric 2 label</Label>
                <Input
                  id="metric2Label"
                  value={form.metric2Label ?? ""}
                  onChange={(event) => setForm((current) => ({ ...current, metric2Label: event.target.value }))}
                />
              </div>
              <UnitSelect
                id="metric2Unit"
                label="Metric 2 unit"
                value={form.metric2Unit ?? ""}
                onChange={(value) => setForm((current) => ({ ...current, metric2Unit: value }))}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex items-center gap-3 rounded-2xl border p-4">
                <Checkbox
                  checked={form.supportsCompletedOnly}
                  onCheckedChange={(checked) =>
                    setForm((current) => ({ ...current, supportsCompletedOnly: checked === true }))
                  }
                />
                <div>
                  <div className="font-medium">supportsCompletedOnly</div>
                  <div className="text-sm text-black/55">Sadece completed check ile de kullanilabilsin.</div>
                </div>
              </label>
              <label className="flex items-center gap-3 rounded-2xl border p-4">
                <Checkbox
                  checked={form.invertScore}
                  onCheckedChange={(checked) =>
                    setForm((current) => ({ ...current, invertScore: checked === true }))
                  }
                />
                <div>
                  <div className="font-medium">invertScore</div>
                  <div className="text-sm text-black/55">Skor 6 - score olarak ters cevrilir.</div>
                </div>
              </label>
            </div>

            <div className="space-y-3">
              <Label>Weekly schedule</Label>
              <div className="grid gap-2 sm:grid-cols-7">
                {form.schedules.map((schedule, index) => (
                  <label key={schedule.weekday} className="flex items-center gap-3 rounded-2xl border p-3">
                    <Checkbox
                      checked={schedule.isPlanned}
                      onCheckedChange={(checked) =>
                        setForm((current) => ({
                          ...current,
                          schedules: current.schedules.map((item, innerIndex) =>
                            innerIndex === index ? { ...item, isPlanned: checked === true } : item
                          )
                        }))
                      }
                    />
                    <span className="text-sm">{weekdayLabels[schedule.weekday]}</span>
                  </label>
                ))}
              </div>
            </div>

            <RuleBuilder
              value={form.ruleJson}
              onChange={(ruleJson) => setForm((current) => ({ ...current, ruleJson }))}
            />

            <Button type="submit" disabled={saving}>
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

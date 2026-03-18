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

type FilterMode = "tum" | "oncelikli" | "takip-bekleyen" | "tamamlanan";

const earlyKeywords = [
  "sabah",
  "uyan",
  "uyanınca",
  "kahvaltı",
  "kahvalti",
  "işe başlamadan",
  "ise baslamadan",
  "ilk",
  "erken",
  "güne başla",
  "gune basla"
];

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

function getTimingPriority(habit: Pick<DailyHabit, "implementationIntention" | "habitStacking" | "trackingStacking" | "habitName">) {
  const haystack = [
    habit.implementationIntention,
    habit.habitStacking,
    habit.trackingStacking,
    habit.habitName
  ]
    .join(" ")
    .toLowerCase();

  return earlyKeywords.some((keyword) => haystack.includes(keyword)) ? 0 : 1;
}

export function DailyForm({
  date,
  habits
}: {
  date: string;
  habits: DailyHabit[];
}) {
  const [savingId, setSavingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("tum");
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
      toast.error(result.error ?? "Kayıt başarısız");
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

  const enrichedHabits = habits.map((habit) => {
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

    return {
      habit,
      form,
      previewScore,
      isCompleted: form.completed && form.trackingConfirmed,
      needsTracking: form.completed && !form.trackingConfirmed,
      timingPriority: getTimingPriority(habit)
    };
  });

  const summary = {
    total: enrichedHabits.length,
    completed: enrichedHabits.filter((item) => item.isCompleted).length,
    needsTracking: enrichedHabits.filter((item) => item.needsTracking).length,
    early: enrichedHabits.filter((item) => item.timingPriority === 0).length
  };

  const filteredHabits = enrichedHabits
    .filter(({ habit, form, needsTracking, isCompleted }) => {
      const searchable = [
        habit.habitName,
        habit.implementationIntention,
        habit.habitStacking,
        habit.trackingStacking
      ]
        .join(" ")
        .toLowerCase();

      const matchesQuery = searchable.includes(query.trim().toLowerCase());
      if (!matchesQuery) return false;

      if (filterMode === "oncelikli") {
        return getTimingPriority(habit) === 0 && !isCompleted;
      }

      if (filterMode === "takip-bekleyen") {
        return needsTracking;
      }

      if (filterMode === "tamamlanan") {
        return isCompleted;
      }

      return true;
    })
    .sort((left, right) => {
      if (left.isCompleted !== right.isCompleted) {
        return left.isCompleted ? 1 : -1;
      }

      if (left.needsTracking !== right.needsTracking) {
        return left.needsTracking ? -1 : 1;
      }

      if (left.timingPriority !== right.timingPriority) {
        return left.timingPriority - right.timingPriority;
      }

      return left.habit.habitName.localeCompare(right.habit.habitName, "tr");
    });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border bg-[var(--secondary)] p-5">
          <div className="text-sm text-black/55">Bugünkü alışkanlık</div>
          <div className="mt-2 font-serif text-4xl font-semibold">{summary.total}</div>
        </div>
        <div className="rounded-3xl border bg-white p-5">
          <div className="text-sm text-black/55">Tamamlanan</div>
          <div className="mt-2 font-serif text-4xl font-semibold">{summary.completed}</div>
        </div>
        <div className="rounded-3xl border bg-amber-50 p-5">
          <div className="text-sm text-black/55">Takip bekleyen</div>
          <div className="mt-2 font-serif text-4xl font-semibold">{summary.needsTracking}</div>
        </div>
        <div className="rounded-3xl border bg-white p-5">
          <div className="text-sm text-black/55">Öncelikli</div>
          <div className="mt-2 font-serif text-4xl font-semibold">{summary.early}</div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Günlük akış</CardTitle>
          <CardDescription>
            Sabah veya günün ilk kısmında yapılacak alışkanlıklar üstte görünür. Filtrelerle odak alanını daraltabilir,
            aramayla tek bir alışkanlığa inebilirsin.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-2">
            <Label htmlFor="dailySearch">Alışkanlık ara</Label>
            <Input
              id="dailySearch"
              placeholder="Ad, uygulama niyeti veya takip istifi ile ara"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-end gap-2">
            {[
              { id: "tum", label: "Tümü" },
              { id: "oncelikli", label: "İlk yapılacaklar" },
              { id: "takip-bekleyen", label: "Takip bekleyen" },
              { id: "tamamlanan", label: "Tamamlanan" }
            ].map((item) => (
              <Button
                key={item.id}
                type="button"
                variant={filterMode === item.id ? "default" : "outline"}
                onClick={() => setFilterMode(item.id as FilterMode)}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        {filteredHabits.map(({ habit, form, previewScore, timingPriority, needsTracking }) => {
          const metric1Label = formatMetricLabel(habit.metric1Label, habit.metric1Unit, "Metrik 1");
          const metric2Label = formatMetricLabel(habit.metric2Label, habit.metric2Unit, "Metrik 2");

          return (
            <Card key={habit.id} className={timingPriority === 0 ? "border-[var(--primary)]" : ""}>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <CardTitle>{habit.habitName}</CardTitle>
                    <CardDescription>
                      {form.score !== null
                        ? `Kayıtlı skor: ${form.score} • Şimdiki hesap: ${previewScore}`
                        : `Bugün için giriş yok • Şimdiki hesap: ${previewScore}`}
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {timingPriority === 0 ? (
                      <span className="rounded-full bg-[var(--secondary)] px-3 py-1 font-medium">İlk yapılacak</span>
                    ) : null}
                    {needsTracking ? (
                      <span className="rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-900">
                        Takip bekliyor
                      </span>
                    ) : null}
                  </div>
                </div>
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
                      placeholder={habit.metric1Unit ?? "Değer gir"}
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
                      placeholder={habit.metric2Unit ?? "Değer gir"}
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

                <div className="grid gap-3 md:grid-cols-2">
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
                      <div className="font-medium">Tamamlandı</div>
                      <div className="text-sm text-black/55">
                        {habit.supportsCompletedOnly
                          ? "Bu alışkanlık sadece tamamlandı bilgisiyle de skor alabilir."
                          : "Tamamlandı bilgisi ruleJson içinde kullanılabilir."}
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
                      <div className="font-medium">Takibi tamamladım</div>
                      <div className="text-sm text-black/55">Takip girilmeden alışkanlık tamamlanmaz.</div>
                    </div>
                  </label>
                </div>

                <div className="space-y-2">
                  <Label>Notlar</Label>
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
                  {habit.invertScore ? <p>invertScore açık olduğu için skor ters çevriliyor.</p> : null}
                </div>

                <Button onClick={() => saveHabit(habit.id)} disabled={savingId === habit.id} className="w-full">
                  {savingId === habit.id ? "Kaydediliyor..." : `Kaydet • skor ${previewScore}`}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredHabits.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-black/60">
            Seçtiğin filtreye uygun alışkanlık bulunamadı. Aramayı veya filtreleri temizleyebilirsin.
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

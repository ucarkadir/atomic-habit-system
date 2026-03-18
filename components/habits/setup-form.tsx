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
          <CardTitle>Alışkanlık listesi</CardTitle>
          <CardDescription>Mevcut bir alışkanlığı seç veya yeni kayıt aç.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full" onClick={() => loadHabit(null)}>
            Yeni alışkanlık
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
              <div className="text-sm text-black/55">{habit.weeklyTargetText || "Hedef yazılmamış"}</div>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kurulum</CardTitle>
          <CardDescription>
            Form artık önce davranışın bağlamını, sonra metriği ve en sonda puan kuralını kuracak şekilde düzenlendi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border bg-[var(--secondary)] p-4">
                <div className="text-sm text-black/55">3 kritik alan</div>
                <div className="mt-2 font-medium">Niyet, alışkanlık istifi ve takip istifi her zaman görünür kalır.</div>
              </div>
              <div className="rounded-3xl border bg-white p-4">
                <div className="text-sm text-black/55">Planlı günler</div>
                <div className="mt-2 font-serif text-3xl font-semibold">
                  {form.schedules.filter((item) => item.isPlanned).length}
                </div>
              </div>
              <div className="rounded-3xl border bg-white p-4">
                <div className="text-sm text-black/55">Metrik yapısı</div>
                <div className="mt-2 text-sm font-medium">
                  {form.metric1Label ? "1. metrik hazır" : "1. metrik bekliyor"}
                  {form.metric2Label ? " + 2. metrik aktif" : " + ikinci metrik opsiyonel"}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border">
              <table className="min-w-full text-sm">
                <thead className="bg-black/[0.03] text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Uygulamaya koyma niyeti</th>
                    <th className="px-4 py-3 font-medium">Alışkanlık istifi</th>
                    <th className="px-4 py-3 font-medium">Takip istifi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="px-4 py-3">{form.implementationIntention || "-"}</td>
                    <td className="px-4 py-3">{form.habitStacking || "-"}</td>
                    <td className="px-4 py-3 font-medium">{form.trackingStacking || "Manuel takip"}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="rounded-3xl border p-5">
              <div className="mb-4">
                <h3 className="font-medium">1. Davranışı tanımla</h3>
                <p className="text-sm text-black/55">Önce alışkanlığın adını, hedefini ve kimlik cümlesini netleştir.</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="habitName">Alışkanlık adı</Label>
                  <Input
                    id="habitName"
                    value={form.habitName}
                    onChange={(event) => setForm((current) => ({ ...current, habitName: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weeklyTargetText">Haftalık hedef metni</Label>
                  <Input
                    id="weeklyTargetText"
                    value={form.weeklyTargetText ?? ""}
                    onChange={(event) => setForm((current) => ({ ...current, weeklyTargetText: event.target.value }))}
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="identityStatement">Kimlik cümlesi</Label>
                  <Textarea
                    id="identityStatement"
                    value={form.identityStatement ?? ""}
                    onChange={(event) => setForm((current) => ({ ...current, identityStatement: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="implementationIntention">Uygulamaya koyma niyeti</Label>
                  <Textarea
                    id="implementationIntention"
                    value={form.implementationIntention ?? ""}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, implementationIntention: event.target.value }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="rounded-3xl border p-5">
              <div className="mb-4">
                <h3 className="font-medium">2. İstifleri ve takibi belirle</h3>
                <p className="text-sm text-black/55">Davranışın hangi tetikleyiciye ve hangi takip akışına bağlanacağını burada yaz.</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="habitStacking">Alışkanlık istifi</Label>
                  <Input
                    id="habitStacking"
                    value={form.habitStacking ?? ""}
                    onChange={(event) => setForm((current) => ({ ...current, habitStacking: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trackingStacking">Takip istifi</Label>
                  <Input
                    id="trackingStacking"
                    required
                    value={form.trackingStacking ?? ""}
                    onChange={(event) => setForm((current) => ({ ...current, trackingStacking: event.target.value }))}
                  />
                  <p className="text-sm text-black/55">Bu alan zorunludur. Takip yapılmadan alışkanlık tamamlanmış sayılmaz.</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border p-5">
              <div className="mb-4">
                <h3 className="font-medium">3. Metrikleri kur</h3>
                <p className="text-sm text-black/55">Birinci metrik çoğu durumda yeterlidir; ikinci metrik destek amaçlıdır.</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="metric1Label">Metrik 1 adı</Label>
                  <Input
                    id="metric1Label"
                    value={form.metric1Label ?? ""}
                    onChange={(event) => setForm((current) => ({ ...current, metric1Label: event.target.value }))}
                  />
                </div>
                <UnitSelect
                  id="metric1Unit"
                  label="Metrik 1 birimi"
                  value={form.metric1Unit ?? ""}
                  onChange={(value) => setForm((current) => ({ ...current, metric1Unit: value }))}
                />
                <div className="space-y-2">
                  <Label htmlFor="metric2Label">Metrik 2 adı</Label>
                  <Input
                    id="metric2Label"
                    value={form.metric2Label ?? ""}
                    onChange={(event) => setForm((current) => ({ ...current, metric2Label: event.target.value }))}
                  />
                </div>
                <UnitSelect
                  id="metric2Unit"
                  label="Metrik 2 birimi"
                  value={form.metric2Unit ?? ""}
                  onChange={(value) => setForm((current) => ({ ...current, metric2Unit: value }))}
                />
              </div>
            </div>

            <div className="rounded-3xl border p-5">
              <div className="mb-4">
                <h3 className="font-medium">4. Esneklik ve ters puan</h3>
                <p className="text-sm text-black/55">Tamamlandı kutusu ya da ters puan mantığı gerekiyorsa bu bölümde aç.</p>
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
                    <div className="font-medium">Sadece tamamlandı ile kullanılabilir</div>
                    <div className="text-sm text-black/55">
                      Bu alışkanlık yalnızca tamamlandı kutusuyla da takip edilebilir.
                    </div>
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
                    <div className="font-medium">Ters puan kullan</div>
                    <div className="text-sm text-black/55">Skor mantığı 6 - skor şeklinde ters çevrilir.</div>
                  </div>
                </label>
              </div>
            </div>

            <div className="rounded-3xl border p-5">
              <div className="mb-4">
                <h3 className="font-medium">5. Haftalık plan</h3>
                <p className="text-sm text-black/55">Yüzde hesabı yalnızca planlı günler üstünden çalışır.</p>
              </div>

              <div className="space-y-3">
                <Label>Planlı günler</Label>
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
            </div>

            <div className="rounded-3xl border p-5">
              <div className="mb-4">
                <h3 className="font-medium">6. Puan kuralını kur</h3>
                <p className="text-sm text-black/55">Rule Builder en son gelir; önce bağlam ve metrik netleştiğinde kullanımı daha kolay olur.</p>
              </div>

              <RuleBuilder
                value={form.ruleJson}
                onChange={(ruleJson) => setForm((current) => ({ ...current, ruleJson }))}
                metric1Label={form.metric1Label}
                metric1Unit={form.metric1Unit}
                metric2Label={form.metric2Label}
                metric2Unit={form.metric2Unit}
                supportsCompletedOnly={form.supportsCompletedOnly}
              />
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

import { getMonthlyData } from "@/lib/habits";
import { requireUser } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function MonthlyPage() {
  const user = await requireUser();
  const summary = await getMonthlyData(user.id);

  return (
    <section className="space-y-6">
      <div className="max-w-3xl space-y-2">
        <h1 className="font-serif text-4xl font-semibold">Monthly</h1>
        <p className="text-black/65">
          Her hafta için genel yüzde üretilir. Aylık ortalama, boş olmayan haftalık yüzdelerin aritmetik ortalamasıdır.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aylık özet</CardTitle>
          <CardDescription>Aylık ortalama: {summary.monthlyAverage ?? "N/A"}%</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {summary.weeklyPercents.map((week) => (
            <div key={week.weekStart} className="rounded-3xl border bg-[var(--secondary)] p-5">
              <div className="text-sm text-black/55">
                {week.weekStart} - {week.weekEnd}
              </div>
              <div className="mt-2 font-serif text-4xl font-semibold">
                {week.percent === null ? "N/A" : `%${week.percent}`}
              </div>
              <div className="mt-2 text-sm text-black/60">Haftalık genel yüzde</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}

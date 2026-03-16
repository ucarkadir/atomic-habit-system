import { getMonthlyData } from "@/lib/habits";
import { requireUser } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function MonthlyPage() {
  const user = await requireUser();
  const summary = await getMonthlyData(user.id);
  const validWeeks = summary.weeklyPercents.filter((week) => week.percent !== null).length;

  return (
    <section className="space-y-6">
      <div className="max-w-3xl space-y-2">
        <h1 className="font-serif text-4xl font-semibold">Monthly</h1>
        <p className="text-black/65">
          Her hafta için genel yüzde üretilir. Aylık ortalama, verisi olan haftaların aritmetik ortalamasıdır. Verisiz
          haftalar `N/A` olarak gösterilir.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border bg-[var(--secondary)] p-5">
          <div className="text-sm text-black/55">Aylık ortalama</div>
          <div className="mt-2 font-serif text-4xl font-semibold">
            {summary.monthlyAverage === null ? "N/A" : `%${summary.monthlyAverage}`}
          </div>
        </div>
        <div className="rounded-3xl border bg-white p-5">
          <div className="text-sm text-black/55">Veri olan hafta</div>
          <div className="mt-2 font-serif text-4xl font-semibold">{validWeeks}</div>
        </div>
        <div className="rounded-3xl border bg-white p-5">
          <div className="text-sm text-black/55">Toplam hafta kartı</div>
          <div className="mt-2 font-serif text-4xl font-semibold">{summary.weeklyPercents.length}</div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aylık haftalar</CardTitle>
          <CardDescription>
            Her kart bir haftayı gösterir. `N/A`, o hafta yüzdesi üretmek için yeterli planlı veri olmadığını ifade eder.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {summary.weeklyPercents.map((week) => (
            <div key={week.weekStart} className="rounded-3xl border p-5">
              <div className="text-sm text-black/55">
                {week.weekStart} - {week.weekEnd}
              </div>
              <div className="mt-2 font-serif text-4xl font-semibold">
                {week.percent === null ? "N/A" : `%${week.percent}`}
              </div>
              <div className="mt-2 text-sm text-black/60">
                {week.percent === null ? "Bu hafta hesaplanabilir veri yok." : "Haftalık genel yüzde"}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}

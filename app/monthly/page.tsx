import { getMonthlyData } from "@/lib/habits";
import { requireUser } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function MonthlyPage() {
  const user = await requireUser();
  const summary = await getMonthlyData(user.id);
  const validWeeks = summary.weeklyPercents.filter((week) => week.percent !== null).length;
  const strongestWeek = summary.weeklyPercents.reduce<(typeof summary.weeklyPercents)[number] | null>((best, week) => {
    if (week.percent === null) return best;
    if (!best || best.percent === null || week.percent > best.percent) return week;
    return best;
  }, null);
  const weakestWeek = summary.weeklyPercents.reduce<(typeof summary.weeklyPercents)[number] | null>((worst, week) => {
    if (week.percent === null) return worst;
    if (!worst || worst.percent === null || week.percent < worst.percent) return week;
    return worst;
  }, null);
  const lowWeeks = summary.weeklyPercents.filter((week) => week.percent !== null && week.percent < 60).length;

  return (
    <section className="space-y-6">
      <div className="max-w-3xl space-y-2">
        <h1 className="font-serif text-4xl font-semibold">Aylık</h1>
        <p className="text-black/65">
          Aylık görünüm artık sadece yüzde göstermek yerine hangi haftanın güçlü, hangisinin zayıf olduğunu da öne
          çıkarır. Böylece sonraki haftaya daha net odak belirleyebilirsin.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border bg-[var(--secondary)] p-5">
          <div className="text-sm text-black/55">Aylık ortalama</div>
          <div className="mt-2 font-serif text-4xl font-semibold">
            {summary.monthlyAverage === null ? "N/A" : `%${summary.monthlyAverage}`}
          </div>
        </div>
        <div className="rounded-3xl border bg-white p-5">
          <div className="text-sm text-black/55">Veri olan haftalar</div>
          <div className="mt-2 font-serif text-4xl font-semibold">{validWeeks}</div>
        </div>
        <div className="rounded-3xl border bg-white p-5">
          <div className="text-sm text-black/55">Toplam hafta kartları</div>
          <div className="mt-2 font-serif text-4xl font-semibold">{summary.weeklyPercents.length}</div>
        </div>
        <div className="rounded-3xl border bg-amber-50 p-5">
          <div className="text-sm text-amber-900/70">Odak isteyen haftalar</div>
          <div className="mt-2 font-serif text-4xl font-semibold text-amber-950">{lowWeeks}</div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border bg-white p-5">
          <div className="text-sm text-black/55">En iyi hafta</div>
          <div className="mt-2 font-serif text-3xl font-semibold">
            {strongestWeek?.percent !== null && strongestWeek ? `%${strongestWeek.percent}` : "N/A"}
          </div>
          <div className="mt-2 text-sm text-black/60">
            {strongestWeek ? `${strongestWeek.weekStart} - ${strongestWeek.weekEnd}` : "Henüz veri oluşmadı"}
          </div>
        </div>
        <div className="rounded-3xl border bg-white p-5">
          <div className="text-sm text-black/55">En çok dikkat isteyen hafta</div>
          <div className="mt-2 font-serif text-3xl font-semibold">
            {weakestWeek?.percent !== null && weakestWeek ? `%${weakestWeek.percent}` : "N/A"}
          </div>
          <div className="mt-2 text-sm text-black/60">
            {weakestWeek ? `${weakestWeek.weekStart} - ${weakestWeek.weekEnd}` : "Henüz veri oluşmadı"}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aylık haftalar</CardTitle>
          <CardDescription>
            Her kart haftanın genel durumunu özetler. `N/A`, o hafta yüzde üretmek için yeterli planlı veri olmadığını
            ifade eder.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {summary.weeklyPercents.map((week) => {
            const tone =
              week.percent === null
                ? "bg-white"
                : week.percent >= 80
                  ? "bg-emerald-50"
                  : week.percent >= 60
                    ? "bg-[var(--secondary)]"
                    : "bg-amber-50";

            return (
              <div key={week.weekStart} className={`rounded-3xl border p-5 ${tone}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm text-black/55">
                    {week.weekStart} - {week.weekEnd}
                  </div>
                  <span className="rounded-full border bg-white/80 px-3 py-1 text-xs font-medium">
                    {week.percent === null
                      ? "Veri yok"
                      : week.percent >= 80
                        ? "Güçlü"
                        : week.percent >= 60
                          ? "Dengeli"
                          : "Zayıf"}
                  </span>
                </div>

                <div className="mt-4 font-serif text-4xl font-semibold">
                  {week.percent === null ? "N/A" : `%${week.percent}`}
                </div>

                <div className="mt-3 h-2 rounded-full bg-black/10">
                  <div
                    className="h-full rounded-full bg-[var(--primary)] transition-all"
                    style={{ width: `${week.percent ?? 0}%` }}
                  />
                </div>

                <div className="mt-3 text-sm text-black/60">
                  {week.percent === null
                    ? "Bu hafta hesaplanabilir veri yok."
                    : week.percent >= 80
                      ? "Ritim korunmuş görünüyor. Aynı yapıyı sürdür."
                      : week.percent >= 60
                        ? "Genel akış iyi. Zayıf günleri tespit edip küçük ayar yap."
                        : "Bu hafta sistemi sadeleştirip takip istifini öne almak iyi olur."}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </section>
  );
}

import { getWeeklyData } from "@/lib/habits";
import { requireUser } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

function formatCell(value: number | null, planned: boolean) {
  if (!planned) {
    return "N/A";
  }

  return value ?? "-";
}

export default async function WeeklyPage() {
  const user = await requireUser();
  const rows = await getWeeklyData(user.id);

  return (
    <section className="space-y-6">
      <div className="max-w-3xl space-y-2">
        <h1 className="font-serif text-4xl font-semibold">Haftalık</h1>
        <p className="text-black/65">
          Pzt-Paz kolonlarında sadece planlı günler hesaplanır. Planlı olmayan günler `N/A`, planlı ama boş günler `-`
          olarak gösterilir.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Haftalik skor tablosu</CardTitle>
          <CardDescription>
            Satir sonunda toplam skor, ortalama ve planli gün yüzdesi hesaplanır. `N/A` olan günler ve satırlar yüzdeye
            dahil edilmez.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-[980px] text-sm">
            <thead>
              <tr className="border-b text-left text-black/55">
                <th className="py-3 pr-4 font-medium">Habit</th>
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
              {rows.map((row) => {
                const weekdayMap = new Map(row.weekdays.map((day) => [day.weekday, day]));
                const hasPlannedDays = row.plannedDays > 0;
                const hasFilledDays = row.filledDays > 0;

                return (
                  <tr key={row.habitId} className="border-b align-top last:border-0">
                    <td className="py-4 pr-4">
                      <div className="font-medium">{row.habitName}</div>
                      <div className="mt-2 space-y-1 text-xs text-black/60">
                        <div>Uygulamaya koyma niyeti: {row.implementationIntention || "-"}</div>
                        <div>Alışkanlık istifi: {row.habitStacking || "-"}</div>
                        <div>Takip istifi: {row.trackingStacking}</div>
                      </div>
                      <div className="text-xs text-black/55">
                        {row.filledDays}/{row.plannedDays || 0} planli gun dolu
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
        </CardContent>
      </Card>
    </section>
  );
}

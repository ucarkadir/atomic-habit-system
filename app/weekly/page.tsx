import { getWeeklyData } from "@/lib/habits";
import { requireUser } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const weekdayLabels = ["Paz", "Pzt", "Sal", "Car", "Per", "Cum", "Cmt"];

export default async function WeeklyPage() {
  const user = await requireUser();
  const rows = await getWeeklyData(user.id);

  return (
    <section className="space-y-6">
      <div className="max-w-3xl space-y-2">
        <h1 className="font-serif text-4xl font-semibold">Weekly</h1>
        <p className="text-black/65">
          Planlı günlerde skorlar toplanır. Planlı olmayan günler N/A olarak gösterilir ve yüzde hesabına girmez.
        </p>
      </div>

      <div className="space-y-4">
        {rows.map((row) => (
          <Card key={row.habitId}>
            <CardHeader>
              <CardTitle>{row.habitName}</CardTitle>
              <CardDescription>
                filledDays {row.filledDays} • sum {row.sum ?? "N/A"} • avg {row.avg ?? "N/A"} • percent {row.percent ?? "N/A"}
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-black/55">
                    <th className="py-2 pr-4">Gun</th>
                    <th className="py-2 pr-4">Tarih</th>
                    <th className="py-2 pr-4">Skor</th>
                    <th className="py-2 pr-4">Metric 1</th>
                    <th className="py-2 pr-4">Metric 2</th>
                    <th className="py-2 pr-4">Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {row.weekdays.map((day) => (
                    <tr key={day.date} className="border-b last:border-0">
                      <td className="py-3 pr-4">{weekdayLabels[day.weekday]}</td>
                      <td className="py-3 pr-4">{day.date}</td>
                      <td className="py-3 pr-4">{day.planned ? day.score ?? "-" : "N/A"}</td>
                      <td className="py-3 pr-4">{day.planned ? day.metric1Value ?? "-" : "N/A"}</td>
                      <td className="py-3 pr-4">{day.planned ? day.metric2Value ?? "-" : "N/A"}</td>
                      <td className="py-3 pr-4">{day.planned ? (day.completed ? "Yes" : day.completed === false ? "No" : "-") : "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

import { getWeeklyData } from "@/lib/habits";
import { requireUser } from "@/lib/auth";
import { WeeklyOverview } from "@/components/habits/weekly-overview";

export default async function WeeklyPage() {
  const user = await requireUser();
  const rows = await getWeeklyData(user.id);

  return (
    <section className="space-y-6">
      <div className="max-w-3xl space-y-2">
        <h1 className="font-serif text-4xl font-semibold">Haftalık</h1>
        <p className="text-black/65">
          Haftalık tablo artık önce dikkat gerektiren alışkanlıkları bulmaya odaklanır. Arama, filtreleme ve takip
          eksiği vurgusu ile hangi kaydın geride kaldığını daha hızlı görebilirsin.
        </p>
      </div>

      <WeeklyOverview rows={rows} />
    </section>
  );
}

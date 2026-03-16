import { getDailyData } from "@/lib/habits";
import { requireUser } from "@/lib/auth";
import { SeedButton } from "@/components/habits/seed-button";
import { DailyForm } from "@/components/habits/daily-form";

export default async function DailyPage() {
  const user = await requireUser();
  const { date, habits } = await getDailyData(user.id);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <h1 className="font-serif text-4xl font-semibold">Daily</h1>
          <p className="text-black/65">
            {date} icin metric gir, completed ve not ekle. Kayit aninda server-side score otomatik hesaplanır.
          </p>
        </div>
        <SeedButton />
      </div>
      <DailyForm date={date} habits={habits} />
    </section>
  );
}

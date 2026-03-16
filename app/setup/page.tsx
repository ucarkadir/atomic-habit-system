import { requireUser } from "@/lib/auth";
import { listHabits } from "@/lib/habits";
import { SetupForm } from "@/components/habits/setup-form";

export default async function SetupPage() {
  const user = await requireUser();
  const habits = await listHabits(user.id);

  return (
    <section className="space-y-6">
      <div className="max-w-3xl space-y-2">
        <h1 className="font-serif text-4xl font-semibold">Setup</h1>
        <p className="text-black/65">
          Sabit alanlar yerine genel metrik yapısı kullanılır. Her habit 0..2 metrik, completed flag ve dinamik ruleJson ile tanımlanır.
        </p>
      </div>
      <SetupForm habits={habits} />
    </section>
  );
}

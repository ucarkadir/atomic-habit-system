import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const sections = [
  {
    title: "Girdi mantığı",
    body:
      "Her habit 0..2 metrik alabilir. Metriklerin adı ve birimi habit bazında değişir. İstersen sadece completed checkbox da kullanabilirsin."
  },
  {
    title: "Skor hesaplama",
    body:
      "ruleJson içindeki levels alanı artan skor eşikleri tanımlar. Sistem and, or, gte, lte, eq ve between operatörlerini çözer. invertScore açıksa sonuç 6 - score olur."
  },
  {
    title: "Single örnek",
    body:
      "45 dk çalışan bir habit için score 5 koşulu tek başına { op: 'gte', metric: 'metric1', value: 45 } şeklinde tanımlanır."
  },
  {
    title: "Double örnek",
    body:
      "30 dk + 10 cümle gibi birleşik hedef için { op: 'and', conditions: [...] } kullanılır. Böylece iki metrik birlikte değerlendirilir."
  },
  {
    title: "Completed örnek",
    body:
      "Sadece checkbox ile ilerlemek istiyorsan { op: 'eq', metric: 'completed', value: true } kuralı kullanılabilir."
  },
  {
    title: "Haftalık yüzde formülü",
    body:
      "Bir habit için haftalık yüzde = planlı günlerdeki skor toplamı / (planlı gün sayısı x 5) x 100. Planlı olmayan günler paya ve paydaya girmez."
  },
  {
    title: "Schedule ve N/A",
    body:
      "HabitSchedule içinde isPlanned false olan günler o habit için beklenen gün değildir. Weekly tabloda N/A görünür; boş gün sayılmaz ve yüzdeyi bozmaz."
  }
];

export default function HelpPage() {
  return (
    <section className="space-y-6">
      <div className="max-w-3xl space-y-2">
        <h1 className="font-serif text-4xl font-semibold">Help</h1>
        <p className="text-black/65">
          Bu sayfa genel metrik yaklaşımını, dinamik ruleJson modelini ve rapor hesaplarını açıklar.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {sections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-black/75">{section.body}</CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

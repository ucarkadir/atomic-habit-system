import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const sections = [
  {
    title: "1. Bu sistem ne yapar?",
    body: [
      "Bu uygulama, alışkanlıklarını tek tip checkbox mantığıyla değil, her alışkanlığa özel ölçüm mantığıyla takip etmeni sağlar.",
      "Her habit için en fazla 2 metrik tanımlayabilirsin. Örneğin okuma için 'sayfa' ve 'bölüm', egzersiz için 'dakika' ve 'set' gibi alanlar kullanılır.",
      "İstersen sadece completed checkbox ile çalışan bir habit de oluşturabilirsin."
    ]
  },
  {
    title: "2. İlk kurulum nasıl yapılır?",
    body: [
      "Önce Setup sayfasına git ve yeni bir habit oluştur.",
      "Habit adı yaz. İstersen identity statement, implementation intention, habit stacking ve weekly target text alanlarını da doldur.",
      "Ardından metric alanlarını tanımla. Örneğin metric1Label = Okuma, metric1Unit = syf gibi.",
      "Eğer ikinci bir ölçüm kullanmayacaksan metric2 alanlarını boş bırakabilirsin."
    ]
  },
  {
    title: "3. supportsCompletedOnly ve invertScore ne işe yarar?",
    body: [
      "supportsCompletedOnly açıksa bu habit sadece completed bilgisiyle de anlamlı şekilde puanlanabilir.",
      "Bu, örneğin 'bugün yaptım / yapmadım' mantığında takip edilen alışkanlıklar için uygundur.",
      "invertScore açıksa hesaplanan skor ters çevrilir. Sistem bunu 6 - skor olarak uygular.",
      "Bu seçenek genelde düşük değer daha iyi anlamına gelen ölçümlerde kullanılır."
    ]
  },
  {
    title: "4. Rule Builder nasıl kullanılır?",
    body: [
      "Rule Builder, habit için puanlama mantığını oluşturur.",
      "Single metric: Tek metrik üzerinden skor verir. Örneğin 30 dakika üstü = 4, 45 dakika üstü = 5.",
      "Double metric: İki metriği birlikte değerlendirir. Örneğin 20 dakika ve 10 tekrar birlikte sağlanırsa daha yüksek skor verir.",
      "Completed + metric: Önce completed bilgisini kullanır, sonra metrik eşikleriyle skoru yükseltir.",
      "İstersen alttaki gelişmiş ruleJson alanını elle de düzenleyebilirsin."
    ]
  },
  {
    title: "5. Weekly schedule nasıl çalışır?",
    body: [
      "Her habit için haftanın hangi günlerinde takip beklendiğini seçersin.",
      "İşaretli günler planlı gün kabul edilir.",
      "Planlı olmayan günler haftalık tabloda N/A görünür ve yüzde hesabına dahil edilmez.",
      "Bu sayede sadece gerçekten takip etmek istediğin günler performansına etki eder."
    ]
  },
  {
    title: "6. Daily ekranı nasıl kullanılır?",
    body: [
      "Daily ekranında her habit için o habitin metric label ve unit değerlerine uygun input alanları görünür.",
      "Değerleri gir, gerekiyorsa completed işaretle ve not ekle.",
      "Ayrıca 'Takibi tamamladım / puanı girdim' kutusu işaretlenmeden alışkanlık tamamlanmış kabul edilmez.",
      "Ekran kaydetmeden önce tahmini skoru gösterir.",
      "Kaydet butonuna bastığında skor aynı kural motoru ile hesaplanır ve veritabanına yazılır."
    ]
  },
  {
    title: "7. Weekly ekranı ne gösterir?",
    body: [
      "Weekly ekranında satırlar habitleri, kolonlar ise haftanın günlerini gösterir.",
      "Pzt-Paz kolonlarında planlı günlerdeki skor görünür.",
      "Planlı ama veri girilmemiş günler '-' ile gösterilir.",
      "Planlı olmayan günler 'N/A' olarak görünür.",
      "Satır sonunda toplam skor, average ve percent alanları hesaplanır."
    ]
  },
  {
    title: "8. Percent nasıl hesaplanır?",
    body: [
      "Haftalık yüzde formülü: planlı günlerdeki skor toplamı / (planlı gün sayısı x 5) x 100.",
      "Burada 5, bir gün için alınabilecek maksimum skordur.",
      "Planlı olmayan günler bu hesaba girmez.",
      "Hiç planlı gün yoksa yüzde N/A olur."
    ]
  },
  {
    title: "9. Monthly ekranı nasıl okunur?",
    body: [
      "Monthly ekranı, ay içindeki haftaların genel yüzdelerini listeler.",
      "Her kart bir haftayı temsil eder.",
      "Aylık ortalama ise boş olmayan haftalık yüzdelerin aritmetik ortalamasıdır.",
      "Bu ekran günlük detaydan çok genel eğilimi görmek için kullanılır."
    ]
  },
  {
    title: "10. Pratik kullanım önerisi",
    body: [
      "Önce 3-5 habit ile başla. Her habit için gerçekten ölçmek istediğin 1 veya 2 metriği seç.",
      "Rule Builder'ı mümkün olduğunca basit kur. Gerekmedikçe çok karmaşık kural yazma.",
      "Her gün Daily ekranından giriş yap, haftada bir Weekly ekranına bak, ay sonunda Monthly ekranını değerlendir.",
      "Amaç mükemmel veri değil, sürdürülebilir ve anlamlı takip düzeni kurmaktır."
    ]
  },
  {
    title: "11. Takip istifi neden zorunlu?",
    body: [
      "Alışkanlık sadece davranış değil, aynı zamanda sürdürülebilir bir sistemdir.",
      "Takip yapılmazsa alışkanlığın gerçekten kurulup kurulmadığını görmek mümkün olmaz.",
      "Bu yüzden bu sistemde puan girmek ve takibi onaylamak zorunludur.",
      "Tracking onayı olmadan skor düşer ve alışkanlık tamamlandı sayılmaz."
    ]
  }
];

export default function HelpPage() {
  return (
    <section className="space-y-6">
      <div className="max-w-4xl space-y-2">
        <h1 className="font-serif text-4xl font-semibold">Help</h1>
        <p className="text-black/65">
          Bu sayfa sistemi baştan sona nasıl kullanacağını açıklar: habit tanımlama, günlük giriş yapma, skor mantığı ve
          haftalık-aylık raporları okuma.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {sections.map((section) => (
          <Card key={section.title} className="h-full">
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-black/75">
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const sections = [
  {
    title: "1. Bu sistem ne yapar?",
    body: [
      "Bu uygulama, alışkanlıklarını tek tip checkbox mantığıyla değil, her alışkanlığa özel ölçüm mantığıyla takip etmeni sağlar.",
      "Her alışkanlık için en fazla 2 metrik tanımlayabilirsin. Örneğin okuma için 'sayfa' ve 'bölüm', egzersiz için 'dakika' ve 'set' gibi alanlar kullanılır.",
      "İstersen sadece tamamlandı kutusuyla çalışan bir alışkanlık da oluşturabilirsin."
    ]
  },
  {
    title: "2. İlk kurulum nasıl yapılır?",
    body: [
      "Önce Kurulum sayfasına git ve yeni bir alışkanlık oluştur.",
      "Alışkanlık adını yaz. İstersen kimlik cümlesi, uygulamaya koyma niyeti, alışkanlık istifi ve haftalık hedef metni alanlarını da doldur.",
      "Ardından metrik alanlarını tanımla. Örneğin Metrik 1 adı = Okuma, Metrik 1 birimi = syf gibi.",
      "Eğer ikinci bir ölçüm kullanmayacaksan Metrik 2 alanlarını boş bırakabilirsin."
    ]
  },
  {
    title: "3. Sadece tamamlandı ve invertScore ne işe yarar?",
    body: [
      "Sadece tamamlandı seçeneği açıksa bu alışkanlık yalnızca tamamlandı bilgisiyle de anlamlı şekilde puanlanabilir.",
      "Bu, örneğin 'bugün yaptım / yapmadım' mantığında takip edilen alışkanlıklar için uygundur.",
      "invertScore açıksa hesaplanan skor ters çevrilir. Sistem bunu 6 - skor olarak uygular.",
      "Bu seçenek genelde düşük değer daha iyi anlamına gelen ölçümlerde kullanılır."
    ]
  },
  {
    title: "4. Kural oluşturucu nasıl kullanılır?",
    body: [
      "Kural oluşturucu, alışkanlık için puanlama mantığını oluşturur.",
      "Tek metrik: Tek metrik üzerinden skor verir. Örneğin 30 dakika üstü = 4, 45 dakika üstü = 5.",
      "Çift metrik: İki metriği birlikte değerlendirir. Örneğin 20 dakika ve 10 tekrar birlikte sağlanırsa daha yüksek skor verir.",
      "Tamamlandı + metrik: Önce tamamlandı bilgisini kullanır, sonra metrik eşikleriyle skoru yükseltir.",
      "İstersen alttaki gelişmiş ruleJson alanını elle de düzenleyebilirsin."
    ]
  },
  {
    title: "5. Haftalık plan nasıl çalışır?",
    body: [
      "Her alışkanlık için haftanın hangi günlerinde takip beklendiğini seçersin.",
      "İşaretli günler planlı gün kabul edilir.",
      "Planlı olmayan günler haftalık tabloda N/A görünür ve yüzde hesabına dahil edilmez.",
      "Bu sayede sadece gerçekten takip etmek istediğin günler performansına etki eder."
    ]
  },
  {
    title: "6. Daily ekranı nasıl kullanılır?",
    body: [
      "Günlük ekranında her alışkanlık için o alışkanlığın metrik adı ve birimine uygun giriş alanları görünür.",
      "Değerleri gir, gerekiyorsa tamamlandı kutusunu işaretle ve not ekle.",
      "Ayrıca 'Takibi tamamladım / puanı girdim' kutusu işaretlenmeden alışkanlık tamamlanmış kabul edilmez.",
      "Ekran kaydetmeden önce tahmini skoru gösterir.",
      "Kaydet butonuna bastığında skor aynı kural motoru ile hesaplanır ve veritabanına yazılır."
    ]
  },
  {
    title: "7. Weekly ekranı ne gösterir?",
    body: [
      "Haftalık ekranında satırlar alışkanlıkları, kolonlar ise haftanın günlerini gösterir.",
      "Pzt-Paz kolonlarında planlı günlerdeki skor görünür.",
      "Planlı ama veri girilmemiş günler '-' ile gösterilir.",
      "Planlı olmayan günler 'N/A' olarak görünür.",
      "Satır sonunda toplam skor, ortalama ve yüzde alanları hesaplanır."
    ]
  },
  {
    title: "8. Yüzde nasıl hesaplanır?",
    body: [
      "Haftalık yüzde formülü: planlı günlerdeki skor toplamı / (planlı gün sayısı x 5) x 100.",
      "Burada 5, bir gün için alınabilecek maksimum skordur.",
      "Planlı olmayan günler bu hesaba girmez.",
      "Hiç planlı gün yoksa yüzde N/A olur."
    ]
  },
  {
    title: "9. Aylık ekranı nasıl okunur?",
    body: [
      "Aylık ekranı, ay içindeki haftaların genel yüzdelerini listeler.",
      "Her kart bir haftayı temsil eder.",
      "Aylık ortalama ise boş olmayan haftalık yüzdelerin aritmetik ortalamasıdır.",
      "Bu ekran günlük detaydan çok genel eğilimi görmek için kullanılır."
    ]
  },
  {
    title: "10. Pratik kullanım önerisi",
    body: [
      "Önce 3-5 alışkanlık ile başla. Her alışkanlık için gerçekten ölçmek istediğin 1 veya 2 metriği seç.",
      "Kural oluşturucuyu mümkün olduğunca basit kur. Gerekmedikçe çok karmaşık kural yazma.",
      "Her gün Günlük ekranından giriş yap, haftada bir Haftalık ekranına bak, ay sonunda Aylık ekranını değerlendir.",
      "Amaç mükemmel veri değil, sürdürülebilir ve anlamlı takip düzeni kurmaktır."
    ]
  },
  {
    title: "11. Takip istifi neden zorunlu?",
    body: [
      "Alışkanlık sadece davranış değil, aynı zamanda sürdürülebilir bir sistemdir.",
      "Takip yapılmazsa alışkanlığın gerçekten kurulup kurulmadığını görmek mümkün olmaz.",
      "Bu yüzden bu sistemde puan girmek ve takibi onaylamak zorunludur.",
      "Takip onayı olmadan skor düşer ve alışkanlık tamamlandı sayılmaz."
    ]
  }
];

export default function HelpPage() {
  return (
    <section className="space-y-6">
      <div className="max-w-4xl space-y-2">
        <h1 className="font-serif text-4xl font-semibold">Yardım</h1>
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

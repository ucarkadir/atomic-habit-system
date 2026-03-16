export const unitGroups = [
  {
    label: "Zaman",
    options: ["dk", "saat"]
  },
  {
    label: "Sayfa/Okuma",
    options: ["syf", "bölüm"]
  },
  {
    label: "Adet/Üretim",
    options: ["adet", "tekrar", "cümle", "kelime", "soru", "görev", "pomodoro", "set"]
  },
  {
    label: "Sıvı/Beslenme",
    options: ["ml", "litre", "bardak"]
  },
  {
    label: "Mesafe",
    options: ["m", "km"]
  },
  {
    label: "Ağırlık",
    options: ["kg"]
  },
  {
    label: "Enerji",
    options: ["kalori"]
  },
  {
    label: "Finans",
    options: ["₺", "$", "€"]
  },
  {
    label: "İyi oluş",
    options: ["seans", "nefes", "meditasyon"]
  }
] as const;

export const unitOptions = unitGroups.flatMap((group) => group.options);

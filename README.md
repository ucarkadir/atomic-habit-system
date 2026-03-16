# Atomic Habit System

Atomic Habit System, alışkanlıkları sabit checkbox mantığıyla değil, her alışkanlığa özel metrik ve puan kurallarıyla takip etmek için hazırlanmış bir Next.js uygulamasıdır.

## Özellikler

- Her habit için 0..2 metrik tanımı
- Dinamik skor motoru: `and`, `or`, `gte`, `lte`, `eq`, `between`
- `missingHandling`: `score1`, `ignore`, `fail`
- `invertScore` desteği
- Supabase email magic link login
- Prisma + Supabase Postgres veri modeli
- Setup, Daily, Weekly, Monthly ve Help sayfaları
- Kullanıcı bazlı seed habit akışı

## Teknoloji yığını

- Next.js App Router
- TypeScript
- Prisma
- Supabase Auth
- Supabase Postgres
- Tailwind CSS
- shadcn/ui
- Vitest

## Local kurulum

```bash
npm install
cp .env.example .env.local
cp .env.example .env
```

`.env.local` ve `.env` içine şu değerleri gir:

```env
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-...pooler.supabase.com:5432/postgres"
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-...pooler.supabase.com:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[project-ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[legacy-anon-key]"
SUPABASE_SERVICE_ROLE_KEY="[optional]"
```

Notlar:

- Bu repo içinde Prisma CLI `.env` dosyasını okur.
- Next.js uygulaması `.env.local` dosyasını kullanır.
- Bu ortamda Supabase `Session pooler` bağlantısı ile çalışacak şekilde ayar yapıldı.
- `SUPABASE_SERVICE_ROLE_KEY` şu an zorunlu değildir.

## Supabase ayarları

1. Yeni bir Supabase projesi oluştur.
2. `Authentication -> Sign In / Providers` altında `Email` provider açık olsun.
3. `Authentication -> URL Configuration` içinde:
   - `Site URL`: `http://localhost:3000`
   - `Redirect URLs`: `http://localhost:3000/auth/callback`
4. Vercel deploy aldıktan sonra production domain için de `/auth/callback` URL'sini ekle.
5. `Connect` ekranından:
   - `Project URL`
   - `Legacy anon key`
   - `Session pooler` connection string
   değerlerini al.

## Prisma ve veritabanı

```bash
npm run db:generate
npm run db:migrate
```

İstersen örnek veri de yükleyebilirsin:

```bash
npm run db:seed
```

Not:

- Local geliştirmede kullanıcı bazlı seed için giriş yaptıktan sonra `/daily` ekranındaki `Seed habits` butonu da kullanılabilir.

## Geliştirme

```bash
npm run dev
```

Uygulama sayfaları:

- `/setup`
- `/daily`
- `/weekly`
- `/monthly`
- `/help`

## Test ve doğrulama

```bash
npm run test
npx tsc --noEmit
```

## Vercel deploy

1. GitHub repo’yu Vercel’e import et.
2. Framework olarak `Next.js` algılandığını doğrula.
3. Environment Variables olarak şunları ekle:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. `DATABASE_URL` ve `DIRECT_URL` için pooler bağlantısını kullan.
5. İlk deploy’dan sonra Supabase `URL Configuration` içine Vercel domainini ekle.

## Durum

Şu an uygulamada aşağıdaki ana akışlar hazır:

- Setup: habit oluşturma ve rule builder
- Daily: veri girişi ve skor hesaplama
- Weekly: Pzt-Paz tablo görünümü, toplam, average, percent, N/A
- Monthly: haftalık yüzdeler ve aylık özet
- Help: Türkçe kullanım rehberi

## Ana dosyalar

- [prisma/schema.prisma](/Users/kadir/Projects/atomic-habit-system/prisma/schema.prisma)
- [lib/score-engine.ts](/Users/kadir/Projects/atomic-habit-system/lib/score-engine.ts)
- [lib/habits.ts](/Users/kadir/Projects/atomic-habit-system/lib/habits.ts)
- [app/setup/page.tsx](/Users/kadir/Projects/atomic-habit-system/app/setup/page.tsx)
- [app/daily/page.tsx](/Users/kadir/Projects/atomic-habit-system/app/daily/page.tsx)
- [app/weekly/page.tsx](/Users/kadir/Projects/atomic-habit-system/app/weekly/page.tsx)
- [app/monthly/page.tsx](/Users/kadir/Projects/atomic-habit-system/app/monthly/page.tsx)
- [app/help/page.tsx](/Users/kadir/Projects/atomic-habit-system/app/help/page.tsx)

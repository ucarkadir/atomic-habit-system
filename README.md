# Atomic Habit System

Production-ready başlangıç iskeleti: Next.js App Router + TypeScript + TailwindCSS + shadcn/ui + Supabase Auth + Prisma + Supabase Postgres + Vercel.

## Özellikler

- Genel metrik modeli: her habit için 0..2 metrik
- Dinamik skor motoru: `and`, `or`, `gte`, `lte`, `eq`, `between`
- `missingHandling` desteği: `score1`, `ignore`, `fail`
- `invertScore` desteği: `score = 6 - score`
- Supabase email login
- Prisma tabanlı Postgres veri modeli
- Weekly ve monthly yüzde hesapları
- Seed habit seti: Kitap, Egzersiz, İngilizce, Dans, Teknik gelişim
- Vercel için GitHub push -> production deploy, PR -> preview uyumlu yapı

## Proje ağacı

```text
.
├── app
├── components
├── lib
├── prisma
└── tests
```

## Kurulum

```bash
npm install
cp .env.example .env.local
```

`.env.local` içine şu değerleri gir:

```env
DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[project-ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[anon-key]"
SUPABASE_SERVICE_ROLE_KEY="[service-role-key]"
```

## Supabase

1. Yeni Supabase projesi aç.
2. Auth içinde Email provider açık olsun.
3. Redirect URL olarak `http://localhost:3000/auth/callback` ve Vercel domainindeki `/auth/callback` eklenmeli.
4. Database bağlantı bilgilerini `.env.local` içine koy.

## Prisma

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

UI içindeki kullanıcı bazlı seed için giriş yaptıktan sonra `/daily` ekranındaki `Seed habits` butonunu kullan.

## Geliştirme

```bash
npm run dev
```

Sayfalar:

- `/setup`
- `/daily`
- `/weekly`
- `/monthly`
- `/help`

## API

- `POST /api/entries`
- `GET /api/weekly`
- `GET /api/monthly`
- `POST /api/seed`
- `GET /api/habits/:id/rule`
- `GET /api/habits`
- `POST /api/habits`

## Test

```bash
npm run test
```

## Vercel + GitHub deploy

1. GitHub repo oluştur.
2. Repo’yu push et:

```bash
git init
git add .
git commit -m "Initial production scaffold"
git branch -M main
git remote add origin <github-repo-url>
git push -u origin main
```

3. Vercel dashboard içinde repo’yu import et.
4. Environment Variables olarak `.env.local` değerlerini gir.
5. `main` branch push -> production deploy.
6. PR aç -> preview deployment.

## Ana dosyalar

- [Prisma schema](/Users/kadir/Documents/atomic-habit-system/prisma/schema.prisma)
- [Skor motoru](/Users/kadir/Documents/atomic-habit-system/lib/score-engine.ts)
- [Habit servisleri](/Users/kadir/Documents/atomic-habit-system/lib/habits.ts)
- [Setup](/Users/kadir/Documents/atomic-habit-system/app/setup/page.tsx)
- [Daily](/Users/kadir/Documents/atomic-habit-system/app/daily/page.tsx)
- [Weekly](/Users/kadir/Documents/atomic-habit-system/app/weekly/page.tsx)
- [Monthly](/Users/kadir/Documents/atomic-habit-system/app/monthly/page.tsx)
- [Help](/Users/kadir/Documents/atomic-habit-system/app/help/page.tsx)

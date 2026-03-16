import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_USER_ID = "demo-user";

const baseSchedule = Array.from({ length: 7 }, (_, weekday) => ({
  weekday,
  isPlanned: weekday !== 0
}));

const habits: Prisma.HabitCreateInput[] = [
  {
    userId: DEMO_USER_ID,
    habitName: "Kitap",
    identityStatement: "Ben her gun okuyan biriyim.",
    weeklyTargetText: "Haftada 5 gun, en az 30 syf veya 1 bolum",
    metric1Label: "Okuma",
    metric1Unit: "syf",
    metric2Label: "Bolum",
    metric2Unit: "bölüm",
    supportsCompletedOnly: false,
    invertScore: false,
    ruleJson: {
      missingHandling: "score1",
      levels: [
        { score: 1, conditions: { op: "or", conditions: [{ op: "gte", metric: "metric1", value: 1 }, { op: "gte", metric: "metric2", value: 1 }] } },
        { score: 3, conditions: { op: "or", conditions: [{ op: "gte", metric: "metric1", value: 15 }, { op: "gte", metric: "metric2", value: 1 }] } },
        { score: 5, conditions: { op: "or", conditions: [{ op: "gte", metric: "metric1", value: 30 }, { op: "gte", metric: "metric2", value: 2 }] } }
      ]
    },
    schedules: { create: baseSchedule }
  },
  {
    userId: DEMO_USER_ID,
    habitName: "Egzersiz",
    identityStatement: "Ben hareket eden biriyim.",
    weeklyTargetText: "Haftada 4 gun, 30 dk veya 3 set",
    metric1Label: "Sure",
    metric1Unit: "dk",
    metric2Label: "Set",
    metric2Unit: "set",
    supportsCompletedOnly: true,
    invertScore: false,
    ruleJson: {
      missingHandling: "score1",
      levels: [
        { score: 2, conditions: { op: "eq", metric: "completed", value: true } },
        { score: 4, conditions: { op: "or", conditions: [{ op: "gte", metric: "metric1", value: 20 }, { op: "gte", metric: "metric2", value: 2 }] } },
        { score: 5, conditions: { op: "or", conditions: [{ op: "gte", metric: "metric1", value: 30 }, { op: "gte", metric: "metric2", value: 3 }] } }
      ]
    },
    schedules: { create: baseSchedule }
  },
  {
    userId: DEMO_USER_ID,
    habitName: "Ingilizce",
    identityStatement: "Ben her gun yabanci dil kullanan biriyim.",
    weeklyTargetText: "Haftada 5 gun, 20 dk + 10 cumle",
    metric1Label: "Calisma",
    metric1Unit: "dk",
    metric2Label: "Cumle",
    metric2Unit: "cümle",
    supportsCompletedOnly: false,
    invertScore: false,
    ruleJson: {
      missingHandling: "score1",
      levels: [
        { score: 2, conditions: { op: "gte", metric: "metric1", value: 10 } },
        { score: 4, conditions: { op: "and", conditions: [{ op: "gte", metric: "metric1", value: 20 }, { op: "gte", metric: "metric2", value: 10 }] } },
        { score: 5, conditions: { op: "and", conditions: [{ op: "gte", metric: "metric1", value: 30 }, { op: "gte", metric: "metric2", value: 20 }] } }
      ]
    },
    schedules: { create: baseSchedule }
  },
  {
    userId: DEMO_USER_ID,
    habitName: "Dans",
    identityStatement: "Ben ritimle tekrar yapan biriyim.",
    weeklyTargetText: "Haftada 3 gun, 25 dk",
    metric1Label: "Pratik",
    metric1Unit: "dk",
    metric2Label: null,
    metric2Unit: null,
    supportsCompletedOnly: true,
    invertScore: false,
    ruleJson: {
      missingHandling: "score1",
      levels: [
        { score: 2, conditions: { op: "eq", metric: "completed", value: true } },
        { score: 4, conditions: { op: "gte", metric: "metric1", value: 15 } },
        { score: 5, conditions: { op: "gte", metric: "metric1", value: 25 } }
      ]
    },
    schedules: { create: baseSchedule }
  },
  {
    userId: DEMO_USER_ID,
    habitName: "Teknik gelisim",
    identityStatement: "Ben her gun sistematik ogrenen biriyim.",
    weeklyTargetText: "Haftada 5 gun, 45 dk veya 2 pomodoro",
    metric1Label: "Derin calisma",
    metric1Unit: "dk",
    metric2Label: "Pomodoro",
    metric2Unit: "pomodoro",
    supportsCompletedOnly: false,
    invertScore: false,
    ruleJson: {
      missingHandling: "score1",
      levels: [
        { score: 2, conditions: { op: "or", conditions: [{ op: "gte", metric: "metric1", value: 15 }, { op: "gte", metric: "metric2", value: 1 }] } },
        { score: 4, conditions: { op: "or", conditions: [{ op: "gte", metric: "metric1", value: 30 }, { op: "gte", metric: "metric2", value: 2 }] } },
        { score: 5, conditions: { op: "gte", metric: "metric1", value: 45 } }
      ]
    },
    schedules: { create: baseSchedule }
  }
];

async function main() {
  await prisma.dailyEntry.deleteMany({ where: { userId: DEMO_USER_ID } });
  await prisma.habitSchedule.deleteMany({
    where: { habit: { userId: DEMO_USER_ID } }
  });
  await prisma.habit.deleteMany({ where: { userId: DEMO_USER_ID } });

  for (const habit of habits) {
    await prisma.habit.create({ data: habit });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

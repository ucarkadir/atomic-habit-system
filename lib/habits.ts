import { Habit, Prisma } from "@prisma/client";
import { endOfWeek, formatISO, startOfWeek } from "date-fns";

import { prisma } from "@/lib/prisma";
import { calculateScore } from "@/lib/score-engine";
import { dateKey, enumerateDays, getMonthWindow, getWeekWindow, normalizeDate } from "@/lib/date";
import { HabitRule, MonthlySummary, WeeklyHabitStats } from "@/lib/types";

export async function listHabits(userId: string) {
  return prisma.habit.findMany({
    where: { userId },
    include: {
      schedules: true
    },
    orderBy: { createdAt: "asc" }
  });
}

export async function upsertHabit(
  userId: string,
  data: Omit<Prisma.HabitUncheckedCreateInput, "userId" | "createdAt"> & {
    schedules: Array<{ weekday: number; isPlanned: boolean }>;
  }
) {
  const payload = {
    habitName: data.habitName,
    identityStatement: data.identityStatement || null,
    implementationIntention: data.implementationIntention || null,
    habitStacking: data.habitStacking || null,
    trackingStacking: data.trackingStacking || null,
    weeklyTargetText: data.weeklyTargetText || null,
    metric1Label: data.metric1Label || null,
    metric1Unit: data.metric1Unit || null,
    metric2Label: data.metric2Label || null,
    metric2Unit: data.metric2Unit || null,
    supportsCompletedOnly: data.supportsCompletedOnly,
    invertScore: data.invertScore,
    ruleJson: data.ruleJson
  };

  if (data.id) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.habit.findFirst({
        where: { id: data.id, userId },
        select: { id: true }
      });

      if (!existing) {
        throw new Error("Habit not found");
      }

      const habit = await tx.habit.update({
        where: { id: data.id },
        data: payload
      });

      await tx.habitSchedule.deleteMany({ where: { habitId: habit.id } });
      await tx.habitSchedule.createMany({
        data: data.schedules.map((schedule) => ({ habitId: habit.id, ...schedule }))
      });

      return habit;
    });
  }

  return prisma.habit.create({
    data: {
      userId,
      ...payload,
      schedules: {
        createMany: {
          data: data.schedules
        }
      }
    }
  });
}

export async function createOrUpdateEntry(
  userId: string,
  input: {
    habitId: string;
    date: string;
    metric1Value?: number | null;
    metric2Value?: number | null;
    completed?: boolean;
    notes?: string | null;
  }
) {
  const habit = await prisma.habit.findFirst({
    where: { id: input.habitId, userId }
  });

  if (!habit) {
    throw new Error("Habit not found");
  }

  const score = calculateScore(habit.ruleJson as HabitRule, input, habit.invertScore);
  const date = normalizeDate(input.date);

  return prisma.dailyEntry.upsert({
    where: {
      userId_habitId_date: {
        userId,
        habitId: input.habitId,
        date
      }
    },
    create: {
      userId,
      habitId: input.habitId,
      date,
      metric1Value: input.metric1Value ?? null,
      metric2Value: input.metric2Value ?? null,
      completed: input.completed ?? false,
      notes: input.notes ?? null,
      score
    },
    update: {
      metric1Value: input.metric1Value ?? null,
      metric2Value: input.metric2Value ?? null,
      completed: input.completed ?? false,
      notes: input.notes ?? null,
      score
    }
  });
}

export async function getHabitRule(userId: string, habitId: string) {
  return prisma.habit.findFirst({
    where: { id: habitId, userId },
    select: {
      id: true,
      habitName: true,
      invertScore: true,
      ruleJson: true
    }
  });
}

export async function getDailyData(userId: string, date = new Date()) {
  const normalized = normalizeDate(date);
  const habits = await prisma.habit.findMany({
    where: { userId },
    include: {
      schedules: true,
      entries: {
        where: { date: normalized }
      }
    },
    orderBy: { createdAt: "asc" }
  });

  return {
    date: formatISO(normalized, { representation: "date" }),
    habits
  };
}

export async function getWeeklyData(userId: string, anchor = new Date()): Promise<WeeklyHabitStats[]> {
  const { start, end } = getWeekWindow(anchor);
  const habits = await prisma.habit.findMany({
    where: { userId },
    include: {
      schedules: true,
      entries: {
        where: {
          date: {
            gte: start,
            lte: end
          }
        }
      }
    },
    orderBy: { createdAt: "asc" }
  });

  return habits.map((habit) => {
    const scheduleByWeekday = new Map(habit.schedules.map((item) => [item.weekday, item.isPlanned]));
    const entriesByDate = new Map(habit.entries.map((entry) => [dateKey(entry.date), entry]));
    const weekdays = enumerateDays(start, end).map((day) => {
      const dayKey = dateKey(day);
      const entry = entriesByDate.get(dayKey);
      return {
        weekday: day.getDay(),
        planned: scheduleByWeekday.get(day.getDay()) ?? false,
        date: dayKey,
        score: entry?.score ?? null,
        metric1Value: entry?.metric1Value ?? null,
        metric2Value: entry?.metric2Value ?? null,
        completed: entry?.completed ?? null
      };
    });

    const plannedDays = weekdays.filter((day) => day.planned);
    const filledDays = plannedDays.filter((day) => day.score !== null).length;
    const scores = plannedDays.flatMap((day) => (day.score === null ? [] : [day.score]));
    const sum = scores.length ? scores.reduce((acc, value) => acc + value, 0) : null;
    const avg = scores.length ? Number((sum! / scores.length).toFixed(2)) : null;
    const percent =
      plannedDays.length > 0
        ? Number((((scores.reduce((acc, value) => acc + value, 0) / (plannedDays.length * 5)) * 100) || 0).toFixed(1))
        : null;

    return {
      habitId: habit.id,
      habitName: habit.habitName,
      weekdays,
      filledDays,
      plannedDays: plannedDays.length,
      sum,
      avg,
      percent
    };
  });
}

export async function getMonthlyData(userId: string, anchor = new Date()): Promise<MonthlySummary> {
  const { start, end } = getMonthWindow(anchor);
  const habits = await prisma.habit.findMany({
    where: { userId },
    include: {
      schedules: true,
      entries: {
        where: {
          date: {
            gte: start,
            lte: end
          }
        }
      }
    }
  });

  const weekStarts = new Set<string>();
  enumerateDays(start, end).forEach((day) => {
    weekStarts.add(dateKey(startOfWeek(day, { weekStartsOn: 1 })));
  });

  const weeklyPercents = [...weekStarts]
    .sort()
    .map((weekStartKey) => {
      const weekStart = new Date(weekStartKey);
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      const habitPercents = habits.flatMap((habit) => {
        const scheduleByWeekday = new Map(habit.schedules.map((item) => [item.weekday, item.isPlanned]));
        const weekDays = enumerateDays(weekStart, weekEnd).filter((day) => day >= start && day <= end);
        const planned = weekDays.filter((day) => scheduleByWeekday.get(day.getDay()) ?? false);
        if (!planned.length) return [];

        const scoreMap = new Map(habit.entries.map((entry) => [dateKey(entry.date), entry.score]));
        const scoreSum = planned.reduce((acc, day) => acc + (scoreMap.get(dateKey(day)) ?? 0), 0);
        return [(scoreSum / (planned.length * 5)) * 100];
      });

      return {
        weekStart: weekStartKey,
        weekEnd: dateKey(weekEnd),
        percent: habitPercents.length
          ? Number((habitPercents.reduce((acc, value) => acc + value, 0) / habitPercents.length).toFixed(1))
          : null
      };
    });

  const validWeekly = weeklyPercents.flatMap((item) => (item.percent === null ? [] : [item.percent]));

  return {
    weeklyPercents,
    monthlyAverage: validWeekly.length
      ? Number((validWeekly.reduce((acc, value) => acc + value, 0) / validWeekly.length).toFixed(1))
      : null
  };
}

export async function seedHabitsForUser(userId: string) {
  const existing = await prisma.habit.count({ where: { userId } });
  if (existing > 0) {
    return { created: 0, skipped: true };
  }

  const seedPayload: Array<
    Omit<Habit, "id" | "createdAt"> & {
      schedules: Array<{ weekday: number; isPlanned: boolean }>;
    }
  > = [
    {
      userId,
      habitName: "Kitap",
      identityStatement: "Ben her gun okuyan biriyim.",
      implementationIntention: "Aksam 21:30'da kitap acacagim.",
      habitStacking: "Caydan sonra kitap",
      trackingStacking: "Okuma bitince kayit",
      weeklyTargetText: "Haftada 5 gun, 30 syf veya 1 bolum",
      metric1Label: "Okuma",
      metric1Unit: "syf",
      metric2Label: "Bolum",
      metric2Unit: "bölüm",
      supportsCompletedOnly: false,
      invertScore: false,
      ruleJson: {
        missingHandling: "score1",
        levels: [
          { score: 2, conditions: { op: "gte", metric: "metric1", value: 10 } },
          { score: 4, conditions: { op: "or", conditions: [{ op: "gte", metric: "metric1", value: 20 }, { op: "gte", metric: "metric2", value: 1 }] } },
          { score: 5, conditions: { op: "gte", metric: "metric1", value: 30 } }
        ]
      } as Prisma.JsonObject,
      schedules: [
        { weekday: 0, isPlanned: false },
        { weekday: 1, isPlanned: true },
        { weekday: 2, isPlanned: true },
        { weekday: 3, isPlanned: true },
        { weekday: 4, isPlanned: true },
        { weekday: 5, isPlanned: true },
        { weekday: 6, isPlanned: false }
      ]
    },
    {
      userId,
      habitName: "Egzersiz",
      identityStatement: "Ben hareket eden biriyim.",
      implementationIntention: "Sabah 07:00'de ısınacağım.",
      habitStacking: "Su icince hareket",
      trackingStacking: "Antrenman bitince kayit",
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
          { score: 4, conditions: { op: "gte", metric: "metric1", value: 20 } },
          { score: 5, conditions: { op: "or", conditions: [{ op: "gte", metric: "metric1", value: 30 }, { op: "gte", metric: "metric2", value: 3 }] } }
        ]
      } as Prisma.JsonObject,
      schedules: [
        { weekday: 0, isPlanned: false },
        { weekday: 1, isPlanned: true },
        { weekday: 2, isPlanned: false },
        { weekday: 3, isPlanned: true },
        { weekday: 4, isPlanned: false },
        { weekday: 5, isPlanned: true },
        { weekday: 6, isPlanned: true }
      ]
    },
    {
      userId,
      habitName: "Ingilizce",
      identityStatement: "Ben her gun yabanci dil kullanan biriyim.",
      implementationIntention: "Oglen 13:00'te 20 dk calisacağım.",
      habitStacking: "Kahveden sonra İngilizce",
      trackingStacking: "Session biter bitmez kayit",
      weeklyTargetText: "Haftada 5 gun, 20 dk + 10 cümle",
      metric1Label: "Calisma",
      metric1Unit: "dk",
      metric2Label: "Cumle",
      metric2Unit: "cümle",
      supportsCompletedOnly: false,
      invertScore: false,
      ruleJson: {
        missingHandling: "fail",
        levels: [
          { score: 3, conditions: { op: "and", conditions: [{ op: "gte", metric: "metric1", value: 20 }, { op: "gte", metric: "metric2", value: 10 }] } },
          { score: 5, conditions: { op: "and", conditions: [{ op: "gte", metric: "metric1", value: 30 }, { op: "gte", metric: "metric2", value: 20 }] } }
        ]
      } as Prisma.JsonObject,
      schedules: [
        { weekday: 0, isPlanned: false },
        { weekday: 1, isPlanned: true },
        { weekday: 2, isPlanned: true },
        { weekday: 3, isPlanned: true },
        { weekday: 4, isPlanned: true },
        { weekday: 5, isPlanned: true },
        { weekday: 6, isPlanned: false }
      ]
    },
    {
      userId,
      habitName: "Dans",
      identityStatement: "Ben tekrar ederek ilerleyen biriyim.",
      implementationIntention: "Aksam 20:00'de pratik yapacağım.",
      habitStacking: "Muzik acinca dans",
      trackingStacking: "Pratik sonrası kayit",
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
      } as Prisma.JsonObject,
      schedules: [
        { weekday: 0, isPlanned: false },
        { weekday: 1, isPlanned: false },
        { weekday: 2, isPlanned: true },
        { weekday: 3, isPlanned: false },
        { weekday: 4, isPlanned: true },
        { weekday: 5, isPlanned: false },
        { weekday: 6, isPlanned: true }
      ]
    },
    {
      userId,
      habitName: "Teknik gelişim",
      identityStatement: "Ben her gun teknik kapasite inşa eden biriyim.",
      implementationIntention: "Sabah ilk blokta 45 dk calisacağım.",
      habitStacking: "Masa basina oturunca derin calisma",
      trackingStacking: "Pomodoro bittiğinde kayıt",
      weeklyTargetText: "Haftada 5 gun, 45 dk veya 2 pomodoro",
      metric1Label: "Derin çalisma",
      metric1Unit: "dk",
      metric2Label: "Pomodoro",
      metric2Unit: "pomodoro",
      supportsCompletedOnly: false,
      invertScore: false,
      ruleJson: {
        missingHandling: "ignore",
        levels: [
          { score: 2, conditions: { op: "gte", metric: "metric1", value: 15 } },
          { score: 4, conditions: { op: "or", conditions: [{ op: "gte", metric: "metric1", value: 30 }, { op: "gte", metric: "metric2", value: 2 }] } },
          { score: 5, conditions: { op: "gte", metric: "metric1", value: 45 } }
        ]
      } as Prisma.JsonObject,
      schedules: [
        { weekday: 0, isPlanned: false },
        { weekday: 1, isPlanned: true },
        { weekday: 2, isPlanned: true },
        { weekday: 3, isPlanned: true },
        { weekday: 4, isPlanned: true },
        { weekday: 5, isPlanned: true },
        { weekday: 6, isPlanned: false }
      ]
    }
  ];

  await prisma.$transaction(async (tx) => {
    for (const habit of seedPayload) {
      const { schedules, ...habitData } = habit;
      const created = await tx.habit.create({
        data: {
          ...habitData,
          ruleJson: habitData.ruleJson as Prisma.InputJsonValue
        }
      });
      await tx.habitSchedule.createMany({
        data: schedules.map((schedule) => ({
          habitId: created.id,
          ...schedule
        }))
      });
    }
  });

  return { created: seedPayload.length, skipped: false };
}

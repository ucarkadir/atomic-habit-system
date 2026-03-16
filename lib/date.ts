import {
  addDays,
  endOfMonth,
  endOfWeek,
  formatISO,
  startOfDay,
  startOfMonth,
  startOfWeek
} from "date-fns";

export function normalizeDate(input: string | Date) {
  return startOfDay(
    typeof input === "string" ? new Date(`${input}T00:00:00`) : input
  );
}

export function getWeekWindow(anchor = new Date()) {
  const start = startOfWeek(anchor, { weekStartsOn: 1 });
  const end = endOfWeek(anchor, { weekStartsOn: 1 });
  return { start, end };
}

export function getMonthWindow(anchor = new Date()) {
  const start = startOfMonth(anchor);
  const end = endOfMonth(anchor);
  return { start, end };
}

export function enumerateDays(start: Date, end: Date) {
  const days: Date[] = [];
  let current = startOfDay(start);

  while (current <= end) {
    days.push(current);
    current = addDays(current, 1);
  }

  return days;
}

export function dateKey(date: Date) {
  return formatISO(startOfDay(date), { representation: "date" });
}

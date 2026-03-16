export type MetricKey = "metric1" | "metric2" | "completed";

export type ComparisonCondition =
  | { op: "gte" | "lte" | "eq"; metric: MetricKey; value: number | boolean }
  | { op: "between"; metric: MetricKey; min: number; max: number };

export type GroupCondition = {
  op: "and" | "or";
  conditions: RuleCondition[];
};

export type RuleCondition = ComparisonCondition | GroupCondition;

export type ScoreLevel = {
  score: 1 | 2 | 3 | 4 | 5;
  conditions: RuleCondition;
};

export type MissingHandling = "score1" | "ignore" | "fail";

export type HabitRule = {
  missingHandling?: MissingHandling;
  levels: ScoreLevel[];
};

export type ScoreInput = {
  metric1Value?: number | null;
  metric2Value?: number | null;
  completed?: boolean | null;
};

export type WeeklyHabitStats = {
  habitId: string;
  habitName: string;
  weekdays: Array<{
    weekday: number;
    planned: boolean;
    date: string;
    score: number | null;
    metric1Value: number | null;
    metric2Value: number | null;
    completed: boolean | null;
  }>;
  filledDays: number;
  plannedDays: number;
  sum: number | null;
  avg: number | null;
  percent: number | null;
};

export type MonthlySummary = {
  weeklyPercents: Array<{
    weekStart: string;
    weekEnd: string;
    percent: number | null;
  }>;
  monthlyAverage: number | null;
};

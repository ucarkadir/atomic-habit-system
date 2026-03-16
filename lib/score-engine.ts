import { HabitRule, RuleCondition, ScoreInput } from "@/lib/types";

function isMissingValue(value: number | boolean | null | undefined) {
  return value === null || value === undefined || value === "";
}

function getMetricValue(metric: "metric1" | "metric2" | "completed", input: ScoreInput) {
  if (metric === "metric1") return input.metric1Value;
  if (metric === "metric2") return input.metric2Value;
  return input.completed;
}

function hasMissingMetrics(condition: RuleCondition, input: ScoreInput): boolean {
  if (condition.op === "and" || condition.op === "or") {
    return condition.conditions.some((nested) => hasMissingMetrics(nested, input));
  }

  return isMissingValue(getMetricValue(condition.metric, input));
}

function evaluateCondition(condition: RuleCondition, input: ScoreInput): boolean {
  if (condition.op === "and") {
    return condition.conditions.every((nested) => evaluateCondition(nested, input));
  }

  if (condition.op === "or") {
    return condition.conditions.some((nested) => evaluateCondition(nested, input));
  }

  const actual = getMetricValue(condition.metric, input);

  if (actual === null || actual === undefined) {
    return false;
  }

  if (condition.op === "between") {
    if (typeof actual !== "number") {
      return false;
    }

    return actual >= condition.min && actual <= condition.max;
  }

  if (condition.op === "eq") {
    return actual === condition.value;
  }

  if (typeof actual !== "number" || typeof condition.value !== "number") {
    return false;
  }

  return condition.op === "gte" ? actual >= condition.value : actual <= condition.value;
}

export function calculateScore(rule: HabitRule, input: ScoreInput, invertScore = false) {
  const missingHandling = rule.missingHandling ?? "score1";
  let score = 1;

  for (const level of [...rule.levels].sort((a, b) => a.score - b.score)) {
    if (hasMissingMetrics(level.conditions, input)) {
      if (missingHandling === "fail") {
        continue;
      }

      if (missingHandling === "score1") {
        continue;
      }
    }

    if (evaluateCondition(level.conditions, input)) {
      score = level.score;
    }
  }

  if (invertScore) {
    return 6 - score;
  }

  return score;
}

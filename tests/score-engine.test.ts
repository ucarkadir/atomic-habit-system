import { describe, expect, it } from "vitest";

import { calculateScore } from "@/lib/score-engine";
import { HabitRule } from "@/lib/types";

describe("calculateScore", () => {
  it("handles a single metric threshold", () => {
    const rule: HabitRule = {
      levels: [
        { score: 3, conditions: { op: "gte", metric: "metric1", value: 20 } },
        { score: 5, conditions: { op: "gte", metric: "metric1", value: 45 } }
      ]
    };

    expect(calculateScore(rule, { metric1Value: 10 })).toBe(1);
    expect(calculateScore(rule, { metric1Value: 20 })).toBe(3);
    expect(calculateScore(rule, { metric1Value: 50 })).toBe(5);
  });

  it("handles combined metrics with and/or", () => {
    const rule: HabitRule = {
      levels: [
        {
          score: 4,
          conditions: {
            op: "and",
            conditions: [
              { op: "gte", metric: "metric1", value: 30 },
              { op: "gte", metric: "metric2", value: 10 }
            ]
          }
        },
        {
          score: 5,
          conditions: {
            op: "or",
            conditions: [
              { op: "gte", metric: "metric1", value: 45 },
              {
                op: "and",
                conditions: [
                  { op: "gte", metric: "metric1", value: 30 },
                  { op: "gte", metric: "metric2", value: 20 }
                ]
              }
            ]
          }
        }
      ]
    };

    expect(calculateScore(rule, { metric1Value: 30, metric2Value: 10 })).toBe(4);
    expect(calculateScore(rule, { metric1Value: 30, metric2Value: 20 })).toBe(5);
    expect(calculateScore(rule, { metric1Value: 45, metric2Value: 0 })).toBe(5);
  });

  it("supports completed-only rules", () => {
    const rule: HabitRule = {
      levels: [
        { score: 2, conditions: { op: "eq", metric: "completed", value: true } }
      ]
    };

    expect(calculateScore(rule, { completed: false })).toBe(1);
    expect(calculateScore(rule, { completed: true })).toBe(2);
  });

  it("supports between and invert score", () => {
    const rule: HabitRule = {
      levels: [
        { score: 4, conditions: { op: "between", metric: "metric1", min: 7, max: 9 } }
      ]
    };

    expect(calculateScore(rule, { metric1Value: 8 }, true)).toBe(2);
  });

  it("respects missingHandling fail", () => {
    const rule: HabitRule = {
      missingHandling: "fail",
      levels: [
        {
          score: 5,
          conditions: {
            op: "and",
            conditions: [
              { op: "gte", metric: "metric1", value: 30 },
              { op: "gte", metric: "metric2", value: 10 }
            ]
          }
        }
      ]
    };

    expect(calculateScore(rule, { metric1Value: 30 })).toBe(1);
  });

  it("drops score when tracking is required but not confirmed", () => {
    const rule: HabitRule = {
      requireTracking: true,
      trackingFailureScore: 0,
      levels: [{ score: 5, conditions: { op: "gte", metric: "metric1", value: 30 } }]
    };

    expect(calculateScore(rule, { metric1Value: 40, trackingConfirmed: false })).toBe(0);
  });

  it("returns to normal score when tracking is confirmed", () => {
    const rule: HabitRule = {
      requireTracking: true,
      trackingFailureScore: 1,
      levels: [{ score: 5, conditions: { op: "gte", metric: "metric1", value: 30 } }]
    };

    expect(calculateScore(rule, { metric1Value: 40, trackingConfirmed: true })).toBe(5);
  });

  it("does not treat completed as true when tracking is not confirmed", () => {
    const rule: HabitRule = {
      levels: [{ score: 3, conditions: { op: "eq", metric: "completed", value: true } }]
    };

    expect(calculateScore(rule, { completed: true, trackingConfirmed: false })).toBe(1);
  });
});

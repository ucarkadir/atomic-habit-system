import { z } from "zod";

const metricRefSchema = z.enum(["metric1", "metric2", "completed"]);

const comparisonSchema = z.discriminatedUnion("op", [
  z.object({
    op: z.enum(["gte", "lte"]),
    metric: metricRefSchema,
    value: z.number()
  }),
  z.object({
    op: z.literal("eq"),
    metric: metricRefSchema,
    value: z.union([z.number(), z.boolean()])
  }),
  z.object({
    op: z.literal("between"),
    metric: metricRefSchema,
    min: z.number(),
    max: z.number()
  })
]);

const ruleConditionSchema: z.ZodTypeAny = z.lazy(() =>
  z.union([
    comparisonSchema,
    z.object({
      op: z.enum(["and", "or"]),
      conditions: z.array(ruleConditionSchema).min(1)
    })
  ])
);

export const habitRuleSchema = z.object({
  missingHandling: z.enum(["score1", "ignore", "fail"]).optional(),
  requireTracking: z.boolean().optional(),
  trackingFailureScore: z.union([z.literal(0), z.literal(1)]).optional(),
  levels: z
    .array(
      z.object({
        score: z.number().int().min(1).max(5),
        conditions: ruleConditionSchema
      })
    )
    .min(1)
});

export const habitPayloadSchema = z.object({
  id: z.string().optional(),
  habitName: z.string().min(1),
  identityStatement: z.string().optional().nullable(),
  implementationIntention: z.string().default(""),
  habitStacking: z.string().default(""),
  trackingStacking: z.string().min(1).default("Manuel takip"),
  weeklyTargetText: z.string().optional().nullable(),
  metric1Label: z.string().optional().nullable(),
  metric1Unit: z.string().optional().nullable(),
  metric2Label: z.string().optional().nullable(),
  metric2Unit: z.string().optional().nullable(),
  supportsCompletedOnly: z.boolean().default(false),
  invertScore: z.boolean().default(false),
  ruleJson: z.union([habitRuleSchema, z.string()]),
  schedules: z
    .array(
      z.object({
        weekday: z.number().int().min(0).max(6),
        isPlanned: z.boolean()
      })
    )
    .length(7)
});

export const dailyEntryPayloadSchema = z.object({
  habitId: z.string().min(1),
  date: z.string().min(1),
  metric1Value: z.number().nullable().optional(),
  metric2Value: z.number().nullable().optional(),
  completed: z.boolean().default(false),
  trackingConfirmed: z.boolean().default(false),
  notes: z.string().optional().nullable()
});

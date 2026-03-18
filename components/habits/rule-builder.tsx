"use client";

import { useEffect, useState } from "react";

import { HabitRule, MetricKey, RuleCondition } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type RuleBuilderProps = {
  value: string;
  onChange: (value: string) => void;
  metric1Label?: string | null;
  metric1Unit?: string | null;
  metric2Label?: string | null;
  metric2Unit?: string | null;
  supportsCompletedOnly: boolean;
};

type BuilderMode = "single" | "double" | "completed";

type ThresholdCondition = {
  metric: "metric1" | "metric2";
  value: number;
};

function getThresholdCondition(condition: RuleCondition): ThresholdCondition | null {
  if ((condition.op === "gte" || condition.op === "lte") && condition.metric !== "completed") {
    return {
      metric: condition.metric,
      value: condition.value as number
    };
  }

  return null;
}

function describeMetric(label?: string | null, unit?: string | null, fallback?: string) {
  const resolvedLabel = label?.trim() || fallback || "Metric";
  const resolvedUnit = unit?.trim();
  return resolvedUnit ? `${resolvedLabel} (${resolvedUnit})` : resolvedLabel;
}

export function RuleBuilder({
  value,
  onChange,
  metric1Label,
  metric1Unit,
  metric2Label,
  metric2Unit,
  supportsCompletedOnly
}: RuleBuilderProps) {
  const [mode, setMode] = useState<BuilderMode>("single");
  const [score4Metric, setScore4Metric] = useState("metric1");
  const [score4Value, setScore4Value] = useState("30");
  const [score5Metric, setScore5Metric] = useState("metric1");
  const [score5Value, setScore5Value] = useState("45");
  const [secondMetricValue, setSecondMetricValue] = useState("10");
  const [missingHandling, setMissingHandling] = useState<"score1" | "ignore" | "fail">("score1");
  const [requireTracking, setRequireTracking] = useState(true);
  const [trackingFailureScore, setTrackingFailureScore] = useState<0 | 1>(1);
  const hasMetric2 = Boolean(metric2Label?.trim());
  const metric1Name = describeMetric(metric1Label, metric1Unit, "Metric 1");
  const metric2Name = describeMetric(metric2Label, metric2Unit, "Metric 2");

  useEffect(() => {
    if (!hasMetric2 && (score4Metric === "metric2" || score5Metric === "metric2")) {
      setScore4Metric("metric1");
      setScore5Metric("metric1");
      setMode(supportsCompletedOnly ? "completed" : "single");
    }
  }, [hasMetric2, score4Metric, score5Metric, supportsCompletedOnly]);

  useEffect(() => {
    if (!supportsCompletedOnly && mode === "completed") {
      setMode(hasMetric2 ? "double" : "single");
    }
  }, [hasMetric2, mode, supportsCompletedOnly]);

  useEffect(() => {
    if (!value) {
      onChange(
        JSON.stringify(
          {
            missingHandling: "score1",
            levels: [
              { score: 4, conditions: { op: "gte", metric: "metric1", value: 30 } },
              { score: 5, conditions: { op: "gte", metric: "metric1", value: 45 } }
            ]
          },
          null,
          2
        )
      );
    }
  }, [onChange, value]);

  useEffect(() => {
    if (!value) {
      return;
    }

    try {
      const rule = JSON.parse(value) as HabitRule;
      setMissingHandling(rule.missingHandling ?? "score1");
      setRequireTracking(rule.requireTracking ?? true);
      setTrackingFailureScore(rule.trackingFailureScore ?? 1);

      const completedLevel = rule.levels.find((level) => level.score === 2);
      const firstLevel = rule.levels.find((level) => level.score === 4);
      const secondLevel = rule.levels.find((level) => level.score === 5);

      if (
        completedLevel?.conditions.op === "eq" &&
        completedLevel.conditions.metric === "completed" &&
        completedLevel.conditions.value === true
      ) {
        setMode("completed");
        const score4Condition =
          firstLevel && firstLevel.conditions.op === "gte" ? getThresholdCondition(firstLevel.conditions) : null;
        const score5Condition =
          secondLevel && secondLevel.conditions.op === "gte" ? getThresholdCondition(secondLevel.conditions) : null;

        if (score4Condition) {
          setScore4Value(String(score4Condition.value));
        }

        if (score5Condition) {
          setScore5Value(String(score5Condition.value));
        }
        return;
      }

      if (
        firstLevel?.conditions.op === "and" &&
        firstLevel.conditions.conditions.length === 2 &&
        secondLevel?.conditions.op === "or"
      ) {
        const firstThreshold = getThresholdCondition(firstLevel.conditions.conditions[0]);
        const secondThreshold = getThresholdCondition(firstLevel.conditions.conditions[1]);
        const score5Primary = getThresholdCondition(secondLevel.conditions.conditions[0]);

        if (firstThreshold && secondThreshold && score5Primary) {
          setMode("double");
          setScore4Metric(firstThreshold.metric);
          setScore4Value(String(firstThreshold.value));
          setScore5Metric(score5Primary.metric);
          setScore5Value(String(score5Primary.value));
          setSecondMetricValue(String(secondThreshold.value));
          return;
        }
      }

      if (firstLevel?.conditions.op === "gte" && secondLevel?.conditions.op === "gte") {
        const score4Condition = getThresholdCondition(firstLevel.conditions);
        const score5Condition = getThresholdCondition(secondLevel.conditions);

        if (score4Condition && score5Condition) {
          setMode("single");
          setScore4Metric(score4Condition.metric);
          setScore4Value(String(score4Condition.value));
          setScore5Metric(score5Condition.metric);
          setScore5Value(String(score5Condition.value));
        }
      }
    } catch {
      // Keep manual JSON edits intact when the preset parser cannot infer the structure.
    }
  }, [value]);

  function applyPreset() {
    let rule: HabitRule;

    if (mode === "completed") {
      rule = {
        missingHandling,
        requireTracking,
        trackingFailureScore,
        levels: [
          { score: 2, conditions: { op: "eq", metric: "completed", value: true } },
          { score: 4, conditions: { op: "gte", metric: "metric1", value: Number(score4Value) || 0 } },
          { score: 5, conditions: { op: "gte", metric: "metric1", value: Number(score5Value) || 0 } }
        ]
      };
    } else if (mode === "double") {
      rule = {
        missingHandling,
        requireTracking,
        trackingFailureScore,
        levels: [
          {
            score: 4,
            conditions: {
              op: "and",
              conditions: [
                { op: "gte", metric: score4Metric as "metric1" | "metric2", value: Number(score4Value) || 0 },
                { op: "gte", metric: "metric2", value: Number(secondMetricValue) || 0 }
              ]
            }
          },
          {
            score: 5,
            conditions: {
              op: "or",
              conditions: [
                { op: "gte", metric: score5Metric as "metric1" | "metric2", value: Number(score5Value) || 0 },
                {
                  op: "and",
                  conditions: [
                    { op: "gte", metric: "metric1", value: Number(score4Value) || 0 },
                    { op: "gte", metric: "metric2", value: Number(secondMetricValue) || 0 }
                  ]
                }
              ]
            }
          }
        ]
      };
    } else {
      rule = {
        missingHandling,
        requireTracking,
        trackingFailureScore,
        levels: [
          { score: 4, conditions: { op: "gte", metric: score4Metric as "metric1" | "metric2", value: Number(score4Value) || 0 } },
          { score: 5, conditions: { op: "gte", metric: score5Metric as "metric1" | "metric2", value: Number(score5Value) || 0 } }
        ]
      };
    }

    onChange(JSON.stringify(rule, null, 2));
  }

  return (
    <div className="space-y-4 rounded-2xl border border-dashed p-4">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="space-y-2">
          <Label>Preset</Label>
          <Select value={mode} onValueChange={(next: BuilderMode) => setMode(next)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single metric</SelectItem>
              {hasMetric2 ? <SelectItem value="double">Double metric</SelectItem> : null}
              {supportsCompletedOnly ? <SelectItem value="completed">Completed + metric</SelectItem> : null}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Missing</Label>
          <Select
            value={missingHandling}
            onValueChange={(next: "score1" | "ignore" | "fail") => setMissingHandling(next)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="score1">score1</SelectItem>
              <SelectItem value="ignore">ignore</SelectItem>
              <SelectItem value="fail">fail</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Score 4 threshold</Label>
          <Input value={score4Value} onChange={(event) => setScore4Value(event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Score 5 threshold</Label>
          <Input value={score5Value} onChange={(event) => setScore5Value(event.target.value)} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex items-center gap-3 rounded-2xl border p-4">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={requireTracking}
            onChange={(event) => setRequireTracking(event.target.checked)}
          />
          <div>
            <div className="font-medium">requireTracking</div>
            <div className="text-sm text-black/55">Tracking onayi gelmeden skor normal hesaplanmasin.</div>
          </div>
        </label>

        <div className="space-y-2">
          <Label>Tracking yoksa skor</Label>
          <Select
            value={String(trackingFailureScore)}
            onValueChange={(value: "0" | "1") => setTrackingFailureScore(Number(value) as 0 | 1)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">0</SelectItem>
              <SelectItem value="1">1</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {mode !== "completed" ? (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Score 4 metric</Label>
            <Select value={score4Metric} onValueChange={setScore4Metric}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="metric1">{metric1Name}</SelectItem>
                {hasMetric2 ? <SelectItem value="metric2">{metric2Name}</SelectItem> : null}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Score 5 metric</Label>
            <Select value={score5Metric} onValueChange={setScore5Metric}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="metric1">{metric1Name}</SelectItem>
                {hasMetric2 ? <SelectItem value="metric2">{metric2Name}</SelectItem> : null}
              </SelectContent>
            </Select>
          </div>
          {mode === "double" ? (
            <div className="space-y-2">
              <Label>Second metric min</Label>
              <Input value={secondMetricValue} onChange={(event) => setSecondMetricValue(event.target.value)} />
            </div>
          ) : null}
        </div>
      ) : null}

      <Button type="button" variant="outline" onClick={applyPreset}>
        Rule JSON üret
      </Button>

      <div className="rounded-2xl bg-black/[0.03] px-4 py-3 text-sm text-black/65">
        <p>
          Metric 1: <span className="font-medium text-black">{metric1Name}</span>
        </p>
        <p>
          Metric 2: <span className="font-medium text-black">{hasMetric2 ? metric2Name : "Kullanilmiyor"}</span>
        </p>
        <p>
          Completed flag:{" "}
          <span className="font-medium text-black">{supportsCompletedOnly ? "Destekleniyor" : "Kapali"}</span>
        </p>
        <p>
          Tracking gerekli: <span className="font-medium text-black">{requireTracking ? "Evet" : "Hayir"}</span>
        </p>
      </div>

      <div className="space-y-2">
        <Label>Advanced ruleJson</Label>
        <Textarea className="min-h-56 font-mono" value={value} onChange={(event) => onChange(event.target.value)} />
      </div>
    </div>
  );
}

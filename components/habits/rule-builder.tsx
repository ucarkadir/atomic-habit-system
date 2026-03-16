"use client";

import { useEffect, useState } from "react";

import { HabitRule } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type RuleBuilderProps = {
  value: string;
  onChange: (value: string) => void;
};

type BuilderMode = "single" | "double" | "completed";

export function RuleBuilder({ value, onChange }: RuleBuilderProps) {
  const [mode, setMode] = useState<BuilderMode>("single");
  const [score4Metric, setScore4Metric] = useState("metric1");
  const [score4Value, setScore4Value] = useState("30");
  const [score5Metric, setScore5Metric] = useState("metric1");
  const [score5Value, setScore5Value] = useState("45");
  const [secondMetricValue, setSecondMetricValue] = useState("10");
  const [missingHandling, setMissingHandling] = useState<"score1" | "ignore" | "fail">("score1");

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

  function applyPreset() {
    let rule: HabitRule;

    if (mode === "completed") {
      rule = {
        missingHandling,
        levels: [
          { score: 2, conditions: { op: "eq", metric: "completed", value: true } },
          { score: 4, conditions: { op: "gte", metric: "metric1", value: Number(score4Value) || 0 } },
          { score: 5, conditions: { op: "gte", metric: "metric1", value: Number(score5Value) || 0 } }
        ]
      };
    } else if (mode === "double") {
      rule = {
        missingHandling,
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
              <SelectItem value="double">Double metric</SelectItem>
              <SelectItem value="completed">Completed + metric</SelectItem>
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

      {mode !== "completed" ? (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Score 4 metric</Label>
            <Select value={score4Metric} onValueChange={setScore4Metric}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="metric1">Metric 1</SelectItem>
                <SelectItem value="metric2">Metric 2</SelectItem>
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
                <SelectItem value="metric1">Metric 1</SelectItem>
                <SelectItem value="metric2">Metric 2</SelectItem>
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

      <div className="space-y-2">
        <Label>Advanced ruleJson</Label>
        <Textarea className="min-h-56 font-mono" value={value} onChange={(event) => onChange(event.target.value)} />
      </div>
    </div>
  );
}

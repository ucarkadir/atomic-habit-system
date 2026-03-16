"use client";

import { useEffect, useState } from "react";

import { unitGroups, unitOptions } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type UnitSelectProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function UnitSelect({ id, label, value, onChange }: UnitSelectProps) {
  const isPresetValue = unitOptions.includes(value as (typeof unitOptions)[number]);
  const [mode, setMode] = useState(isPresetValue || !value ? "preset" : "custom");

  useEffect(() => {
    if (unitOptions.includes(value as (typeof unitOptions)[number])) {
      setMode("preset");
    }
  }, [value]);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select
        value={mode === "preset" ? value || "none" : "custom"}
        onValueChange={(next) => {
          if (next === "custom") {
            setMode("custom");
            onChange("");
            return;
          }

          setMode("preset");
          onChange(next === "none" ? "" : next);
        }}
      >
        <SelectTrigger id={id}>
          <SelectValue placeholder="Birim sec" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Secilmedi</SelectItem>
          {unitGroups.map((group) =>
            group.options.map((option) => (
              <SelectItem key={`${group.label}-${option}`} value={option}>
                {group.label}: {option}
              </SelectItem>
            ))
          )}
          <SelectItem value="custom">Custom...</SelectItem>
        </SelectContent>
      </Select>

      {mode === "custom" ? (
        <Input
          placeholder="Ozel birim"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : null}
    </div>
  );
}

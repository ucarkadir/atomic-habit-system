import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { listHabits, upsertHabit } from "@/lib/habits";
import { habitPayloadSchema } from "@/lib/validators";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const habits = await listHabits(user.id);
  return NextResponse.json({ ok: true, habits });
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const payload = habitPayloadSchema.parse(body);
    const ruleJson =
      typeof payload.ruleJson === "string" ? JSON.parse(payload.ruleJson) : payload.ruleJson;

    const habit = await upsertHabit(user.id, {
      id: payload.id,
      habitName: payload.habitName,
      identityStatement: payload.identityStatement,
      implementationIntention: payload.implementationIntention,
      plannedTime: payload.plannedTime,
      habitStacking: payload.habitStacking,
      trackingStacking: payload.trackingStacking,
      weeklyTargetText: payload.weeklyTargetText,
      metric1Label: payload.metric1Label,
      metric1Unit: payload.metric1Unit,
      metric2Label: payload.metric2Label,
      metric2Unit: payload.metric2Unit,
      supportsCompletedOnly: payload.supportsCompletedOnly,
      invertScore: payload.invertScore,
      ruleJson,
      schedules: payload.schedules
    });

    return NextResponse.json({ ok: true, habit });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 }
    );
  }
}

import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { getHabitRule } from "@/lib/habits";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const habit = await getHabitRule(user.id, id);

  if (!habit) {
    return NextResponse.json({ ok: false, error: "Habit not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, habit });
}

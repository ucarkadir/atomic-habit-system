import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { seedHabitsForUser } from "@/lib/habits";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const result = await seedHabitsForUser(user.id);
  return NextResponse.json({ ok: true, ...result });
}

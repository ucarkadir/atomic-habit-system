import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { getMonthlyData } from "@/lib/habits";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date");
  const data = await getMonthlyData(user.id, dateParam ? new Date(dateParam) : new Date());
  return NextResponse.json({ ok: true, data });
}

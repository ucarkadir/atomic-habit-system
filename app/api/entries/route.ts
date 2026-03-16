import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { createOrUpdateEntry } from "@/lib/habits";
import { dailyEntryPayloadSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const payload = dailyEntryPayloadSchema.parse(body);
    const entry = await createOrUpdateEntry(user.id, payload);

    return NextResponse.json({ ok: true, entry });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 }
    );
  }
}

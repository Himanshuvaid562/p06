import { NextResponse } from "next/server";
import { getQueries, saveQueries } from "@/lib/db";

// PATCH /api/queries/:id  -> faculty answers or schedules an office-hour slot
export async function PATCH(req, { params }) {
  const body = await req.json();
  const list = getQueries();
  const q = list.find((item) => item.id === params.id);
  if (!q) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (body.answer) {
    q.answer = body.answer;
    q.status = "Answered";
  }
  if (body.appointment) {
    q.appointment = body.appointment;
    if (!q.answer) q.status = "Scheduled";
  }

  saveQueries(list);
  return NextResponse.json(q);
}

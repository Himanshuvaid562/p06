import { NextResponse } from "next/server";
import { getQueries, saveQueries } from "@/lib/db";
import { getUser, checkRole } from "@/lib/auth";

// PATCH -> only the assigned faculty can answer or schedule
export async function PATCH(req, { params }) {
  const user = await getUser();
  const denied = checkRole(user, "faculty");
  if (denied) return denied;

  const body = await req.json();
  const list = getQueries();
  const q = list.find((item) => item.id === params.id);
  if (!q) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (q.assignedTo !== user.name) {
    return NextResponse.json({ error: "This query is not assigned to you" }, { status: 403 });
  }

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

import { NextResponse } from "next/server";
import { getQueries, saveQueries } from "@/lib/db";
import { triage } from "@/lib/triage";

export const dynamic = "force-dynamic";

// GET /api/queries?roll=123   or   /api/queries?faculty=Dr. Sharma
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const roll = searchParams.get("roll");
  const faculty = searchParams.get("faculty");

  let list = getQueries();
  if (roll) list = list.filter((q) => q.roll === roll);
  if (faculty) list = list.filter((q) => q.assignedTo === faculty);

  // High priority first, then newest first
  list.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority === "High" ? -1 : 1;
    return b.createdAt.localeCompare(a.createdAt);
  });
  return NextResponse.json(list);
}

// POST /api/queries  -> student submits a query
export async function POST(req) {
  const body = await req.json();
  if (!body.name || !body.roll || !body.course || !body.question) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  // Integration: student query -> triage -> saved with category/priority/faculty
  const result = triage(body.course, body.question);

  const query = {
    id: Date.now().toString(),
    name: body.name,
    roll: body.roll,
    course: body.course,
    question: body.question,
    ...result,
    status: "Open",
    answer: "",
    appointment: "",
    createdAt: new Date().toISOString(),
  };

  const list = getQueries();
  list.push(query);
  saveQueries(list);
  return NextResponse.json(query, { status: 201 });
}

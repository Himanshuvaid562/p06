import { NextResponse } from "next/server";
import { getQueries, saveQueries, getSessions, saveSessions } from "@/lib/db";
import { getUser, checkRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET -> students see sessions they are part of, faculty see their own sessions
export async function GET() {
  const user = await getUser();
  const denied = checkRole(user);
  if (denied) return denied;

  let list = getSessions();
  if (user.role === "student") list = list.filter((s) => s.rolls.includes(user.roll));
  else list = list.filter((s) => s.faculty === user.name);

  list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return NextResponse.json(list);
}

// POST -> faculty creates a group session for several of their queries
export async function POST(req) {
  const user = await getUser();
  const denied = checkRole(user, "faculty");
  if (denied) return denied;

  const body = await req.json();

  if (!body.title || !body.scheduledAt || !body.queryIds?.length) {
    return NextResponse.json({ error: "Title, date/time and at least one query are required" }, { status: 400 });
  }
  if (!body.meetLink || !body.meetLink.startsWith("https://meet.google.com/")) {
    return NextResponse.json({ error: "Please paste a valid Google Meet link (https://meet.google.com/...)" }, { status: 400 });
  }

  const queries = getQueries();
  // only queries assigned to this faculty can be added
  const picked = queries.filter((q) => body.queryIds.includes(q.id) && q.assignedTo === user.name);
  if (picked.length === 0) {
    return NextResponse.json({ error: "No valid queries selected" }, { status: 400 });
  }

  // everyone who asked the doubt + everyone who tapped "I have this doubt too" (no duplicates)
  const people = [];
  for (const q of picked) {
    for (const person of [{ roll: q.roll, name: q.name }, ...(q.alsoAsked || [])]) {
      if (!people.some((x) => x.roll === person.roll)) people.push(person);
    }
  }

  const session = {
    id: Date.now().toString(),
    title: body.title,
    faculty: user.name,
    course: [...new Set(picked.map((q) => q.course))].join(", "),
    meetLink: body.meetLink,
    scheduledAt: body.scheduledAt,
    queryIds: picked.map((q) => q.id),
    rolls: people.map((x) => x.roll),
    students: people.map((x) => x.name),
    recordingLink: "",
    createdAt: new Date().toISOString(),
  };

  for (const q of picked) {
    q.sessionId = session.id;
    q.appointment = body.scheduledAt;
    if (!q.answer) q.status = "Scheduled";
  }
  saveQueries(queries);

  const sessions = getSessions();
  sessions.push(session);
  saveSessions(sessions);

  return NextResponse.json(session, { status: 201 });
}

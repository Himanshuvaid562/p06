import { NextResponse } from "next/server";
import { getQueries, saveQueries, getSessions, saveSessions } from "@/lib/db";
import { getUser, checkRole } from "@/lib/auth";

// PATCH -> the faculty who owns the session saves the recording link
export async function PATCH(req, { params }) {
  const user = await getUser();
  const denied = checkRole(user, "faculty");
  if (denied) return denied;

  const body = await req.json();
  const sessions = getSessions();
  const session = sessions.find((s) => s.id === params.id);
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  if (session.faculty !== user.name) {
    return NextResponse.json({ error: "This is not your session" }, { status: 403 });
  }

  if (!body.recordingLink || !body.recordingLink.startsWith("http")) {
    return NextResponse.json({ error: "Please paste a valid recording link" }, { status: 400 });
  }

  session.recordingLink = body.recordingLink;
  saveSessions(sessions);

  // mark every linked query as answered, so students see it was covered
  const queries = getQueries();
  for (const q of queries) {
    if (q.sessionId === session.id && !q.answer) {
      q.answer = 'Covered in the group session "' + session.title + '". Watch the recording in the Group Sessions section.';
      q.status = "Answered";
    }
  }
  saveQueries(queries);

  return NextResponse.json(session);
}

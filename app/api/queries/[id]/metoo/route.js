import { NextResponse } from "next/server";
import { getQueries, saveQueries, getSessions, saveSessions } from "@/lib/db";
import { getCourses } from "@/lib/users";
import { getUser, checkRole } from "@/lib/auth";

// POST -> a classmate says "I have this doubt too" (press again to undo)
export async function POST(req, { params }) {
  const user = await getUser();
  const denied = checkRole(user, "student");
  if (denied) return denied;

  const queries = getQueries();
  const q = queries.find((item) => item.id === params.id);

  // not visible to this student (other course, or private) -> pretend it does not exist
  if (!q || q.private || !getCourses(user.username).includes(q.course)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (q.roll === user.roll) {
    return NextResponse.json({ error: "This is your own doubt" }, { status: 400 });
  }

  q.alsoAsked = q.alsoAsked || [];
  const index = q.alsoAsked.findIndex((a) => a.roll === user.roll);
  const joined = index === -1;

  if (joined) q.alsoAsked.push({ roll: user.roll, name: user.name });
  else q.alsoAsked.splice(index, 1);
  saveQueries(queries);

  // if a group session is already planned for this doubt, join / leave it too
  if (q.sessionId) {
    const sessions = getSessions();
    const s = sessions.find((x) => x.id === q.sessionId);
    if (s) {
      if (joined && !s.rolls.includes(user.roll)) {
        s.rolls.push(user.roll);
        s.students.push(user.name);
      }
      if (!joined && q.roll !== user.roll) {
        const i = s.rolls.indexOf(user.roll);
        if (i !== -1) { s.rolls.splice(i, 1); s.students.splice(i, 1); }
      }
      saveSessions(sessions);
    }
  }

  return NextResponse.json({ iHaveThis: joined, alsoCount: q.alsoAsked.length });
}

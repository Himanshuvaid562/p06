import { NextResponse } from "next/server";
import { getUsers, checkPassword, hashPassword } from "@/lib/users";
import { startSession, setSessionCookie } from "@/lib/auth";

// failed-login counter (kept in memory, resets when the server restarts)
const attempts = new Map();
const MAX_FAILS = 5;
const LOCK_MS = 60 * 1000;

const dummyHash = hashPassword("not-a-real-password"); // so unknown usernames take the same time

export async function POST(req) {
  const { username, password, role } = await req.json();
  const name = (username || "").trim();

  // too many wrong passwords -> wait a bit
  const a = attempts.get(name) || { count: 0, lockedUntil: 0 };
  if (a.lockedUntil > Date.now()) {
    const secs = Math.ceil((a.lockedUntil - Date.now()) / 1000);
    return NextResponse.json({ error: "Too many failed attempts. Try again in " + secs + " seconds." }, { status: 429 });
  }

  const user = getUsers().find((u) => u.username === name);
  const ok = checkPassword(password || "", user ? user.passwordHash : dummyHash);

  if (!user || !ok) {
    a.count += 1;
    if (a.count >= MAX_FAILS) { a.lockedUntil = Date.now() + LOCK_MS; a.count = 0; }
    attempts.set(name, a);
    return NextResponse.json({ error: "Wrong username or password" }, { status: 401 });
  }
  if (user.role !== role) {
    return NextResponse.json(
      { error: "This is a " + user.role + " account. Select '" + user.role + "' above." },
      { status: 403 }
    );
  }

  attempts.delete(name);
  const res = NextResponse.json({ role: user.role, name: user.name });
  setSessionCookie(res, await startSession(user));
  return res;
}

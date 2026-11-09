import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createToken, readToken } from "./token";
import { getAuthSessions, saveAuthSessions } from "./db";

export const COOKIE = "p09_session";
const EIGHT_HOURS = 8 * 60 * 60 * 1000;

// called on login: remembers the session on the server and returns the cookie value
export async function startSession(user) {
  const sid = crypto.randomBytes(24).toString("hex");
  const exp = Date.now() + EIGHT_HOURS;

  const list = getAuthSessions().filter((s) => s.exp > Date.now()); // drop expired ones
  list.push({ sid, username: user.username, exp });
  saveAuthSessions(list);

  return createToken({
    sid,
    username: user.username,
    role: user.role,
    name: user.name,
    roll: user.roll || null,
    exp,
  });
}

// called on logout: the session is deleted on the server, so the old cookie stops working
export function endSession(sid) {
  saveAuthSessions(getAuthSessions().filter((s) => s.sid !== sid));
}

// returns the logged-in user, or null (cookie must be valid AND the session must still exist)
export async function getUser() {
  const info = await readToken(cookies().get(COOKIE)?.value);
  if (!info) return null;

  const alive = getAuthSessions().some((s) => s.sid === info.sid && s.exp > Date.now());
  return alive ? info : null;
}

export function setSessionCookie(res, token) {
  res.cookies.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.COOKIE_SECURE === "true", // set to true when using https
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export function clearSessionCookie(res) {
  res.cookies.set(COOKIE, "", { path: "/", maxAge: 0 });
}

// use at the top of an API route:  const denied = checkRole(user, "faculty"); if (denied) return denied;
export function checkRole(user, role) {
  if (!user) {
    const res = NextResponse.json({ error: "Please log in" }, { status: 401 });
    clearSessionCookie(res); // removes a stale cookie so the browser never gets stuck
    return res;
  }
  if (role && user.role !== role) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }
  return null;
}

import crypto from "crypto";
import { loadUsers, saveUsers } from "./db";

// Demo accounts. They are written to data/users.json the first time the app runs,
// and only the HASHED passwords are stored there.
// Faculty "name" must match the names used in lib/triage.js (courseFaculty).
const seed = [
  // "courses" = the classes a student is enrolled in. Students only see doubts from these courses.
  { username: "101", password: "student123", role: "student", name: "Asha", roll: "101", courses: ["CSE310", "CSE326"] },
  { username: "102", password: "student123", role: "student", name: "Ravi", roll: "102", courses: ["CSE310", "MTH174"] },
  { username: "103", password: "student123", role: "student", name: "Meera", roll: "103", courses: ["CSE326", "MTH174"] },

  { username: "sharma", password: "faculty123", role: "faculty", name: "Dr. Sharma" },
  { username: "singh", password: "faculty123", role: "faculty", name: "Prof. Singh" },
  { username: "kaur", password: "faculty123", role: "faculty", name: "Dr. Kaur" },
];

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return salt + ":" + hash;
}

export function checkPassword(password, stored) {
  const [salt, hash] = stored.split(":");
  const test = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), test);
}

export function getUsers() {
  let list = loadUsers();
  if (list.length === 0) {
    list = seed.map(({ password, ...rest }) => ({ ...rest, passwordHash: hashPassword(password) }));
    saveUsers(list);
  }

  // users.json made by an older version has no "courses": add them from the seed
  let changed = false;
  for (const u of list) {
    if (u.role === "student" && !u.courses) {
      const fromSeed = seed.find((x) => x.username === u.username);
      u.courses = fromSeed ? fromSeed.courses : [];
      changed = true;
    }
  }
  if (changed) saveUsers(list);

  return list;
}

// the courses a student is enrolled in
export function getCourses(username) {
  const u = getUsers().find((x) => x.username === username);
  return (u && u.courses) || [];
}

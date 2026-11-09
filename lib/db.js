// Tiny "database": JSON files inside the data/ folder
import fs from "fs";
import path from "path";

function read(name, fallback = []) {
  const file = path.join(process.cwd(), "data", name);
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function write(name, list) {
  const file = path.join(process.cwd(), "data", name);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(list, null, 2));
}

export const getQueries = () => read("queries.json");
export const saveQueries = (list) => write("queries.json", list);

export const getSessions = () => read("sessions.json");
export const saveSessions = (list) => write("sessions.json", list);

export const loadUsers = () => read("users.json");
export const saveUsers = (list) => write("users.json", list);

// login sessions, so a logout really ends the session on the server
export const getAuthSessions = () => read("auth-sessions.json");
export const saveAuthSessions = (list) => write("auth-sessions.json", list);

// cache of question embeddings: { queryId: { model, v: [numbers] } }
export const getEmbeddings = () => read("embeddings.json", {});
export const saveEmbeddings = (obj) => write("embeddings.json", obj);

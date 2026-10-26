// Tiny "database": stores everything in data/queries.json
import fs from "fs";
import path from "path";

const file = path.join(process.cwd(), "data", "queries.json");

export function getQueries() {
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function saveQueries(list) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(list, null, 2));
}

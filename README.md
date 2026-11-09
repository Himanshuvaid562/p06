# P09 - Heard in Class, Lost After

    npm install
    npm run dev

Open http://localhost:3000

- /login    -> login page (student / faculty)
- /student  -> Module 1: submit a query (auto triaged), see answers, Meet links and recordings
- /faculty  -> Module 2: view, answer, schedule; group similar doubts into one Google Meet
- lib/triage.js -> Module 3: category, priority, faculty routing, similar-doubt finder
- Data is saved in data/*.json (created automatically)

## Group session flow
1. Faculty selects queries with the same doubt (or clicks "Select all similar").
2. Click "Create Google Meet", paste the link, set the time, create the session.
3. Students see the Meet link on their page.
4. In Meet, start recording. Meet saves it to the organiser's Google Drive.
5. Faculty pastes the Drive link in the session. All students in it can watch it.

## Run with Docker

    docker compose up --build

Open http://localhost:3000 . Data is kept in the `p09-data` volume.

    docker compose down        # stop (data is kept)
    docker compose down -v     # stop and delete data

## Class doubt board

- Students see every public doubt from the courses they are enrolled in (`courses` in `lib/users.js`).
- Classmates stay anonymous: the board never includes the asker's name or roll number.
- Marks and attendance questions are private automatically, and any question can be marked private.
- "I have this doubt too" adds the student to that doubt. Faculty see the count and names, and
  "Create group session" invites the asker and everyone who tapped it.
- While a student types a new question, similar doubts already on the board are shown under the box.
  They can tap "Same doubt, I have this too" instead of posting a duplicate, and any answer is shown there.

## Smart matching (optional, Ollama)

Similar doubts are matched by **meaning** (so "Explain BST insertion" finds "How do I add a node to a
binary search tree?"), for the student suggestions AND the faculty "similar doubts" / "Select all similar".

    ollama pull nomic-embed-text      # once
    npm run dev                        # the app finds Ollama at http://localhost:11434

- Runs on your own machine. Questions are never sent to an outside service.
- If Ollama is not running, the app quietly uses keyword matching instead. The suggestion box and the
  faculty page say which one is in use.
- Settings (env vars): `EMBED_URL`, `EMBED_MODEL`, `SIMILARITY_THRESHOLD` (default 0.65; lower = more matches).
- Embeddings are cached in `data/embeddings.json`, so each question is embedded only once.
- Docker: the compose file points at `host.docker.internal:11434`. Ollama must accept connections from
  the container: start it with `OLLAMA_HOST=0.0.0.0 ollama serve`.
- Demo: 101 and 102 share CSE310 (they see each other's doubts), 103 is not in CSE310.

## Login (demo accounts)

| Role    | Username              | Password   |
|---------|-----------------------|------------|
| Student | 101, 102, 103         | student123 |
| Faculty | sharma, singh, kaur   | faculty123 |

Demo users are created in `data/users.json` on first run (passwords are stored hashed).
To reset them, delete that file.

## How authentication and authorization work

- **Every page checks the login on the server, on every request** (`app/login`, `app/student`, `app/faculty`, `app/page.js`):
  - not logged in -> `/student` and `/faculty` redirect to `/login`
  - logged in -> `/login` redirects to your own dashboard (the login page is never shown)
  - a student cannot open `/faculty` and faculty cannot open `/student`
  - pages are never cached (`force-dynamic`, `no-store`, router `staleTimes.dynamic = 0`)
- **Middleware** (`middleware.js`) is only a cheap first check of the cookie signature.
- **Sessions** are stored on the server (`data/auth-sessions.json`). Logout deletes the session, so a copied cookie stops working. They expire after 8 hours.
- **Open tabs stay in sync** (`components/AuthSync.js`): log out in one tab and the others go to `/login`; log in in one tab and an open login page jumps to the dashboard.
- **API routes** check the role again on every request (`lib/auth.js`): students only see their own queries, faculty only queries assigned to them.
- Passwords are hashed with scrypt. After 5 wrong passwords an account is locked for 1 minute.
- The cookie is httpOnly and SameSite=Lax. Set `COOKIE_SECURE=true` when using https.

## Before real use
- Set your own `AUTH_SECRET` in `.env` (see `.env.example`).
- Serve over https and set `COOKIE_SECURE=true`.
- Move users, queries and sessions from JSON files to a real database.

"use client";
import { useState } from "react";

const facultyList = ["Dr. Sharma", "Prof. Singh", "Dr. Kaur"];

export default function FacultyPage() {
  const [faculty, setFaculty] = useState(facultyList[0]);
  const [queries, setQueries] = useState([]);
  const [answers, setAnswers] = useState({});
  const [slots, setSlots] = useState({});

  async function load(name = faculty) {
    const res = await fetch("/api/queries?faculty=" + encodeURIComponent(name));
    setQueries(await res.json());
  }

  async function update(id, data) {
    await fetch("/api/queries/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    load();
  }

  return (
    <div>
      <h2>Faculty - Student Queries</h2>
      <select
        value={faculty}
        onChange={(e) => { setFaculty(e.target.value); load(e.target.value); }}
      >
        {facultyList.map((f) => <option key={f}>{f}</option>)}
      </select>
      <button onClick={() => load()}>Load my queries</button>

      {queries.map((q) => (
        <div className="card" key={q.id}>
          <span className={"tag " + (q.priority === "High" ? "high" : "")}>{q.priority}</span>
          <span className="tag">{q.course}</span>
          <span className="tag">{q.category}</span>
          <span className="tag">{q.status}</span>
          <p><b>{q.name}</b> ({q.roll}): {q.question}</p>

          {q.answer && <p><b>Your answer:</b> {q.answer}</p>}
          {q.appointment && <p><b>Office hour:</b> {new Date(q.appointment).toLocaleString()}</p>}

          <textarea
            rows={2}
            placeholder="Write answer..."
            value={answers[q.id] || ""}
            onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
          />
          <button onClick={() => update(q.id, { answer: answers[q.id] })}>Send Answer</button>

          <input
            type="datetime-local"
            value={slots[q.id] || ""}
            onChange={(e) => setSlots({ ...slots, [q.id]: e.target.value })}
          />
          <button onClick={() => update(q.id, { appointment: slots[q.id] })}>Schedule Office Hour</button>
        </div>
      ))}
    </div>
  );
}

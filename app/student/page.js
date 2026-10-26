"use client";
import { useState } from "react";

const courses = ["CSE310", "CSE326", "MTH174"];

export default function StudentPage() {
  const [form, setForm] = useState({ name: "", roll: "", course: "CSE310", question: "" });
  const [myQueries, setMyQueries] = useState([]);
  const [msg, setMsg] = useState("");

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function loadMine(roll) {
    const res = await fetch("/api/queries?roll=" + roll);
    setMyQueries(await res.json());
  }

  async function submit(e) {
    e.preventDefault();
    const res = await fetch("/api/queries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      setMsg("Please fill all fields");
      return;
    }
    setMsg("Query submitted!");
    setForm({ ...form, question: "" });
    loadMine(form.roll);
  }

  return (
    <div>
      <h2>Student - Ask a Question</h2>
      <form onSubmit={submit}>
        <input name="name" placeholder="Your name" value={form.name} onChange={change} />
        <input name="roll" placeholder="Roll / Reg. number" value={form.roll} onChange={change} />
        <select name="course" value={form.course} onChange={change}>
          {courses.map((c) => <option key={c}>{c}</option>)}
        </select>
        <textarea name="question" rows={4} placeholder="Type your doubt or request..." value={form.question} onChange={change} />
        <button type="submit">Submit Query</button>
      </form>
      <p>{msg}</p>

      <button onClick={() => loadMine(form.roll)}>Show my queries</button>

      {myQueries.map((q) => (
        <div className="card" key={q.id}>
          <span className="tag">{q.course}</span>
          <span className="tag">{q.category}</span>
          <span className="tag">{q.status}</span>
          <p><b>Q:</b> {q.question}</p>
          <p>Assigned to: {q.assignedTo}</p>
          {q.answer && <p><b>Answer:</b> {q.answer}</p>}
          {q.appointment && <p><b>Office hour:</b> {new Date(q.appointment).toLocaleString()}</p>}
        </div>
      ))}
    </div>
  );
}

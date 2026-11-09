"use client";
import { useState, useEffect } from "react";

export default function LoginForm() {
  const [role, setRole] = useState("student");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // /login?role=faculty opens the faculty tab
  useEffect(() => {
    const r = new URLSearchParams(window.location.search).get("role");
    if (r === "faculty") setRole("faculty");
  }, []);

  async function login(e) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, role }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      return;
    }
    // tell other open tabs that we logged in, then replace (not push) so back never returns here
    try { localStorage.setItem("p09_auth", String(Date.now())); } catch (e) {}
    window.location.replace(data.role === "faculty" ? "/faculty" : "/student");
  }

  return (
    <div className="login-box">
      <h1 className="page-title" style={{ textAlign: "center" }}>Welcome back</h1>
      <p className="page-sub" style={{ textAlign: "center" }}>Login to continue</p>

      <div className="card">
        <div className="tabs">
          <button type="button" className={"tab " + (role === "student" ? "active" : "")} onClick={() => setRole("student")}>
            🎓 Student
          </button>
          <button type="button" className={"tab " + (role === "faculty" ? "active" : "")} onClick={() => setRole("faculty")}>
            👩‍🏫 Faculty
          </button>
        </div>

        <form onSubmit={login}>
          <label>{role === "student" ? "Roll number" : "Username"}</label>
          <input
            placeholder={role === "student" ? "e.g. 101" : "e.g. sharma"}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <div className="error">{error}</div>}

          <button type="submit" className="btn btn-full">Login as {role}</button>
        </form>
      </div>

      <div className="hint">
        <b>Demo accounts</b><br />
        Student: <code>101</code>, <code>102</code> or <code>103</code> / <code>student123</code><br />
        Faculty: <code>sharma</code>, <code>singh</code> or <code>kaur</code> / <code>faculty123</code>
      </div>
    </div>
  );
}

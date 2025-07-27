// src/AuthForm.js
import React, { useState } from "react";
import GoogleAuthButton from "./GoogleAuthButton";
import { setToken } from "./api";

export default function AuthForm({ onAuth }) {
  const [mode, setMode] = useState("login"); // or "signup"
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const route = mode === "signup" ? "/api/signup" : "/api/login";
    try {
      const resp = await fetch(`http://localhost:5001${route}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Auth failed");
      if (data.token) {
        setToken(data.token);
        onAuth(data); // Tell parent "user is logged in"
      } else {
        setError("Success! Please log in.");
        setMode("login");
      }
    } catch (e) {
      setError(e.message);
    }
  }

  function handleInput(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  return (
    <div className="auth-form-container">
      <h2>{mode === "login" ? "Login" : "Sign Up"}</h2>
      <form onSubmit={handleSubmit}>
        {mode === "signup" && (
          <input
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleInput}
            required
          />
        )}
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleInput}
          autoComplete="email"
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleInput}
          autoComplete={
            mode === "login" ? "current-password" : "new-password"
          }
          required
        />
        <button>{mode === "login" ? "Login" : "Sign Up"}</button>
      </form>
      <div className="or">or</div>
      <GoogleAuthButton onAuth={onAuth} />
      <div>
        {mode === "login"
          ? (
            <span>
              No account?{" "}
              <button className="link" onClick={() => setMode("signup")}>Sign up</button>
            </span>
          )
          : (
            <span>
              Already registered?{" "}
              <button className="link" onClick={() => setMode("login")}>Login</button>
            </span>
          )}
      </div>
      {error && <div className="error">{error}</div>}
    </div>
  );
}

// src/AuthForm.js
import React, { useState } from "react";
import GoogleAuthButton from "./GoogleAuthButton";
import { setToken } from "./api";
import { FaGithub, FaCloud, FaRedhat } from "react-icons/fa";

export default function AuthForm({ onAuth }) {
  const [mode, setMode] = useState("login");
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
        onAuth(data);
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
    <div className="auth-bg medical-bg">
      <div className="auth-card newrelic-style auth-card-black">
        <h1 className="auth-heading-newrelic auth-heading-medilens">MediLens</h1>
        <form onSubmit={handleSubmit} className="auth-form-newrelic" aria-label="Authentication form">
          {mode === "signup" && (
            <input
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleInput}
              required
              className="auth-input"
              aria-label="Full Name"
            />
          )}
          <input
            name="email"
            type="email"
            placeholder="Company Email"
            value={form.email}
            onChange={handleInput}
            autoComplete="email"
            required
            className="auth-input"
            aria-label="Email"
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
            className="auth-input"
            aria-label="Password"
          />
          <button className="auth-button-newrelic" aria-label={mode === "login" ? "Sign In" : "Get Started Free"}>
            {mode === "login" ? "Sign In" : "Get Started Free"}
          </button>
        </form>
        <div className="auth-divider-newrelic">
          <span>Or sign up with</span>
        </div>
        <div className="auth-providers-newrelic" role="group" aria-label="Sign up with providers">
          <GoogleAuthButton onAuth={onAuth} newrelic />
          <button className="provider-btn"><FaGithub /></button>
          <button className="provider-btn"><FaRedhat /></button>
          <button className="provider-btn"><FaCloud /></button>
        </div>
        <div className="auth-toggle-newrelic" role="navigation" aria-label="Switch authentication mode">
          {mode === "login" ? (
            <span>
              No account? <button className="link-btn" onClick={() => setMode("signup")}>Sign up</button>
            </span>
          ) : (
            <span>
              Already registered? <button className="link-btn" onClick={() => setMode("login")}>Sign in</button>
            </span>
          )}
        </div>
        {error && <div className="auth-error">{error}</div>}
      </div>
    </div>
  );
}

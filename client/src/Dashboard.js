// src/Dashboard.js
import React from "react";
import { setToken, getToken } from "./api";
import ChatBot from "./ChatBot";
import HealthTips from "./HealthTips";

export default function Dashboard({ user, onLogout }) {
  function logout() {
    setToken(null);
    if (onLogout) onLogout();
  }

  return (
    <div>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 16
      }}>
        <h2>👋 Welcome, {user?.name || user?.email || "User"}</h2>
        <button onClick={logout}>Logout</button>
      </div>
      <ChatBot />
      <HealthTips />
    </div>
  );
}

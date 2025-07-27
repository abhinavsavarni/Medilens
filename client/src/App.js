import React, { useState } from "react";
import AuthForm from "./AuthForm";
import Dashboard from "./Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import { getToken } from "./api";
import "./App.css";
import { jwtDecode } from "jwt-decode"; 


export default function App() {
  const [user, setUser] = useState(() => {
    const token = getToken();
    if (token) {
      try {
        const decoded = jwtDecode(token);
 // e.g. { id, email, name }
        return decoded;
      } catch {
        return null;
      }
    }
    return null;
  });

  return (
    <div className="medilens-app pill-cursor">
      {user ? (
        <ProtectedRoute>
          <Dashboard user={user} onLogout={() => setUser(null)} />
        </ProtectedRoute>
      ) : (
        <AuthForm onAuth={userinfo => setUser(userinfo)} />
      )}
    </div>
  );
}

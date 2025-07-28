import React, { useState, createContext, useContext } from "react";
import AuthForm from "./AuthForm";
import Dashboard from "./Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import { getToken } from "./api";
import "./App.css";
import { jwtDecode } from "jwt-decode";

const ThemeContext = createContext();
export function useTheme() {
  return useContext(ThemeContext);
}

const ToastContext = createContext();
export function useToast() {
  return useContext(ToastContext);
}

function Toast({ message, type, onClose }) {
  if (!message) return null;
  return (
    <div className={`toast toast-${type || "info"}`}>
      <span>{message}</span>
      <button className="toast-close" onClick={onClose} aria-label="Close notification">×</button>
    </div>
  );
}

function TopNav({ user, onLogout, onSettings }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <nav className="top-nav" role="navigation" aria-label="Main navigation">
      <div className="nav-left">
        <span className="nav-logo">🧬 <span className="nav-brand">MediLens</span></span>
      </div>
      <div className="nav-center">
        <span className="nav-title">AI Health Assistant</span>
      </div>
      <div className="nav-right">
        <button className="nav-btn" aria-label="Toggle theme" onClick={toggleTheme} title="Toggle dark/light mode">
          {theme === "dark" ? "🌙" : "☀️"}
        </button>
        {user && (
          <>
            <button className="nav-btn" aria-label="Settings" onClick={onSettings}>
              <span role="img" aria-label="settings">⚙️</span>
            </button>
            <div className="nav-profile-menu">
              <span className="nav-avatar" title={user.name || user.email}>{user.name?.[0] || user.email?.[0] || "U"}</span>
              <div className="nav-profile-dropdown">
                <span className="nav-profile-name">{user.name || user.email}</span>
                <button className="nav-btn logout" onClick={onLogout}>Sign Out</button>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    const token = getToken();
    if (token) {
      try {
        const decoded = jwtDecode(token);
        return decoded;
      } catch {
        return null;
      }
    }
    return null;
  });
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("medilens_theme") || "dark");
  const [toast, setToast] = useState({ message: "", type: "info" });
  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "info" }), 3500);
  };

  React.useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("medilens_theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <ToastContext.Provider value={{ showToast }}>
        <div className="medilens-app pill-cursor">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "info" })} />
          <TopNav user={user} onLogout={() => setUser(null)} onSettings={() => setShowSettings(true)} />
          {user ? (
            <ProtectedRoute>
              <Dashboard user={user} onLogout={() => setUser(null)} showSettings={showSettings} setShowSettings={setShowSettings} />
            </ProtectedRoute>
          ) : (
            <AuthForm onAuth={userinfo => setUser(userinfo)} />
          )}
        </div>
      </ToastContext.Provider>
    </ThemeContext.Provider>
  );
}

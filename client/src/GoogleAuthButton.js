// src/GoogleAuthButton.js
import React from "react";
export default function GoogleAuthButton({ onAuth }) {
  const googleLogin = () => {
    const googleURL = `http://localhost:5001/api/auth/google`;
    window.location.href = googleURL;
    // The backend will redirect to http://localhost:3000?token=... on success
  };

  // Auto-check for token in URL after Google login redirect
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("token")) {
      const token = params.get("token");
      if (token) {
        localStorage.setItem("token", token);
        if (onAuth) onAuth({ token });
        window.history.replaceState({}, "", "/");
      }
    }
  }, [onAuth]);

  return (
    <button onClick={googleLogin} className="google-btn">
      <img src="https://developers.google.com/identity/images/g-logo.png" alt="G"/> Sign in with Google
    </button>
  );
}

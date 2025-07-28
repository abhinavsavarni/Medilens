// src/GoogleAuthButton.js
import React from "react";

export default function GoogleAuthButton({ onAuth, small, newrelic }) {
  const googleLogin = () => {
    const googleURL = `http://localhost:5001/api/auth/google`;
    window.location.href = googleURL;
  };

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

  if (newrelic) {
    return (
      <button
        className="google-btn-newrelic"
        onClick={googleLogin}
        title="Sign in with Google"
        aria-label="Sign in with Google"
      >
        <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" style={{ width: 22, height: 22, marginRight: 8 }} />
        Google
      </button>
    );
  }

  if (small) {
    return (
      <button
        className="provider-btn"
        onClick={googleLogin}
        title="Sign in with Google"
        aria-label="Sign in with Google"
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
      >
        <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" style={{ width: 20, height: 20 }} />
        <span style={{ fontSize: 10, color: '#111', marginTop: 2 }}>Google</span>
      </button>
    );
  }

  return (
    <button className="google-btn" onClick={googleLogin}>
      <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" style={{ width: 20, height: 20 }} />
      Sign in with Google
    </button>
  );
}

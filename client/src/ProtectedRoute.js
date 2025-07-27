// src/ProtectedRoute.js
import React from "react";
import { getToken } from "./api";

export default function ProtectedRoute({ children, fallback }) {
  const isLoggedIn = !!getToken();
  return isLoggedIn ? children : fallback || <div>Please log in.</div>;
}

import { Navigate } from "react-router-dom";
import React from "react";

export default function PublicRoute({ children }) {
  const token = localStorage.getItem("token");

  return token ? <Navigate to="/" replace /> : children;
}
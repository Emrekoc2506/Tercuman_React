import React from "react";
import { Navigate, Outlet } from "react-router-dom";

// ==============================================================================
// PROTECTED ROUTE (KORUMALI ROTA)
// ==============================================================================
// Bu bileşen, belirli sayfalara sadece yetkili kullanıcıların girmesini sağlar.
// Mantık şöyledir:
// 1. Kullanıcının giriş yapıp yapmadığını kontrol et (Token var mı?).
// 2. Kullanıcının rolü, bu sayfaya girmeye uygun mu? (allowedRoles).

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const normalizedUserRole = userRole ? userRole.trim().toLowerCase() : "";
  const normalizedAllowedRoles = allowedRoles
    ? allowedRoles.map((r) => r.toLowerCase())
    : [];

  if (allowedRoles && !normalizedAllowedRoles.includes(normalizedUserRole)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

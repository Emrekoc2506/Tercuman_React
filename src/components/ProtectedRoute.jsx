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
  // 1. Token ve Rolü LocalStorage'dan al
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  // A) Eğer Token yoksa -> Kullanıcı giriş yapmamış.
  // Onu "Login" sayfasına yönlendir.
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // B) Eğer Token var ama Rolü yetersizse ->
  // Örneğin "Customer" rolüyle "Admin" sayfasına girmeye çalışıyorsa.

  // Büyük/Küçük Harf duyarsız kontrol (Admin vs admin, Customer vs customer)
  const normalizedUserRole = userRole ? userRole.trim().toLowerCase() : "";
  const normalizedAllowedRoles = allowedRoles
    ? allowedRoles.map((r) => r.toLowerCase())
    : [];

  if (allowedRoles && !normalizedAllowedRoles.includes(normalizedUserRole)) {
    // Şimdilik sadece ana sayfaya yönlendiriyoruz.
    return <Navigate to="/" replace />;
  }

  // C) Her şey yolundaysa -> Sayfayı göster (Outlet).
  return <Outlet />;
};

export default ProtectedRoute;

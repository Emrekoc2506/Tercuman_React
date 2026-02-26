import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";

// Layouts (Düzenler)
import PublicLayout from "./layouts/PublicLayout";
import TranslatorLayout from "./layouts/TranslatorLayout";
import AdminLayout from "./layouts/AdminLayout";
import CustomerLayout from "./layouts/CustomerLayout";

// Global CSS
import "./css/main.css";
import "./css/modern.css";

// Sayfalar (Pages)
import Home from "./pages/public/Home";
import LoginPage from "./pages/public/LoginPage";
import Register from "./pages/public/Register";
import ForgotPassword from "./pages/public/ForgotPassword";
// Translator Pages
import TranslatorDashboard from "./pages/translator/TranslatorDashboard";
import LanguageManagement from "./pages/translator/LanguageManagement";
import TranslatorMessages from "./pages/translator/TranslatorMessages";
import ProfileUpdate from "./pages/translator/ProfileUpdate";
import AdCreationWizard from "./pages/translator/AdCreationWizard";
// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import AdminMessages from "./pages/admin/AdminMessages";
// Customer Pages
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import CustomerProfile from "./pages/customer/CustomerProfile";

// Güvenlik (Route Guard)
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* 1. PUBLIC ROUTES (Herkese Açık) */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* 2. TRANSLATOR ROUTES (Sadece Çevirmenler) */}
        {/* Korumalı Rota: Sadece 'Translator' rolü girebilir */}
        <Route element={<ProtectedRoute allowedRoles={["Translator"]} />}>
          <Route path="/translator" element={<TranslatorLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<TranslatorDashboard />} />
            <Route path="messages" element={<TranslatorMessages />} />
            <Route path="profile" element={<ProfileUpdate />} />
            <Route path="languages" element={<LanguageManagement />} />
            {/* Yeni İlan Ekleme Sihtirbazı (Sahibinden Tarzı) */}
            <Route path="ad-create" element={<AdCreationWizard />} />
          </Route>
        </Route>

        {/* 3. ADMIN ROUTES (Sadece Yöneticiler) */}
        {/* Korumalı Rota: Sadece 'Admin' rolü girebilir */}
        <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="messages" element={<AdminMessages />} />
          </Route>
        </Route>

        {/* 4. CUSTOMER ROUTES (Sadece Müşteriler) */}
        <Route element={<ProtectedRoute allowedRoles={["Customer"]} />}>
          <Route path="/customer" element={<CustomerLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<CustomerDashboard />} />
            <Route path="profile" element={<CustomerProfile />} />
          </Route>
        </Route>

        {/* 5. CATCH ALL (Bilinmeyen Rota) */}
        {/* Kullanıcı var olmayan bir adrese giderse ana sayfaya yönlendir */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;

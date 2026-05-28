import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";

// Layouts (Düzenler)
import PublicLayout from "./layouts/PublicLayout";
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
import Listings from "./pages/public/Listings";
import ListingDetail from "./pages/public/ListingDetail";
import About from "./pages/public/About";
import Services from "./pages/public/Services";
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
import AdminReports from "./pages/admin/AdminReports";
// Customer Pages
import CustomerDashboard from "./pages/customer/CustomerDashboard";

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
          <Route path="listings" element={<Listings />} />
          <Route path="listings/:id" element={<ListingDetail />} />
          <Route path="about" element={<About />} />
          <Route path="services" element={<Services />} />
        </Route>

        {/* 2. USER ROUTES (Giriş Yapmış Herkes İçin) */}
        {/* Korumalı Rota: Token olan herkes girebilir */}
        <Route element={<ProtectedRoute />}>
          <Route path="/user" element={<CustomerLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<CustomerDashboard />} />
            <Route path="profile" element={<ProfileUpdate />} />
            <Route path="messages" element={<TranslatorMessages />} />
            <Route path="ad-create" element={<AdCreationWizard />} />
          </Route>

          {/* 3. ADMIN ROUTES (Sadece Adminler İçin) */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={["Admin"]} />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="messages" element={<AdminMessages />} />
              <Route path="reports" element={<AdminReports />} />
            </Route>
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

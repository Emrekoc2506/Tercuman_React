import React, { useState } from "react";
import { loginUser } from "../services/api";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser({ email, password }); //
      if (res.data.success) {
        // Dokümanda istenenleri kaydet:
        localStorage.setItem("token", res.data.data.token);
        localStorage.setItem("role", res.data.data.role);

        // Rol bazlı yönlendirme:
        const userRole = res.data.data.role;
        if (userRole === "Admin") navigate("/admin/dashboard");
        else if (userRole === "Translator") navigate("/translator/dashboard");
        else navigate("/");
      }
    } catch (err) {
      alert("Hata: " + (err.response?.data?.message || "Giriş yapılamadı"));
    }
  };

  return (
    <div className="login-container">
      <h2>Giriş Yap</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Şifre"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Giriş</button>
      </form>
    </div>
  );
};

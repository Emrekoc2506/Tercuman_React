import React, { useState, useEffect } from "react";
import {
  getAdminUsers,
  changeUserRole,
  toggleUserActiveStatus,
} from "../../services/api";
import { 
  FaSearch, 
  FaUserEdit, 
  FaUserSlash, 
  FaUserCheck,
  FaFilter
} from "react-icons/fa";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getAdminUsers();
      if (data) {
        setUsers(data);
      }
    } catch (error) {
      console.warn("Gerçek kullanıcılar alınamadı, demo veriler yükleniyor.");
      // Demo Veri (UI Testi İçin)
      setUsers([
        { id: 1, fullName: "Ahmet Yılmaz", email: "ahmet@mail.com", role: "Admin", isActive: true },
        { id: 2, fullName: "Ayşe Demir", email: "ayse@mail.com", role: "Translator", isActive: true },
        { id: 3, fullName: "Mehmet Can", email: "mehmet@mail.com", role: "Customer", isActive: false },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await changeUserRole({ userId, role: newRole });
      fetchUsers();
    } catch (error) {
      alert("Hata: " + (error.response?.data?.message || "İşlem başarısız."));
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await toggleUserActiveStatus(id);
      fetchUsers();
    } catch (error) {
      alert("Hata: " + (error.response?.data?.message || "İşlem başarısız."));
    }
  };

  const filteredUsers = users.filter(user => 
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="section-title">
        <FaUserEdit /> Kullanıcı Yönetimi
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div style={{ 
        display: "flex", 
        gap: "20px", 
        marginBottom: "30px",
        background: "white",
        padding: "20px",
        borderRadius: "16px",
        boxShadow: "var(--card-shadow)"
      }}>
        <div style={{ position: "relative", flex: 1 }}>
          <FaSearch style={{ position: "absolute", left: "15px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input 
            type="text" 
            placeholder="İsim veya e-posta ile ara..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: "100%", 
              padding: "12px 12px 12px 45px", 
              borderRadius: "12px", 
              border: "1px solid #e2e8f0",
              outline: "none",
              fontSize: "0.95rem"
            }} 
          />
        </div>
        <button className="btn-modern" style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f1f5f9", color: "#475569" }}>
          <FaFilter /> Filtrele
        </button>
      </div>

      {/* MODERN TABLE */}
      <div style={{ 
        background: "white", 
        borderRadius: "20px", 
        boxShadow: "var(--card-shadow)",
        overflow: "hidden",
        border: "1px solid rgba(0,0,0,0.05)"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              <th style={thStyle}>Kullanıcı</th>
              <th style={thStyle}>Rol</th>
              <th style={thStyle}>Durum</th>
              <th style={thStyle}>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.2s" }} className="table-row-hover">
                <td style={tdStyle}>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontWeight: "600", color: "#1e293b" }}>{user.fullName}</span>
                    <span style={{ fontSize: "0.85rem", color: "#64748b" }}>{user.email}</span>
                  </div>
                </td>
                <td style={tdStyle}>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    style={{ 
                      padding: "8px 12px", 
                      borderRadius: "8px", 
                      border: "1px solid #e2e8f0",
                      background: "#fff",
                      fontSize: "0.9rem",
                      cursor: "pointer"
                    }}
                  >
                    <option value="Customer">Müşteri</option>
                    <option value="Translator">Çevirmen</option>
                    <option value="Admin">Yönetici</option>
                  </select>
                </td>
                <td style={tdStyle}>
                  <span
                    style={{
                      padding: "6px 12px",
                      borderRadius: "20px",
                      fontSize: "0.8rem",
                      fontWeight: "600",
                      background: user.isActive ? "#dcfce7" : "#fee2e2",
                      color: user.isActive ? "#166534" : "#991b1b",
                    }}
                  >
                    {user.isActive ? "Aktif" : "Pasif"}
                  </span>
                </td>
                <td style={tdStyle}>
                  <button
                    onClick={() => handleToggleActive(user.id)}
                    className="btn-modern"
                    style={{
                      padding: "8px 16px",
                      fontSize: "0.85rem",
                      background: user.isActive ? "#fee2e2" : "#dcfce7",
                      color: user.isActive ? "#ef4444" : "#22c55e",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    {user.isActive ? <><FaUserSlash /> Askıya Al</> : <><FaUserCheck /> Etkinleştir</>}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const thStyle = { padding: "18px 24px", color: "#475569", fontWeight: "600", fontSize: "0.9rem" };
const tdStyle = { padding: "18px 24px" };

export default UserManagement;

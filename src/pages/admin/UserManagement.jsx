import React, { useState, useEffect } from "react";
import {
  getAdminUsers,
  changeUserRole,
  toggleUserActiveStatus,
} from "../../services/api";

// ==============================================================================
// USER MANAGEMENT (KULLANICI YÖNETİMİ)
// ==============================================================================
// Admin'in tüm kullanıcıları gördüğü, rollerini değiştirebildiği
// ve hesaplarını aktif/pasif yapabildiği sayfa.

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await getAdminUsers();
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (error) {
      console.error("Kullanıcılar yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  // Rol Değiştirme Fonksiyonu
  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await changeUserRole({ userId, newRole });
      if (res.data.success) {
        alert("Kullanıcı rolü güncellendi.");
        fetchUsers(); // Listeyi yenile
      }
    } catch (error) {
      alert("Rol değişim hatası: " + (error.response?.data?.message || "Hata"));
    }
  };

  // Aktif/Pasif Yapma Fonksiyonu
  const handleToggleActive = async (id) => {
    try {
      const res = await toggleUserActiveStatus(id);
      if (res.data.success) {
        alert("Kullanıcı durumu değiştirildi.");
        fetchUsers();
      }
    } catch (error) {
      alert("Durum hatası: " + (error.response?.data?.message || "Hata"));
    }
  };

  if (loading) return <div>Kullanıcılar yükleniyor...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Kullanıcı Yönetimi</h1>

      <table
        border="1"
        cellPadding="10"
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "white",
        }}
      >
        <thead>
          <tr style={{ background: "#eee" }}>
            <th>Ad Soyad</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Durum</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.fullName}</td>
              <td>{user.email}</td>
              <td>
                {/* Rol Değiştirme Dropdown */}
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  style={{ padding: "5px" }}
                >
                  <option value="Customer">Müşteri</option>
                  <option value="Translator">Çevirmen</option>
                  <option value="Admin">Admin</option>
                </select>
              </td>
              <td>
                <span
                  style={{
                    padding: "5px 10px",
                    borderRadius: "15px",
                    background: user.isActive ? "#d4edda" : "#f8d7da",
                    color: user.isActive ? "#155724" : "#721c24",
                  }}
                >
                  {user.isActive ? "Aktif" : "Pasif"}
                </span>
              </td>
              <td>
                <button
                  onClick={() => handleToggleActive(user.id)}
                  style={{
                    padding: "5px 10px",
                    background: user.isActive ? "#dc3545" : "#28a745",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    borderRadius: "4px",
                  }}
                >
                  {user.isActive ? "Pasife Al" : "Aktif Yap"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;

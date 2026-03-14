import React, { useState, useEffect } from "react";
import { getAllReports, resolveReport } from "../../services/api";

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All"); // All | Pending | Resolved

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await getAllReports();
      setReports(res.data || []);
    } catch (error) {
      console.error("Raporlar yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleResolve = async (id) => {
    if (!window.confirm("Bu şikayeti çözüldü olarak işaretlemek istediğinize emin misiniz?")) return;

    try {
      await resolveReport(id);
      alert("Şikayet başarıyla çözüldü.");
      fetchReports(); // Listeyi yenile
    } catch (error) {
      console.error("Şikayet çözülürken hata:", error);
      alert("Bir hata oluştu.");
    }
  };

  const filteredReports = reports.filter(r => {
    if (filterStatus === "All") return true;
    return r.status === filterStatus;
  });

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🚩 Şikayet Yönetimi</h1>
        <div style={styles.filterBar}>
          <button 
            onClick={() => setFilterStatus("All")} 
            style={{...styles.filterBtn, backgroundColor: filterStatus === "All" ? "#007bff" : "#eee", color: filterStatus === "All" ? "#fff" : "#333"}}
          >
            Tümü
          </button>
          <button 
            onClick={() => setFilterStatus("Pending")} 
            style={{...styles.filterBtn, backgroundColor: filterStatus === "Pending" ? "#ffc107" : "#eee"}}
          >
            Bekleyenler
          </button>
          <button 
            onClick={() => setFilterStatus("Resolved")} 
            style={{...styles.filterBtn, backgroundColor: filterStatus === "Resolved" ? "#28a745" : "#eee", color: filterStatus === "Resolved" ? "#fff" : "#333"}}
          >
            Çözülenler
          </button>
        </div>
      </div>

      {loading ? (
        <div style={styles.loading}>Yükleniyor...</div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={styles.th}>İlan No</th>
                <th style={styles.th}>Sebep</th>
                <th style={styles.th}>Açıklama</th>
                <th style={styles.th}>Durum</th>
                <th style={styles.th}>Tarih</th>
                <th style={styles.th}>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report.id} style={styles.tr}>
                  <td style={styles.td}>TRC-{report.listingId}</td>
                  <td style={styles.td}><span style={styles.reasonBadge}>{report.reason}</span></td>
                  <td style={styles.td}>{report.description}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.statusBadge, 
                      backgroundColor: report.status === "Pending" ? "#fff3cd" : "#d4edda",
                      color: report.status === "Pending" ? "#856404" : "#155724"
                    }}>
                      {report.status === "Pending" ? "Bekliyor" : "Çözüldü"}
                    </span>
                  </td>
                  <td style={styles.td}>{new Date(report.createdDate).toLocaleDateString("tr-TR")}</td>
                  <td style={styles.td}>
                    {report.status === "Pending" && (
                      <button 
                        onClick={() => handleResolve(report.id)} 
                        style={styles.actionBtn}
                      >
                        ✅ Çözüldü
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan="6" style={styles.empty}>Henüz şikayet bulunmuyor.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
    flexWrap: "wrap",
    gap: "15px",
  },
  title: {
    margin: 0,
    fontSize: "1.5rem",
    color: "#333",
  },
  filterBar: {
    display: "flex",
    gap: "10px",
  },
  filterBtn: {
    padding: "8px 16px",
    borderRadius: "20px",
    border: "none",
    cursor: "pointer",
    fontWeight: "500",
    transition: "all 0.2s",
  },
  tableContainer: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "0.95rem",
  },
  thRow: {
    borderBottom: "2px solid #eee",
    textAlign: "left",
  },
  th: {
    padding: "15px",
    color: "#666",
    fontWeight: "600",
  },
  tr: {
    borderBottom: "1px solid #eee",
    transition: "background-color 0.2s",
    "&:hover": {
      backgroundColor: "#f9f9f9",
    },
  },
  td: {
    padding: "15px",
    color: "#444",
  },
  reasonBadge: {
    fontWeight: "500",
    color: "#d32f2f",
  },
  statusBadge: {
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "0.85rem",
    fontWeight: "600",
  },
  actionBtn: {
    padding: "6px 12px",
    borderRadius: "6px",
    border: "1px solid #28a745",
    backgroundColor: "transparent",
    color: "#28a745",
    cursor: "pointer",
    fontWeight: "500",
    transition: "all 0.2s",
    "&:hover": {
      backgroundColor: "#28a745",
      color: "#fff",
    },
  },
  loading: {
    textAlign: "center",
    padding: "50px",
    color: "#666",
  },
  empty: {
    textAlign: "center",
    padding: "30px",
    color: "#999",
    fontStyle: "italic",
  }
};

export default AdminReports;

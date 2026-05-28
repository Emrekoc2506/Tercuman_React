import React, { useState, useEffect } from "react";
import { getAllReports, resolveReport } from "../../services/api";
import { 
  FaFlag, 
  FaCheckCircle, 
  FaClock, 
  FaExclamationTriangle,
  FaRedo
} from "react-icons/fa";

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await getAllReports();
      setReports(data || []);
    } catch (error) {
      console.warn("Gerçek raporlar alınamadı, demo veriler yükleniyor.");
      setReports([
        { id: 1, listingId: 101, reason: "Hatalı Bilgi", description: "Tercüman profilindeki diller gerçeği yansıtmıyor.", status: "Pending", createdDate: new Date().toISOString() },
        { id: 2, listingId: 205, reason: "Spam", description: "Aynı ilan defalarca kopyalanmış.", status: "Resolved", createdDate: new Date().toISOString() },
      ]);
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
      fetchReports();
    } catch (error) {
      alert("Hata oluştu.");
    }
  };

  const filteredReports = reports.filter(r => {
    if (filterStatus === "All") return true;
    return r.status === filterStatus;
  });

  return (
    <div>
      <div className="section-title">
        <FaFlag style={{ color: "#ef4444" }} /> Şikayet Yönetimi
      </div>

      {/* FILTER BAR */}
      <div style={{ 
        display: "flex", 
        gap: "10px", 
        marginBottom: "30px",
        background: "white",
        padding: "15px",
        borderRadius: "16px",
        boxShadow: "var(--card-shadow)"
      }}>
        <button 
          onClick={() => setFilterStatus("All")} 
          className="btn-modern"
          style={{ 
            background: filterStatus === "All" ? "var(--primary-color)" : "#f1f5f9",
            color: filterStatus === "All" ? "white" : "#475569"
          }}
        >
          Tümü ({reports.length})
        </button>
        <button 
          onClick={() => setFilterStatus("Pending")} 
          className="btn-modern"
          style={{ 
            background: filterStatus === "Pending" ? "#fbbf24" : "#f1f5f9",
            color: filterStatus === "Pending" ? "white" : "#475569"
          }}
        >
          <FaClock /> Bekleyen
        </button>
        <button 
          onClick={() => setFilterStatus("Resolved")} 
          className="btn-modern"
          style={{ 
            background: filterStatus === "Resolved" ? "#22c55e" : "#f1f5f9",
            color: filterStatus === "Resolved" ? "white" : "#475569"
          }}
        >
          <FaCheckCircle /> Çözülen
        </button>
        <button onClick={fetchReports} className="btn-modern" style={{ background: "transparent", color: "#94a3b8", marginLeft: "auto" }}>
          <FaRedo /> Yenile
        </button>
      </div>

      {/* MODERN TABLE */}
      <div style={{ 
        background: "white", 
        borderRadius: "20px", 
        boxShadow: "var(--card-shadow)",
        overflow: "hidden"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              <th style={thStyle}>İlan No</th>
              <th style={thStyle}>Sebep / Detay</th>
              <th style={thStyle}>Durum</th>
              <th style={thStyle}>Tarih</th>
              <th style={thStyle}>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((report) => (
              <tr key={report.id} style={{ borderBottom: "1px solid #f1f5f9" }} className="table-row-hover">
                <td style={tdStyle}>
                  <span style={{ fontWeight: "600", color: "var(--primary-color)" }}>#TRC-{report.listingId}</span>
                </td>
                <td style={tdStyle}>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontWeight: "600", color: "#ef4444", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "5px" }}>
                      <FaExclamationTriangle /> {report.reason}
                    </span>
                    <span style={{ fontSize: "0.9rem", color: "#475569", marginTop: "4px" }}>{report.description}</span>
                  </div>
                </td>
                <td style={tdStyle}>
                  <span style={{
                    padding: "6px 12px",
                    borderRadius: "20px",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    background: report.status === "Pending" ? "#fef3c7" : "#dcfce7",
                    color: report.status === "Pending" ? "#92400e" : "#166534",
                  }}>
                    {report.status === "Pending" ? "İnceleniyor" : "Çözüldü"}
                  </span>
                </td>
                <td style={tdStyle}>
                  <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                    {new Date(report.createdDate).toLocaleDateString("tr-TR")}
                  </span>
                </td>
                <td style={tdStyle}>
                  {report.status === "Pending" && (
                    <button 
                      onClick={() => handleResolve(report.id)} 
                      className="btn-modern"
                      style={{ 
                        padding: "6px 12px", 
                        fontSize: "0.8rem", 
                        background: "rgba(34, 197, 94, 0.1)", 
                        color: "#22c55e",
                        border: "1px solid #22c55e"
                      }}
                    >
                      Kapat
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filteredReports.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: "40px", textAlign: "center", color: "#94a3b8", fontStyle: "italic" }}>
                  Henüz bir rapor kaydı bulunmuyor.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const thStyle = { padding: "18px 20px", color: "#475569", fontWeight: "600", fontSize: "0.9rem" };
const tdStyle = { padding: "18px 20px" };

export default AdminReports;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CRMSidebar from "../components/CRMSidebar";

export default function CRMProspects() {
  const navigate = useNavigate();

  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = "https://localhost:7274/api/leads";

  const fetchProspects = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail ||
            errorData.message ||
            `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      setProspects(data);
    } catch (err) {
      console.error("Failed to fetch prospects:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProspects();
  }, []);

  const getStatusIndicator = (status) => {
    switch (status) {
      case "Needs Action":
      case "New":
        return <span className="text-primary fw-bold">🔵</span>;
      case "Contacted":
      case "Qualified":
        return <span className="text-success fw-bold">🟢</span>;
      case "Untouched":
        return <span className="text-warning fw-bold">🟠</span>;
      // "Needs Action" is duplicated, assuming the last one is for a specific meaning or perhaps a typo.
      // If it means "Urgent Action", you might want a different color/emoji.
      case "Needs Action": // This will override the first "Needs Action" if it's placed after it.
        return <span className="text-danger fw-bold">🔴</span>;
      default:
        return null;
    }
  };

  const handleAddProspect = () => {
    navigate("/crm-prospect-form");
  };

  const handleEditProspect = (leadID) => {
    navigate(`/crm-prospect-form/${leadID}`);
  };

  // New handler for viewing prospect details
  const handleViewProspectDetail = (leadID) => {
    navigate(`/crm-prospect-detail/${leadID}`);
  };

  const handleDeleteProspect = async (leadID) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบลูกค้ามุ่งหวัง ID: ${leadID} ?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${leadID}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.message || 'Failed to delete lead.');
      }

      setProspects(prevProspects => prevProspects.filter(p => p.leadID !== leadID));
      alert("ลบลูกค้ามุ่งหวังสำเร็จแล้ว!");

    } catch (err) {
      console.error("Error deleting prospect:", err);
      alert(`เกิดข้อผิดพลาดในการลบ: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh", background: "#f3f7fb" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="ms-2">กำลังโหลดข้อมูลลูกค้ามุ่งหวัง...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center flex-column" style={{ minHeight: "100vh", background: "#f3f7fb" }}>
        <p className="text-danger mb-2">ข้อผิดพลาดในการโหลดข้อมูล: {error}</p>
        <button className="btn btn-primary" onClick={() => fetchProspects()}>ลองอีกครั้ง</button>
      </div>
    );
  }

  return (
    <div className="d-flex" style={{ minHeight: "100vh", background: "#f3f7fb" }}>
      <CRMSidebar className="flex-shrink-0" />

      <div className="flex-grow-1 d-flex flex-column" style={{ maxHeight: "100vh" }}>
        <div className="container-fluid py-4 px-4 flex-shrink-0" style={{ background: "#f3f7fb", zIndex: 1 }}>
          <h4 className="fw-bold mb-4" style={{ color: "#8a2be2" }}>🎯 ลูกค้ามุ่งหวัง</h4>

          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="input-group" style={{ maxWidth: "500px" }}>
              <input
                type="text"
                className="form-control rounded-start-3"
                placeholder="ค้นหาลูกค้ามุ่งหวัง..."
                style={{ borderColor: "#c2e9fb" }}
              />
              <button
                className="btn btn-outline-secondary rounded-end-3"
                type="button"
                style={{ borderColor: "#c2e9fb", color: "#6a5acd" }}
              >
                🔍
              </button>
            </div>

            <button
              className="btn btn-lg px-4 py-2 rounded-3 shadow-sm btn-hover-scale"
              style={{
                background: "linear-gradient(45deg, #a1c4fd, #c2e9fb)",
                borderColor: "#a1c4fd",
                color: "#36454F",
                transition: "all 0.3s ease",
              }}
              onClick={handleAddProspect}
            >
              ➕ เพิ่มลูกค้ามุ่งหวังใหม่
            </button>
          </div>
        </div>

        <div
          className="card p-4 shadow-lg rounded-4 border-0 fade-in flex-grow-1 overflow-auto mx-4 mb-4"
          style={{ backgroundColor: "#fdfdff" }}
        >
          {prospects.length === 0 ? (
            <p className="text-center text-muted">ไม่พบข้อมูลลูกค้ามุ่งหวัง</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr style={{ background: "#e0eaff" }}>
                    <th scope="col" className="text-center" style={{ color: "#6a5acd" }}>
                      <input type="checkbox" />
                    </th>
                    <th scope="col" style={{ color: "#6a5acd" }}>ชื่อลูกค้ามุ่งหวัง</th>
                    <th scope="col" style={{ color: "#6a5acd" }}>บริษัท</th>
                    <th scope="col" style={{ color: "#6a5acd" }}>อีเมล</th>
                    <th scope="col" style={{ color: "#6a5acd" }}>โทรศัพท์</th>
                    <th scope="col" style={{ color: "#6a5acd" }}>แหล่งที่มาลูกค้ามุ่งหวัง</th>
                    <th scope="col" style={{ color: "#6a5acd" }}>เจ้าของลูกค้ามุ่งหวัง</th>
                    <th scope="col" className="text-center" style={{ color: "#6a5acd" }}>สถานะ</th>
                    <th scope="col" className="text-center" style={{ color: "#6a5acd" }}>จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {prospects.map((prospect) => (
                    <tr
                      key={prospect.leadID}
                      className="table-row-hover-effect"
                      style={{ transition: "all 0.3s ease", cursor: "pointer" }} // Add cursor pointer for better UX
                    >
                      {/* Wrap the content of the row in a div and add an onClick handler */}
                      <td className="text-center" onClick={() => handleViewProspectDetail(prospect.leadID)}>
                        <input type="checkbox" onClick={(e) => e.stopPropagation()} /> {/* Stop propagation to prevent row click when checkbox is clicked */}
                      </td>
                      <td onClick={() => handleViewProspectDetail(prospect.leadID)}>{prospect.firstName} {prospect.lastName}</td>
                      <td onClick={() => handleViewProspectDetail(prospect.leadID)}>{prospect.companyName}</td>
                      <td onClick={() => handleViewProspectDetail(prospect.leadID)}>{prospect.email}</td>
                      <td onClick={() => handleViewProspectDetail(prospect.leadID)}>{prospect.phone}</td>
                      <td onClick={() => handleViewProspectDetail(prospect.leadID)}>{prospect.leadSource}</td>
                      <td onClick={() => handleViewProspectDetail(prospect.leadID)}>{prospect.owner}</td>
                      <td className="text-center" onClick={() => handleViewProspectDetail(prospect.leadID)}>{getStatusIndicator(prospect.leadStatus)}</td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-outline-primary me-2 rounded-2 btn-icon-hover"
                          style={{ borderColor: "#b0c4de", color: "#6a5acd" }}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row click when edit button is clicked
                            handleEditProspect(prospect.leadID);
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger rounded-2 btn-icon-hover"
                          style={{ borderColor: "#ffb6c1", color: "#f08080" }}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row click when delete button is clicked
                            handleDeleteProspect(prospect.leadID);
                          }}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
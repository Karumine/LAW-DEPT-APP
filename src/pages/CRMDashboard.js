import React from "react";

export default function CRMDashboard() {
  const statBoxStyle = {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
    minHeight: "100px",
    textAlign: "center",
  };

  const emptyCardStyle = {
    background: "#f9f9fc",
    borderRadius: "12px",
    padding: "40px",
    minHeight: "250px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#888",
    border: "2px dashed #ddd",
  };

  return (
    <div className="container-fluid py-4" style={{ background: "#f3f7fb", minHeight: "100vh" }}>
      <h4 className="fw-bold mb-4">📊 CRM Dashboard</h4>

      {/* Top Summary Row */}
      <div className="row g-4 mb-4">
        {[
          { label: "ข้อเสนอ ที่เปิดอยู่ของฉัน", value: 0 },
          { label: "ข้อเสนอ ที่ยังไม่ได้ติดต่อของฉัน", value: 0 },
          { label: "การโทร วันนี้ของฉัน", value: 0 },
          { label: "ลูกค้ามุ่งหวัง ของฉัน", value: 0 },
        ].map((item, idx) => (
          <div className="col-md-3" key={idx}>
            <div style={statBoxStyle}>
              <div className="text-muted small mb-1">{item.label}</div>
              <div className="fs-3 fw-bold">{item.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Section: งาน + การประชุม */}
      <div className="row g-4">
        <div className="col-md-6">
          <h6 className="mb-2">🗂️ งาน ที่เปิดอยู่ของฉัน</h6>
          <div style={emptyCardStyle}>
            <div>
              <i className="bi bi-table" style={{ fontSize: "2rem", opacity: 0.2 }}></i>
              <div className="mt-2">ไม่พบ งาน</div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <h6 className="mb-2">🗓️ การประชุม ของฉัน</h6>
          <div style={emptyCardStyle}>
            <div>
              <i className="bi bi-calendar-event" style={{ fontSize: "2rem", opacity: 0.2 }}></i>
              <div className="mt-2">ไม่พบ การประชุม</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

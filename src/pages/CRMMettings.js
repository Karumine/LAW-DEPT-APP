import React from 'react';
import CRMSidebar from '../components/CRMSidebar'; // Adjust path if necessary

export default function CRMMettings() { // <--- ตรวจสอบชื่อคอมโพเนนต์ให้ตรงกับชื่อไฟล์
  return (
    <div className="d-flex" style={{ minHeight: "100vh", background: "#f3f7fb" }}>
      <CRMSidebar />
      <div className="flex-grow-1 d-flex flex-column p-4">
        <h2 className="fw-bold" style={{ color: "#8a2be2" }}>การประชุม</h2>
        <div className="card shadow-lg rounded-4 border-0 p-4 mt-4" style={{ backgroundColor: "#fdfdff" }}>
          <p className="text-muted">หน้ารายการการประชุมจะแสดงที่นี่</p>
          {/* Add your meetings list/table and functionality here */}
        </div>
      </div>
    </div>
  );
}

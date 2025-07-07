import React from "react";
import LawSidebar from "../components/LawSidebar"; // Import the LawSidebar component for the legal role

export default function LawDashboard() {
  return (
    <div className="d-flex" style={{ minHeight: "100vh", background: "#f0f8ff" }}> {/* Pastel blue background, consistent with other pages */}
      <LawSidebar /> {/* Render the LawSidebar component */}
      <div className="flex-grow-1 p-4 d-flex flex-column align-items-center"> {/* Main content area, centered */}
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="fw-bold" style={{ color: "#8a2be2", textShadow: "1px 1px 3px rgba(0,0,0,0.1)" }}>
              🏛️ แดชบอร์ดฝ่ายกฎหมาย
            </h2>
            <p className="text-muted">
              ภาพรวมและสถานะงานสำคัญสำหรับฝ่ายกฎหมาย
            </p>
          </div>

          <div className="row justify-content-center g-4"> {/* Added gap between columns */}
            {/* Card 1: สัญญาที่ต้องตรวจสอบ (Contracts to Review) */}
            <div className="col-md-6 col-lg-5">
              <div
                className="card p-4 shadow-lg rounded-4 border-0 card-hover-effect"
                style={{ backgroundColor: "#fdfdff", transition: "all 0.3s ease" }}
              >
                <div className="card-body">
                  <h5 className="card-title mb-3" style={{ color: "#6a5acd" }}>📜 สัญญาที่ต้องตรวจสอบ</h5>
                  <p className="text-muted mb-4">
                    รายการสัญญาที่รอการตรวจสอบและอนุมัติจากฝ่ายกฎหมาย
                  </p>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fs-3 fw-bold" style={{ color: "#8a2be2" }}>5</span>
                    <button
                      className="btn btn-sm px-4 py-2 rounded-3 shadow"
                      style={{
                        background: "linear-gradient(45deg, #b0e0e6, #add8e6)", // Pastel blue gradient
                        borderColor: "#b0e0e6",
                        color: "#36454F",
                        transition: "all 0.3s ease",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                      }}
                    >
                      ดูรายละเอียด
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: เอกสารที่รออนุมัติ (Documents Awaiting Approval) */}
            <div className="col-md-6 col-lg-5">
              <div
                className="card p-4 shadow-lg rounded-4 border-0 card-hover-effect"
                style={{ backgroundColor: "#fdfdff", transition: "all 0.3s ease" }}
              >
                <div className="card-body">
                  <h5 className="card-title mb-3" style={{ color: "#6a5acd" }}>📄 เอกสารที่รออนุมัติ</h5>
                  <p className="text-muted mb-4">
                    เอกสารต่างๆ ที่รอการลงนามหรืออนุมัติจากฝ่ายกฎหมาย
                  </p>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fs-3 fw-bold" style={{ color: "#8a2be2" }}>8</span>
                    <button
                      className="btn btn-sm px-4 py-2 rounded-3 shadow"
                      style={{
                        background: "linear-gradient(45deg, #ffe4e1, #ffc0cb)", // Pastel pink gradient
                        borderColor: "#ffe4e1",
                        color: "#36454F",
                        transition: "all 0.3s ease",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                      }}
                    >
                      ดูรายละเอียด
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: สรุปสถานะเคส (Case Status Summary) */}
            <div className="col-md-6 col-lg-5">
              <div
                className="card p-4 shadow-lg rounded-4 border-0 card-hover-effect"
                style={{ backgroundColor: "#fdfdff", transition: "all 0.3s ease" }}
              >
                <div className="card-body">
                  <h5 className="card-title mb-3" style={{ color: "#6a5acd" }}>📊 สรุปสถานะเคส</h5>
                  <p className="text-muted mb-4">
                    ภาพรวมสถานะของเคสทางกฎหมายที่กำลังดำเนินการอยู่
                  </p>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fs-3 fw-bold" style={{ color: "#8a2be2" }}>3</span>
                    <button
                      className="btn btn-sm px-4 py-2 rounded-3 shadow"
                      style={{
                        background: "linear-gradient(45deg, #98fb98, #90ee90)", // Pastel green gradient
                        borderColor: "#98fb98",
                        color: "#36454F",
                        transition: "all 0.3s ease",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                      }}
                    >
                      ดูรายละเอียด
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4: การแจ้งเตือนและข้อกำหนด (Alerts & Regulations) */}
            <div className="col-md-6 col-lg-5">
              <div
                className="card p-4 shadow-lg rounded-4 border-0 card-hover-effect"
                style={{ backgroundColor: "#fdfdff", transition: "all 0.3s ease" }}
              >
                <div className="card-body">
                  <h5 className="card-title mb-3" style={{ color: "#6a5acd" }}>🔔 การแจ้งเตือนและข้อกำหนด</h5>
                  <p className="text-muted mb-4">
                    แจ้งเตือนเกี่ยวกับกฎหมายใหม่หรือข้อกำหนดที่สำคัญ
                  </p>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fs-3 fw-bold" style={{ color: "#8a2be2" }}>2</span>
                    <button
                      className="btn btn-sm px-4 py-2 rounded-3 shadow"
                      style={{
                        background: "linear-gradient(45deg, #e6e6fa, #d8bfd8)", // Lavender pastel gradient
                        borderColor: "#e6e6fa",
                        color: "#36454F",
                        transition: "all 0.3s ease",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                      }}
                    >
                      ดูรายละเอียด
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div> {/* End row */}
        </div> {/* End container */}
      </div> {/* End main content area */}
      {/* Custom CSS for card hover effect - Re-added for consistency, assuming it's not global */}
      <style>
        {`
        .sidebar-link:hover {
          background-color: rgba(255, 255, 255, 0.2); /* Lighter hover effect */
          transform: translateX(5px); /* Slide effect on hover */
        }

        .active-sidebar-link {
          background: linear-gradient(45deg, #6a5acd, #8a2be2); /* Stronger, distinct active gradient */
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Shadow for active link */
          transform: scale(1.02); /* Slightly enlarge active link */
          border: 1px solid rgba(255,255,255,0.5); /* Border for active link */
        }

        .active-sidebar-link:hover {
          background: linear-gradient(45deg, #5a4ac0, #7a1be0); /* A darker, more distinct gradient on hover */
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4); /* Much more pronounced shadow */
          transform: scale(1.05); /* More noticeable enlargement */
        }

        /* Optional: Add Bootstrap Icons CDN if not already in index.html */
        @import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css");
        `}
      </style>
    </div>
  );
}

import React from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar"; // Import the Sidebar component for the left-hand navigation

export default function PODashboard() {
  const navigate = useNavigate();

  return (
    <div className="d-flex" style={{ minHeight: "100vh", background: "#f0f8ff" }}> {/* Pastel blue background */}
      <Sidebar /> {/* Render the Sidebar component */}
      <div className="flex-grow-1 p-4 d-flex flex-column align-items-center"> {/* Main content area, centered */}
        <div className="container py-5">
          <h2 className="text-center mb-5 fw-bold" style={{ color: "#8a2be2", textShadow: "1px 1px 3px rgba(0,0,0,0.1)" }}>
            🏗️ Has Hire Purchase / Leasing
          </h2> {/* Pastel purple heading with subtle shadow */}

          {/* เลือกใบเสนอราคา Card */}
          <div
            className="card mb-4 shadow-lg border-0 card-hover-effect" // Added card-hover-effect class
            style={{ backgroundColor: "#fdfdff", borderRadius: "20px", transition: "all 0.3s ease" }} // Lighter pastel background for card, more rounded
          >
            <div className="card-body p-4">
              <h5 className="card-title mb-3" style={{ color: "#6a5acd" }}>🔽 Select Quotation for Creating PO Doc.</h5> {/* Pastel purple title */}
              <p className="text-muted mb-4">
                เลือกใบเสนอราคาที่ต้องการเพื่อใช้ในการออกเอกสารใบสั่งซื้อ (PO)
              </p>
              <button
                className="btn btn-lg w-100" // Larger button, full width
                style={{
                  background: "linear-gradient(45deg, #b0e0e6, #add8e6)", // Pastel blue gradient
                  borderColor: "#b0e0e6",
                  color: "#36454F",
                  borderRadius: "10px", // More rounded button
                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                  transition: "all 0.3s ease",
                }}
                onClick={() => navigate("/po-create")} // Navigate to PO creation page
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 6px 12px rgba(0,0,0,0.2)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
                }}
              >
                ➕ เลือกใบเสนอราคา
              </button>
            </div>
          </div>

          {/* สร้าง PR จาก Quotation + PDF Card */}
          <div
            className="card shadow-lg border-0 card-hover-effect" // Added card-hover-effect class
            style={{ backgroundColor: "#fdfdff", borderRadius: "20px", transition: "all 0.3s ease" }} // Lighter pastel background for card, more rounded
          >
            <div className="card-body p-4">
              <h5 className="card-title mb-3" style={{ color: "#6a5acd" }}>📝 Create PR & Auto Fill In Quotation Info</h5> {/* Pastel purple title */}
              <p className="text-muted mb-4">
                ระบบจะดึงข้อมูลจากใบเสนอราคามากรอกให้อัตโนมัติในใบขอซื้อ (PR) และสามารถแปลงเป็น PDF ได้
              </p>
              <div className="d-flex justify-content-center gap-3"> {/* Centered buttons with gap */}
                <button
                  className="btn btn-lg flex-fill" // Larger button, fills available space
                  style={{
                    background: "linear-gradient(45deg, #98fb98, #90ee90)", // Pastel green gradient
                    borderColor: "#98fb98",
                    color: "#36454F",
                    borderRadius: "10px",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                    transition: "all 0.3s ease",
                  }}
                  onClick={() => navigate("/pr-form")} // Navigate to PR form page
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow = "0 6px 12px rgba(0,0,0,0.2)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
                  }}
                >
                  สร้าง PR
                </button>
                <button
                  className="btn btn-lg flex-fill" // Larger button, fills available space
                  style={{
                    background: "linear-gradient(45deg, #ffe4e1, #ffc0cb)", // Pastel pink gradient
                    borderColor: "#ffe4e1",
                    color: "#36454F",
                    borderRadius: "10px",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                    transition: "all 0.3s ease",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow = "0 6px 12px rgba(0,0,0,0.2)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
                  }}
                >
                  แปลงเป็น PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Custom CSS for card hover effect */}
      <style>
        {`
        .card-hover-effect:hover {
          transform: translateY(-5px); /* Lift card on hover */
          box-shadow: 0 8px 16px rgba(0,0,0,0.2); /* More pronounced shadow */
        }
        `}
      </style>
    </div>
  );
}

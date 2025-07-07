import React from "react";
import LawSidebar from "../components/LawSidebar"; // Import the LawSidebar component for the legal role
import { useNavigate } from "react-router-dom";

export default function QuotationInfo() {
const navigate = useNavigate();
const handleGoBack = () => {
  navigate(-1); 
};


  return (
    <div className="d-flex" style={{ minHeight: "100vh", background: "#f0f8ff" }}> {/* Pastel blue background, consistent with other pages */}
      <LawSidebar /> {/* Render the LawSidebar component */}
      <div className="flex-grow-1 p-4 d-flex flex-column align-items-center"> {/* Main content area, centered */}
        <div className="container py-5">
          
              <button
                className="btn btn-sm px-3 py-2 rounded-3 shadow-sm btn-hover-back"
                style={{
                  background: "linear-gradient(45deg, #add8e6, #87ceeb)", // Light blue pastel gradient
                  borderColor: "#add8e6",
                  color: "#36454F",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
                onClick={handleGoBack}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateX(-3px)";
                  e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateX(0)";
                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                }}
              >
                ⬅️ กลับหน้าหลัก
              </button>
          <div className="text-center mb-5">
            <h2 className="fw-bold" style={{ color: "#8a2be2", textShadow: "1px 1px 3px rgba(0,0,0,0.1)" }}>
              📝 กรอกข้อมูลใบเสนอราคา
            </h2>
            <p className="text-muted">
              (หน้าสำหรับฝ่ายกฎหมายใช้ตรวจสอบและเพิ่มข้อมูลใบเสนอราคา)
            </p>
          </div>

          <div className="row justify-content-center">
            <div className="col-md-9 col-lg-8"> {/* Adjusted column width for wider form */}
              <div
                className="card p-4 shadow-lg rounded-4 border-0 card-hover-effect" // Added card-hover-effect class
                style={{ backgroundColor: "#fdfdff", transition: "all 0.3s ease" }} // Lighter pastel background for card, more rounded
              >
                {/* Input Fields for Quotation Information */}
                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ color: "#6a5acd" }}>📄 เลขที่ใบเสนอราคา</label>
                  <input type="text" className="form-control rounded-3" placeholder="QT-YYYY-XXX" style={{ borderColor: "#c2e9fb" }} />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ color: "#6a5acd" }}>🏢 ชื่อผู้ขาย</label>
                  <input type="text" className="form-control rounded-3" placeholder="บริษัท ตัวอย่าง จำกัด" style={{ borderColor: "#c2e9fb" }} />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ color: "#6a5acd" }}>🧾 รายการสินค้า/บริการ</label>
                  <input type="text" className="form-control rounded-3" placeholder="เครื่องจักร CNC รุ่น X200" style={{ borderColor: "#c2e9fb" }} />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ color: "#6a5acd" }}>🔢 จำนวน</label>
                  <input type="number" className="form-control rounded-3" placeholder="1" style={{ borderColor: "#c2e9fb" }} />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ color: "#6a5acd" }}>💰 ราคาต่อหน่วย (บาท)</label>
                  <input type="number" className="form-control rounded-3" placeholder="350000.00" style={{ borderColor: "#c2e9fb" }} />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ color: "#6a5acd" }}>📅 วันที่ออกใบเสนอราคา</label>
                  <input type="date" className="form-control rounded-3" style={{ borderColor: "#c2e9fb" }} />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ color: "#6a5acd" }}>🗓️ วันที่หมดอายุใบเสนอราคา</label>
                  <input type="date" className="form-control rounded-3" style={{ borderColor: "#c2e9fb" }} />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ color: "#6a5acd" }}>📜 เงื่อนไขการชำระเงิน</label>
                  <textarea className="form-control rounded-3" rows="3" placeholder="เช่น ชำระ 30 วันหลังวางบิล" style={{ borderColor: "#c2e9fb" }}></textarea>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ color: "#6a5acd" }}>👤 ผู้ติดต่อ</label>
                  <input type="text" className="form-control rounded-3" placeholder="ชื่อผู้ติดต่อ" style={{ borderColor: "#c2e9fb" }} />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ color: "#6a5acd" }}>📞 เบอร์โทรศัพท์</label>
                  <input type="tel" className="form-control rounded-3" placeholder="08XXXXXXXX" style={{ borderColor: "#c2e9fb" }} />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ color: "#6a5acd" }}>📧 อีเมล</label>
                  <input type="email" className="form-control rounded-3" placeholder="contact@example.com" style={{ borderColor: "#c2e9fb" }} />
                </div>

                {/* ปุ่มบันทึกข้อมูล */}
                <div className="text-center mt-4">
                  <button
                    className="btn btn-lg px-5 py-2 rounded-3 shadow"
                    style={{
                      background: "linear-gradient(45deg, #98fb98, #90ee90)", // Pastel green gradient
                      borderColor: "#98fb98",
                      color: "#36454F",
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
                    💾 บันทึกข้อมูล
                  </button>
                </div>
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

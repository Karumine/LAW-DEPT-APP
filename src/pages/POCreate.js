import React from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar"; // Import the Sidebar component for the left-hand navigation

export default function POCreate() {
    const navigate = useNavigate();
    const goBack = () => {
        window.history.back(); // Go back to the previous page
    };

    return (
        <div className="d-flex" style={{ minHeight: "100vh", background: "#f0f8ff" }}> {/* Pastel blue background, consistent with Dashboard */}
            <Sidebar /> {/* Render the Sidebar component */}
            <div className="flex-grow-1 p-4 d-flex flex-column align-items-center"> {/* Main content area, centered */}
                <div className="container py-5">
                    <div className="text-center mb-5">
                        <h2 className="fw-bold" style={{ color: "#8a2be2", textShadow: "1px 1px 3px rgba(0,0,0,0.1)" }}>📝 Fill In Important Info To Create PO Doc.</h2>
                        <p className="text-muted">
                            กรอกข้อมูลสำคัญจากใบเสนอราคาเพื่อสร้างเอกสารใบสั่งซื้อ (PO)
                        </p>
                    </div>

                    <div className="row justify-content-center">
                        <div className="col-md-8 col-lg-7"> {/* Increased column width slightly for better form appearance */}
                            <div
                                className="card p-4 shadow-lg rounded-4 border-0"
                                style={{ backgroundColor: "#fdfdff", transition: "all 0.3s ease" }} // Lighter pastel background for card, more rounded
                            >
                                {/* Input Fields */}
                                <div className="mb-3">
                                    <label className="form-label fw-semibold" style={{ color: "#6a5acd" }}>📄 เลขที่ใบเสนอราคา</label>
                                    <input type="text" className="form-control rounded-3" placeholder="QT-2025-001" style={{ borderColor: "#c2e9fb" }} />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-semibold" style={{ color: "#6a5acd" }}>🏢 ชื่อผู้ขาย</label>
                                    <input type="text" className="form-control rounded-3" placeholder="บริษัท สมาร์ทแมชชีน จำกัด" style={{ borderColor: "#c2e9fb" }} />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-semibold" style={{ color: "#6a5acd" }}>🧾 รายการสินค้า</label>
                                    <input type="text" className="form-control rounded-3" placeholder="เครื่องจักร CNC รุ่น X200" style={{ borderColor: "#c2e9fb" }} />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-semibold" style={{ color: "#6a5acd" }}>🔢 จำนวน</label>
                                    <input type="number" className="form-control rounded-3" placeholder="1" style={{ borderColor: "#c2e9fb" }} />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-semibold" style={{ color: "#6a5acd" }}>💰 ราคาต่อหน่วย (บาท)</label>
                                    <input type="number" className="form-control rounded-3" placeholder="350000" style={{ borderColor: "#c2e9fb" }} />
                                </div>

                                {/* ปุ่มสร้าง PO */}
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
                                        ✅ สร้างใบสั่งซื้อ (PO)
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

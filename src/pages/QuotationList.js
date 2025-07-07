import React from "react";
import LawSidebar from "../components/LawSidebar"; // Assuming this is your sidebar
import { useNavigate } from "react-router-dom";

export default function QuotationList() {
  // Mock data for demonstration. In a real app, you'd fetch this from an API.
const navigate = useNavigate();


  const quotations = [
    {
      id: "QT-2024-001",
      seller: "บริษัท นวัตกรรม จำกัด",
      item: "ระบบควบคุมอัจฉริยะ",
      quantity: 1,
      unitPrice: 150000.00,
      issueDate: "2024-06-25",
      expiryDate: "2024-07-25",
      status: "Approved",
    },
    {
      id: "QT-2024-002",
      seller: "บริษัท เทคโนโลยีล้ำหน้า จำกัด",
      item: "บริการให้คำปรึกษา AI",
      quantity: 1,
      unitPrice: 80000.00,
      issueDate: "2024-06-28",
      expiryDate: "2024-07-28",
      status: "Pending",
    },
    {
      id: "QT-2024-003",
      seller: "ร้านค้าวัสดุก่อสร้าง ABCD",
      item: "เหล็กเส้น 10 มม.",
      quantity: 100,
      unitPrice: 150.00,
      issueDate: "2024-06-20",
      expiryDate: "2024-07-05",
      status: "Expired",
    },
    {
      id: "QT-2024-004",
      seller: "บริษัท ซอฟต์แวร์โซลูชั่น จำกัด",
      item: "พัฒนา Mobile App",
      quantity: 1,
      unitPrice: 500000.00,
      issueDate: "2024-07-01",
      expiryDate: "2024-07-31",
      status: "Approved",
    },
  ];

  // Function to determine badge color based on status
  const getStatusBadge = (status) => {
    switch (status) {
      case "Approved":
        return <span className="badge bg-success-subtle text-success border border-success-subtle">✅ อนุมัติแล้ว</span>;
      case "Pending":
        return <span className="badge bg-warning-subtle text-warning border border-warning-subtle">⏳ รอดำเนินการ</span>;
      case "Expired":
        return <span className="badge bg-danger-subtle text-danger border border-danger-subtle">🔴 หมดอายุ</span>;
      default:
        return <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle">Unknown</span>;
    }
  };


  // Handler for adding new quotation
  const handleAddNewQuotation = () => {
    // Navigate to the QuotationInfo page
    navigate("/quotation-info");
  };


  
  return (
    <div className="d-flex" style={{ minHeight: "100vh", background: "#f0f8ff" }}>
      {" "}
      {/* Pastel blue background */}
      <LawSidebar /> {/* Render the LawSidebar component */}
      <div className="flex-grow-1 p-4 d-flex flex-column align-items-center">
        {" "}
        {/* Main content area */}
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="fw-bold" style={{ color: "#8a2be2", textShadow: "1px 1px 3px rgba(0,0,0,0.1)" }}>
              📋 รายการใบเสนอราคา
            </h2>
            <p className="text-muted">
              (หน้าสำหรับฝ่ายกฎหมายใช้ดูและจัดการข้อมูลใบเสนอราคา)
            </p>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-4">
            {/* Search Bar */}
            <div className="input-group" style={{ maxWidth: "400px" }}>
              <input
                type="text"
                className="form-control rounded-start-3"
                placeholder="ค้นหาเลขที่, ผู้ขาย, รายการ..."
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

            {/* Add New Quotation Button */}
            <button
            className="btn btn-lg px-4 py-2 rounded-3 shadow-sm btn-hover-scale" // Added btn-hover-scale for animation
            style={{
              background: "linear-gradient(45deg, #98fb98, #66cdaa)", // Pastel green gradient
              borderColor: "#98fb98",
              color: "#36454F",
              transition: "all 0.3s ease",
            }}
            onClick={handleAddNewQuotation} // This now correctly navigates to /quotation-info
          >
            ✨ เพิ่มใบเสนอราคาใหม่
          </button>
          </div>

          {/* Quotation List Table */}
          <div
            className="card p-4 shadow-lg rounded-4 border-0 fade-in" // Added fade-in class
            style={{ backgroundColor: "#fdfdff" }}
          >
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr style={{ background: "#e0eaff" }}>
                    <th scope="col" className="text-center" style={{ color: "#6a5acd" }}>เลขที่</th>
                    <th scope="col" style={{ color: "#6a5acd" }}>ผู้ขาย</th>
                    <th scope="col" style={{ color: "#6a5acd" }}>รายการ</th>
                    <th scope="col" className="text-center" style={{ color: "#6a5acd" }}>จำนวน</th>
                    <th scope="col" className="text-end" style={{ color: "#6a5acd" }}>ราคารวม (บาท)</th>
                    <th scope="col" className="text-center" style={{ color: "#6a5acd" }}>วันที่ออก</th>
                    <th scope="col" className="text-center" style={{ color: "#6a5acd" }}>สถานะ</th>
                    <th scope="col" className="text-center" style={{ color: "#6a5acd" }}>จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {quotations.map((q) => (
                    <tr
                      key={q.id}
                      className="table-row-hover-effect" // Custom class for row hover
                      style={{ transition: "all 0.3s ease" }}
                    >
                      <td className="text-center">
                        <a href={`/quotations/${q.id}`} style={{ color: "#8a2be2", textDecoration: "none" }}>
                          {q.id}
                        </a>
                      </td>
                      <td>{q.seller}</td>
                      <td>{q.item}</td>
                      <td className="text-center">{q.quantity}</td>
                      <td className="text-end">{(q.quantity * q.unitPrice).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="text-center">{q.issueDate}</td>
                      <td className="text-center">{getStatusBadge(q.status)}</td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-outline-primary me-2 rounded-2 btn-icon-hover"
                          style={{ borderColor: "#b0c4de", color: "#6a5acd" }}
                          onClick={() => alert(`Edit ${q.id}`)}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger rounded-2 btn-icon-hover"
                          style={{ borderColor: "#ffb6c1", color: "#f08080" }}
                          onClick={() => alert(`Delete ${q.id}`)}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for Animations */}
      <style>
        {`
          .btn-hover-scale:hover {
            transform: scale(1.03);
            box-shadow: 0 6px 12px rgba(0,0,0,0.15) !important;
          }

          .table-row-hover-effect:hover {
            background-color: #f5faff !important; /* Lighter highlight on hover */
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          }

          /* Basic Fade-in Animation for the card */
          .fade-in {
            animation: fadeIn 1s ease-out forwards;
            opacity: 0;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          /* Optional: Icon button hover effect */
          .btn-icon-hover:hover {
            background-color: rgba(138, 43, 226, 0.1); /* Light purple tint */
            transform: translateY(-1px);
          }
        `}
      </style>
    </div>
  );
}
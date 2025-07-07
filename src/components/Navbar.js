import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("password");
    navigate("/"); // Redirects to the home page or login page
  };

  return (
    <nav
      className="navbar navbar-expand-lg"
      style={{
        background: "linear-gradient(to right, #e0c3fc, #8ec5fc)",
        padding: "0.75rem 2rem",
      }}
    >
      <div className="container-fluid d-flex justify-content-between align-items-center">
        <span className="navbar-brand fw-bold text-white fs-4">
          📋 ระบบเอกสารฝ่ายจัดซื้อ
        </span>

        <button
          onClick={handleLogout}
          className="btn btn-outline-light btn-sm"
          style={{ borderRadius: "8px" }}
        >
          🚪 ออกจากระบบ
        </button>
      </div>
    </nav>
  );
}
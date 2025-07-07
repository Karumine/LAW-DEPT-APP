import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; // Import useLocation for active link highlighting

export default function LawSidebar() { // Renamed to LawSidebar
  const navigate = useNavigate();
  const location = useLocation(); // Get current location to highlight active link

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("password");
    navigate("/"); // Redirect to login/home page (adjust if your login page is different)
  };

  return (
    <div
      className="d-flex flex-column p-3 text-white"
      style={{
        width: "280px", // Fixed width for the sidebar
        minHeight: "100vh", // Ensure sidebar fills the viewport height
        // Enhanced pastel gradient background, slightly different for distinction
        background: "linear-gradient(135deg, #b39ddb 0%, #e1bee7 100%)", // A soft purple gradient
        boxShadow: "4px 0 10px rgba(0,0,0,0.15)", // More prominent shadow for depth
        position: "sticky", // Make sidebar sticky so it scrolls with the content
        top: 0,
        left: 0,
        zIndex: 1000, // Ensure it's above other content if there are overlapping elements
        borderRadius: "0 15px 15px 0", // Rounded right corners for a softer look
      }}
    >
      {/* Application Title/Logo for Legal Department */}
      <Link
        to="/law-dashboard" // Link to a specific dashboard for legal role
        className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none"
      >
        <span className="fs-4 fw-bold" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.2)" }}>
          ฝ่ายกฎหมาย
        </span>
      </Link>
      <hr style={{ borderColor: "rgba(255,255,255,0.3)" }} /> {/* Lighter separator line */}

      {/* Navigation Links for Legal Department */}
      <ul className="nav nav-pills flex-column mb-auto">
        <li className="nav-item mb-2"> {/* Added margin-bottom for spacing */}
          <Link
            to="/law-dashboard" // Link to legal dashboard
            // Highlight active link based on current path
            className={`nav-link text-white rounded-3 ${location.pathname === "/law-dashboard" || location.pathname === "/" ? "active-sidebar-link-law" : "sidebar-link-law"}`}
            aria-current="page"
            style={{
              padding: "12px 15px", // Increased padding for better touch targets
              fontSize: "1.05rem", // Slightly larger font size
              transition: "all 0.3s ease", // Smooth transition for all changes
              display: "flex",
              alignItems: "center",
              gap: "10px", // Space between icon and text
            }}
          >
            <i className="bi bi-house-door-fill"></i> 🏠 แดชบอร์ด (กฎหมาย)
          </Link>
        </li>
        <li className="mb-2">
          {/* Changed link to /quotations to go to the list page */}
          <Link
            to="/quotations" // Link to the quotation list page
            className={`nav-link text-white rounded-3 ${location.pathname === "/quotations" || location.pathname === "/quotation-info" ? "active-sidebar-link-law" : "sidebar-link-law"}`}
            style={{
              padding: "12px 15px",
              fontSize: "1.05rem",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <i className="bi bi-file-earmark-spreadsheet-fill"></i> 📝 ใบเสนอราคา
          </Link>
        </li>
        <li className="mb-2">
          <Link
            to="/manage-contracts" // Placeholder for future contract management page
            className={`nav-link text-white rounded-3 ${location.pathname === "/manage-contracts" ? "active-sidebar-link-law" : "sidebar-link-law"}`}
            style={{
              padding: "12px 15px",
              fontSize: "1.05rem",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <i className="bi bi-journal-check"></i> ⚖️ จัดการสัญญา
          </Link>
        </li>
        {/* Add more navigation items here as needed for your legal application */}
      </ul>
      <hr style={{ borderColor: "rgba(255,255,255,0.3)" }} />

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="btn btn-outline-light btn-sm"
        style={{
          borderRadius: "8px",
          padding: "10px 15px",
          fontSize: "0.95rem",
          transition: "all 0.3s ease",
          borderColor: "rgba(255,255,255,0.5)",
          color: "white",
          background: "rgba(255,255,255,0.1)", // Slightly transparent background
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)";
          e.currentTarget.style.transform = "scale(1.02)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        🚪 ออกจากระบบ
      </button>

      {/* Add custom CSS for hover and active states */}
      <style>
        {`
        .sidebar-link-law:hover { /* Specific class for law sidebar links */
            background: linear-gradient(45deg, #6a5acd, #8a2be2); /* Stronger, distinct active gradient */
          transform: translateX(5px); /* Slide effect on hover */
        }

        .active-sidebar-link-law { /* Specific class for active law sidebar links */
          background: linear-gradient(45deg, #6a5acd, #8a2be2) !important; /* Stronger, distinct active gradient */
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Shadow for active link */
          transform: scale(1.02); /* Slightly enlarge active link */
          border: 1px solid rgba(255,255,255,0.5); /* Border for active link */
        }

        .active-sidebar-link-law:hover { /* Hover effect for active law sidebar links */
          background: linear-gradient(45deg, #7a1be0, #8a2be2); /* A darker, more distinct gradient on hover */
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

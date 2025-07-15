import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; // Import useLocation for active link highlighting

export default function CRMSidebar() { // Renamed to CRMSidebar
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
        width: "220px", // Fixed width for the sidebar
        minHeight: "100vh", // Ensure sidebar fills the viewport height
        // Enhanced pastel gradient background
        background: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)", // A fresh, soft blue gradient
        boxShadow: "4px 0 10px rgba(0,0,0,0.15)", // More prominent shadow for depth
        position: "sticky", // Make sidebar sticky so it scrolls with the content
        top: 0,
        left: 0,
        zIndex: 1000, // Ensure it's above other content if there are overlapping elements
        borderRadius: "0 15px 15px 0", // Rounded right corners for a softer look
        flexShrink: 0,
      }}
    >
      {/* Application Title/Logo for CRM */}
      <Link
        to="/crm-dashboard" // Link to CRM dashboard
        className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-decoration-none"
      >
        <span className="fs-4 fw-bold" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.2)" }}>
          CRM Dashboard
        </span>
      </Link>
      <hr style={{ borderColor: "rgba(255,255,255,0.3)" }} /> {/* Lighter separator line */}

      {/* Navigation Links for CRM Department */}
      <ul className="nav nav-pills flex-column mb-auto">
        <li className="nav-item mb-2"> {/* Added margin-bottom for spacing */}
          <Link
            to="/crm-dashboard" // Link to CRM dashboard
            // Highlight active link based on current path
            className={`nav-link text-white rounded-3 ${location.pathname === "/crm-dashboard" || location.pathname === "/" ? "active-sidebar-link" : "sidebar-link"}`}
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
            <i className="bi bi-house-door-fill"></i> 📊 แดชบอร์ด (CRM)
          </Link>
        </li>
        <li className="mb-2">
          <Link
            to="/crm-prospects" // New link for Prospects/Leads
            className={`nav-link text-white rounded-3 ${location.pathname === "/crm-prospects" ||
               location.pathname.startsWith("/crm-prospect-form") ||
               location.pathname.startsWith("/crm-prospect-detail") 
               ? "active-sidebar-link" 
               : "sidebar-link"
              }`}
            style={{
              padding: "12px 15px",
              fontSize: "1.05rem",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <i className="bi bi-person-plus-fill"></i> 🎯 ลูกค้ามุ่งหวัง
          </Link>
        </li>
        <li className="mb-2">
          <Link
            to="/crm-contacts" // New link for Contacts
            className={`nav-link text-white rounded-3 ${location.pathname === "/crm-contacts" ||
              location.pathname.startsWith("/crm-contact-form") ||
              location.pathname === "/crm-contacts-form" ||
              location.pathname.startsWith("/crm-contact-detail") 
              ? "active-sidebar-link"
              : "sidebar-link"
              }`}
            style={{
              padding: "12px 15px",
              fontSize: "1.05rem",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <i className="bi bi-people-fill"></i> 📞 ผู้ติดต่อ
          </Link>
        </li>
        <li className="mb-2">
          <Link
            to="/crm-accounts" // New link for Accounts
            className={`nav-link text-white rounded-3 ${location.pathname === "/crm-accounts" ||
              location.pathname.startsWith("/crm-accounts-form")? "active-sidebar-link" : "sidebar-link"}`}
            style={{
              padding: "12px 15px",
              fontSize: "1.05rem",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <i className="bi bi-building"></i> 🏢 บัญชี
          </Link>
        </li>
        <li className="mb-2">
          <Link
            to="/crm-deals" // New link for Deals/Opportunities
            className={`nav-link text-white rounded-3 ${location.pathname === "/crm-deals" ? "active-sidebar-link" : "sidebar-link"}`}
            style={{
              padding: "12px 15px",
              fontSize: "1.05rem",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <i className="bi bi-currency-dollar"></i> 💰 ข้อเสนอ
          </Link>
        </li>
        <li className="mb-2">
          <Link
            to="/crm-tasks" // New link for Tasks
            className={`nav-link text-white rounded-3 ${location.pathname === "/crm-tasks" ? "active-sidebar-link" : "sidebar-link"}`}
            style={{
              padding: "12px 15px",
              fontSize: "1.05rem",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <i className="bi bi-clipboard-check"></i> ✅ งาน
          </Link>
        </li>
        <li className="mb-2">
          <Link
            to="/crm-meetings" // New link for Meetings
            className={`nav-link text-white rounded-3 ${location.pathname === "/crm-meetings" ? "active-sidebar-link" : "sidebar-link"}`}
            style={{
              padding: "12px 15px",
              fontSize: "1.05rem",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <i className="bi bi-calendar-event"></i> 🗓️ การประชุม
          </Link>
        </li>
        <li className="mb-2">
          <Link
            to="/crm-calls" // New link for Calls
            className={`nav-link text-white rounded-3 ${location.pathname === "/crm-calls" ? "active-sidebar-link" : "sidebar-link"}`}
            style={{
              padding: "12px 15px",
              fontSize: "1.05rem",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <i className="bi bi-telephone-fill"></i> ☎️ การโทร
          </Link>
        </li>
        {/* Add more CRM navigation items here as needed */}
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
          e.currentTarget.style.background = "linear-gradient(45deg, #6a5acd, #8a2be2)";
          e.currentTarget.style.transform = "scale(1.02)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.1)";
          e.currentTarget.style.transform = "scale(1)"; // Corrected to revert to original size
        }}
      >
        🚪 ออกจากระบบ
      </button>

      {/* Add custom CSS for hover and active states */}
      <style>
        {`
        .sidebar-link:hover {
          background: linear-gradient(45deg, #6a5acd, #8a2be2); /* Stronger, distinct active gradient */
          transform: translateX(5px); /* Slide effect on hover */
        }

        .active-sidebar-link {
          background: linear-gradient(45deg, #6a5acd, #8a2be2) !important; /* Stronger, distinct active gradient */
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

import React from 'react';
import { Outlet } from 'react-router-dom';
import CRMSidebar from './CRMSidebar'; // Assuming CRMSidebar is in the same components folder

export default function CRMLayout() {
  return (
    <div className="d-flex" style={{ minHeight: "100vh", background: "#f3f7fb" }}>
      {/* The CRMSidebar will always be present on the left side of CRM-related pages */}
      <CRMSidebar />
      {/* Outlet renders the content of the nested route (e.g., CRMDashboard, CRMProspects) */}
      <div className="flex-grow-1 p-4 d-flex flex-column align-items-center">
        <Outlet />
      </div>
    </div>
  );
}

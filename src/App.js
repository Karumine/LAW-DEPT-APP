import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import all your page components with default imports
import Login from "./pages/Login";
import PODashboard from "./pages/PODashboard"; // สำหรับฝ่าย PO
import QuotationInfo from "./pages/QuotationInfo"; // สำหรับฝ่ายกฎหมาย (หน้าเพิ่ม/แก้ไข)
import QuotationList from "./pages/QuotationList"; // เพิ่ม: สำหรับฝ่ายกฎหมาย (หน้าแสดงรายการ)
import NotFound from "./pages/NotFound";
import PRFormPage from "./pages/PRForm";
import POCreate from "./pages/POCreate";
import LawDashboard from "./pages/LawDashboard"; // Ensure LawDashboard is imported for legal role
import CRMDashboard from "./pages/CRMDashboard"; // หน้าแรกของพี่องศา
import CRMProspects from "./pages/CRMProspects"; // Import CRMProspects page
import CRMProspectForm from "./pages/CRMProspectForm"; // Import CRMProspectForm (ถ้ายังใช้อยู่สำหรับลูกค้ามุ่งหวัง)
import CRMProspectDetail from "./pages/CRMProspectDetail";
import CRMContacts from "./pages/CRMContacts"; // Import CRMContacts page
import CRMContactForm from "./pages/CRMContactForm"; // <-- เพิ่มการ import สำหรับหน้าฟอร์มผู้ติดต่อใหม่นี้
import CRMContactsDetail from "./pages/CRMContactDetail";
import AppointmentDetail from './pages/AppointmentDetail'; // *** เพิ่ม: Import the new AppointmentDetail component ***

// *** เพิ่มการ import คอมโพเนนต์ CRM ใหม่เหล่านี้ ***
import CRMAccounts from './pages/CRMAccounts';
import CRMAccountForm from './pages/CRMAccountForm';
import CRMAccountDetail from "./pages/CRMAccountDetail";
import CRMDeals from './pages/CRMDeals'; // สมมติว่ามีคอมโพเนนต์นี้
import CRMTasks from './pages/CRMTasks'; // สมมติว่ามีคอมโพเนนต์นี้
import CRMMettings from './pages/CRMMettings'; // สมมติว่ามีคอมโพเนนต์นี้
import CRMCalls from './pages/CRMCalls'; // สมมติว่ามีคอมโพเนนต์นี้


// Import your layout and protected route components with default imports
import ProtectedRoute from "./components/ProtectedRoute";
// import LawLayout from "./components/LawLayout"; // Uncomment if you have this file and want to use it
import CRMLayout from "./components/CRMLayout"; // เพิ่ม: Import the CRMLayout component




export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* PO Routes */}
        <Route
          path="/po-dashboard"
          element={
            <ProtectedRoute role="po">
              <PODashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/po-create"
          element={
            <ProtectedRoute role="po">
              <POCreate />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pr-form"
          element={
            <ProtectedRoute role="po">
              <PRFormPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/quotation-info"
          element={
            <ProtectedRoute role="law">
              <QuotationInfo />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quotations"
          element={
            <ProtectedRoute role="law">
              <QuotationList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/law-dashboard"
          element={
            <ProtectedRoute role="law">
              <LawDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          element={
            <ProtectedRoute role="tracker">
              <CRMLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/crm-dashboard" element={<CRMDashboard />} />
        </Route>


        <Route
          path="/crm-prospects"
          element={
            <ProtectedRoute role="tracker">
              <CRMProspects />
            </ProtectedRoute>
          }
        />

        <Route
          path="/crm-prospect-form"
          element={
            <ProtectedRoute role="tracker">
              <CRMProspectForm />
            </ProtectedRoute>
          }
        />

        {/* เพิ่ม Route สำหรับการแก้ไขลูกค้ามุ่งหวัง (มี ID) */}
        <Route
          path="/crm-prospect-form/:leadID"
          element={
            <ProtectedRoute role="tracker">
              <CRMProspectForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/crm-prospect-detail/:leadID"
          element={
            <ProtectedRoute role="tracker">
              <CRMProspectDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/crm-contacts"
          element={
            <ProtectedRoute role="tracker">
              <CRMContacts /> {/* CRMContacts already includes CRMSidebar */}
            </ProtectedRoute>
          }
        />

        <Route
          path="/crm-contacts-form" // Path นี้ต้องตรงกับที่คุณใช้ใน CRMContacts.jsx
          element={
            <ProtectedRoute role="tracker">
              <CRMContactForm /> {/* CRMContactForm ที่คุณสร้างเมื่อกี้ */}
            </ProtectedRoute>
          }
        />

        <Route
          path="/crm-contact-form/:contactId" // **<-- เพิ่มตรงนี้!**
          element={
            <ProtectedRoute role="tracker">
              <CRMContactForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/crm-contact-detail/:contactId"
          element={
            <ProtectedRoute role="tracker">
              <CRMContactsDetail />
            </ProtectedRoute>
          }
        />

        {/* *** เพิ่ม Route ใหม่สำหรับ AppointmentDetail *** */}
        <Route
          path="/crm-appointment-detail/:taskId"
          element={
            <ProtectedRoute role="tracker">
              <AppointmentDetail />
            </ProtectedRoute>
          }
        />

        {/* *** เพิ่ม Routes สำหรับหน้า CRM ใหม่ *** */}
        <Route
          path="/crm-accounts"
          element={
            <ProtectedRoute role="tracker">
              <CRMAccounts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/crm-accounts-form"
          element={
            <ProtectedRoute role="tracker">
              <CRMAccountForm />
            </ProtectedRoute>
          }
        />

        {/* Route สำหรับแก้ไขบัญชี (มี ID) */}
        <Route
          path="/crm-account-form/:accountId" // **เพิ่มตรงนี้** เพื่อรองรับการแก้ไข
          element={
            <ProtectedRoute role="tracker">
              <CRMAccountForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/crm-accounts-detail/:accountId"
          element={
            <ProtectedRoute role="tracker">
              <CRMAccountDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/crm-deals"
          element={
            <ProtectedRoute role="tracker">
              <CRMDeals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/crm-tasks"
          element={
            <ProtectedRoute role="tracker">
              <CRMTasks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/crm-meetings"
          element={
            <ProtectedRoute role="tracker">
              <CRMMettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/crm-calls"
          element={
            <ProtectedRoute role="tracker">
              <CRMCalls />
            </ProtectedRoute>
          }
        />


        {/* Catch-all route for 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

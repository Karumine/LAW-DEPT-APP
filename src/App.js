import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Ensure BrowserRouter is imported
import Login from "./pages/Login";
import PODashboard from "./pages/PODashboard"; // สำหรับฝ่าย PO
import QuotationInfo from "./pages/QuotationInfo"; // สำหรับฝ่ายกฎหมาย (หน้าเพิ่ม/แก้ไข)
import QuotationList from "./pages/QuotationList"; // เพิ่ม: สำหรับฝ่ายกฎหมาย (หน้าแสดงรายการ)
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import PRFormPage from "./pages/PRForm";
import POCreate from "./pages/POCreate";
import LawDashboard from "./pages/LawDashboard"; // Ensure LawDashboard is imported for legal role
import CRMDashboard from "./pages/CRMDashboard"; //หน้าแรกของพี่องศา

export default function App() {
  return (
    <Router> {/* Wrap Routes with Router */}
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

        {/* Law Routes */}
        <Route
          path="/quotation-info"
          element={
            <ProtectedRoute role="law">
              <QuotationInfo />
            </ProtectedRoute>
          }
        />

        {/* เพิ่ม: Route สำหรับหน้าแสดงรายการใบเสนอราคา */}
        <Route
          path="/quotations"
          element={
            <ProtectedRoute role="law">
              <QuotationList />
            </ProtectedRoute>
          }
        />

        {/* Route for Law Dashboard */}
        <Route
          path="/law-dashboard"
          element={
            <ProtectedRoute role="law">
              <LawDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/crm-dashboard"
          element={
            <ProtectedRoute role="tracker">
              <CRMDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch-all route for 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      {/* Bootstrap CSS CDN และ JS CDN ถูกลบออกตามหลักปฏิบัติที่ดีที่สุด 
          ควรอยู่ใน public/index.html แทน */}
    </Router>
  );
}

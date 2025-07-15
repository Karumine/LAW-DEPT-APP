import React from "react";
import ReactDOM from "react-dom/client";
// ไม่ต้อง import BrowserRouter ที่นี่แล้ว
import App from "./App";
import 'bootstrap/dist/css/bootstrap.min.css'; // อันนี้ถูกต้องแล้ว
import './App.css'; // <<-- เพิ่มบรรทัดนี้เข้ามาครับ/ค่ะ!

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App /> {/* Render App component โดยตรง ไม่ต้องมี <BrowserRouter> ที่นี่ */}
  </React.StrictMode>
);
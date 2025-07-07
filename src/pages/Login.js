import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [selectedRole, setSelectedRole] = useState("law"); // Initial state can be 'law' or 'tracker' or 'po'
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    let isCorrect = false;

    if (selectedRole === "law" && username === "น้องมาย" && password === "123456") {
      localStorage.setItem("role", "law");
      isCorrect = true;
      navigate("/quotations"); // Navigate to the quotations list page for Law role
    } else if (selectedRole === "po" && username === "น้องพราว" && password === "654321") {
      localStorage.setItem("role", "po");
      isCorrect = true;
      navigate("/po-dashboard"); // Navigate to PO Dashboard
    } else if (selectedRole === "tracker" && username === "พี่องศา" && password === "123456789") {
      localStorage.setItem("role", "tracker");
      isCorrect = true;
      navigate("/crm-dashboard"); // Navigate to Tracker Dashboard
    }

    if (!isCorrect) {
      alert("ดูรหัสกับแผนกดีๆ จะรีบใส่รหัสไปไหน"); // Alert for incorrect credentials
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background: "linear-gradient(135deg, #fce4ec, #e3f2fd, #e8f5e9)",
        padding: "20px",
      }}
    >
      <div className="card shadow-lg p-4" style={{ maxWidth: "420px", width: "100%", borderRadius: "20px" }}>
        <h4 className="text-center fw-bold text-primary mb-4">ระบบ Login แยกตามแผนก</h4>

        <div className="mb-3">
          <label className="form-label">เลือกแผนก</label>
          <select
            className="form-select"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="law">ฝ่ายกฏหมาย</option>
            <option value="po">ฝ่ายจัดซื้อ</option>
            <option value="tracker">ฝ่าย Tracker</option> {/* Added Tracker option */}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">ชื่อผู้ใช้</label>
          <input
            type="text"
            className="form-control"
            placeholder={
              selectedRole === "law"
                ? "น้องมาย"
                : selectedRole === "po"
                ? "น้องพราว"
                : "พี่องศา" // Updated placeholder for Tracker
            }
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="form-label">รหัสผ่าน</label>
          <input
            type="password"
            className="form-control"
            placeholder={
              selectedRole === "law"
                ? "password คือ 123456"
                : selectedRole === "po"
                ? "password คือ 654321"
                : "password คือ 123456789" // Updated placeholder for Tracker
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          className="btn btn-primary w-100"
          onClick={handleLogin}
        >
          🔐 เข้าสู่ระบบ
        </button>
      </div>
    </div>
  );
}

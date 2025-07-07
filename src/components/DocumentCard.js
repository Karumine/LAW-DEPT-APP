import React from "react";
import { Link } from "react-router-dom";

export default function DocumentCard({ document }) {
  const statusColor = {
    "Pending Review": "warning",
    Approved: "success",
    Returned: "danger",
  };

  return (
    <div className="card shadow-sm border-0" style={{ borderRadius: "16px" }}>
      <div className="card-body">
        <h5 className="card-title text-primary fw-bold">{document.title}</h5>
        <span className={`badge bg-${statusColor[document.status]} mb-2`}>
          {document.status}
        </span>
        <p className="card-text text-muted" style={{ minHeight: "60px" }}>
          {document.content.length > 80
            ? document.content.substring(0, 80) + "..."
            : document.content}
        </p>
        <Link to={`/document/${document.id}`} className="btn btn-outline-primary w-100 mt-2">
          🔍 ตรวจสอบเอกสาร
        </Link>
      </div>
    </div>
  );
}

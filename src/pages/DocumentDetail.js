import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { mockDocuments } from "../data/mockDocuments";
import CommentBox from "../components/CommentBox";

export default function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const doc = mockDocuments.find((d) => d.id === parseInt(id));
  const [comment, setComment] = useState("");

  const handleApprove = () => {
    alert("✅ อนุมัติเรียบร้อย");
    navigate("/dashboard");
  };

  const handleReturn = () => {
    alert("❌ ส่งกลับพร้อมเหตุผล: " + comment);
    navigate("/dashboard");
  };

  return (
    <div className="p-6 bg-pastel-blue min-h-screen">
      <h2 className="text-2xl font-bold mb-4">📝 รายละเอียดเอกสาร: {doc.title}</h2>
      <p className="mb-2">{doc.content}</p>
      <CommentBox comment={comment} setComment={setComment} />
      <div className="mt-4 flex gap-2">
        <button onClick={handleApprove} className="bg-green-500 text-white px-4 py-2 rounded">
          อนุมัติ
        </button>
        <button onClick={handleReturn} className="bg-red-400 text-white px-4 py-2 rounded">
          ส่งกลับแก้ไข
        </button>
      </div>
    </div>
  );
}
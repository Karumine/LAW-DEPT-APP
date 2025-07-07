import React from "react";

export default function CommentBox({ comment, setComment }) {
  return (
    <textarea
      className="w-full h-32 p-2 border rounded"
      placeholder="เพิ่มความคิดเห็นทางกฎหมาย..."
      value={comment}
      onChange={(e) => setComment(e.target.value)}
    />
  );
}
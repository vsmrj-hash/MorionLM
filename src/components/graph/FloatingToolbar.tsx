"use client";

import { useGraph } from "@/lib/store/GraphContext";

export default function FloatingToolbar() {
  const { selectedIds } = useGraph();

  const count = selectedIds.length;

  if (count === 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        background: "#111",
        padding: "10px 16px",
        borderRadius: "10px",
        display: "flex",
        gap: "10px",
        border: "1px solid #333",
        zIndex: 100,
      }}
    >
      <span style={{ color: "#aaa" }}>{count} selected</span>
    </div>
  );
}
"use client";

import { useState } from "react";
import { useGraph } from "@/lib/store/GraphContext";

export default function LeftPanel() {
  const [thought, setThought] = useState("");
  const { synthesize } = useGraph();

  const handleAdd = () => {
    if (!thought.trim()) return;

    window.dispatchEvent(
      new CustomEvent("ADD_NODE", { detail: thought })
    );

    setThought("");
  };

  return (
    <div
      style={{
        width: "280px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        background: "#0a0a0a",
      }}
    >
      <textarea
        value={thought}
        onChange={(e) => setThought(e.target.value)}
        placeholder="Write your thoughts..."
        style={{
          padding: "10px",
          background: "#000",
          color: "#fff",
          border: "1px solid #333",
        }}
      />

      <button onClick={handleAdd}>
        Add Thought
      </button>

      <button onClick={synthesize}>
        Synthesize Selected
      </button>
    </div>
  );
}
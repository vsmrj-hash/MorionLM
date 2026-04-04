"use client";

import { useState } from "react";
import { useGraph } from "@/lib/store/GraphContext";

export default function LeftPanel() {
  const [thought, setThought] = useState("");
  const { addNode, synthesize } = useGraph();

  const handleAdd = () => {
    if (!thought.trim()) return;
    addNode(thought);
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
        borderRight: "1px solid #1a1a1a",
        height: "100%",
        zIndex: 10
      }}
    >
      <div style={{ marginBottom: '12px' }}>
        <h2 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff', opacity: 0.8 }}>NEW NODE</h2>
      </div>

      <textarea
        value={thought}
        onChange={(e) => setThought(e.target.value)}
        placeholder="Record a thought..."
        className="crystal-input"
        style={{
          flex: 1,
          maxHeight: '120px',
          padding: "12px",
          resize: 'none'
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAdd();
          }
        }}
      />

      <button 
        onClick={handleAdd}
        className="glass-button"
        style={{
          background: 'var(--accent-red)',
          color: '#fff',
          fontWeight: 600
        }}
      >
        Record Capture
      </button>

      <div style={{ margin: '16px 0', borderTop: '1px solid #1a1a1a' }} />

      <button 
        onClick={synthesize}
        className="glass-button"
      >
        Synthesize Selected
      </button>
      
      <p style={{ fontSize: '0.7rem', color: '#555', textAlign: 'center' }}>
        Select multiple nodes to synthesize insights.
      </p>
    </div>
  );
}
"use client";

import { useState } from "react";
import { Upload } from "lucide-react";

export default function LeftPanel() {
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // ===== FILE UPLOAD =====
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("Selected file:", file);
    alert(`Selected: ${file.name}`);
  };

  // ===== EXTRACT + AI =====
  const handleExtract = async () => {
    console.log("🔥 BUTTON CLICKED");

    if (!videoUrl) {
      alert("Enter a video URL");
      return;
    }

    try {
      setLoading(true);

      const endpoint = `${window.location.origin}/api/extract`;

      console.log("➡️ Calling:", endpoint);
      console.log("📦 Payload:", videoUrl);

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: videoUrl }),
      });

      console.log("📡 STATUS:", res.status);

      const data = await res.json();
      console.log("📨 RESPONSE:", data);

      if (!res.ok) {
        alert("❌ Failed: " + data.error);
        return;
      }

      // 🔥 UPDATED OUTPUT (AI INSIGHT)
      alert("🧠 Insight:\n\n" + data.insight);

    } catch (err: any) {
      console.error("💥 ERROR:", err);
      alert("CRASH: " + err?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: "280px",
        height: "100%",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        background: "rgba(10,10,10,0.6)",
        backdropFilter: "blur(12px)",
        borderRight: "1px solid rgba(255,255,255,0.08)",
        zIndex: 1000,
        position: "relative",
      }}
    >
      {/* TITLE */}
      <div style={{ color: "#aaa", fontSize: "0.8rem" }}>
        INPUT LAYER
      </div>

      {/* FILE INPUT */}
      <input
        type="file"
        id="mediaUpload"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* UPLOAD BUTTON */}
      <button
        onClick={() => document.getElementById("mediaUpload")?.click()}
        style={{
          padding: "10px",
          background: "#222",
          color: "#fff",
          border: "none",
          cursor: "pointer",
        }}
      >
        <Upload size={16} /> Upload Media
      </button>

      {/* VIDEO INPUT */}
      <input
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
        placeholder="Paste YouTube link"
        style={{
          padding: "10px",
          borderRadius: "6px",
          border: "1px solid #444",
          background: "#000",
          color: "#fff",
        }}
      />

      {/* EXTRACT BUTTON */}
      <button
        onClick={handleExtract}
        disabled={loading}
        style={{
          background: "red",
          color: "white",
          padding: "12px",
          border: "none",
          cursor: "pointer",
        }}
      >
        {loading ? "Processing..." : "Extract Video"}
      </button>
    </div>
  );
}
"use client";

import { useState } from "react";
import { Upload, Link2 } from "lucide-react";

export default function LeftPanel() {
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // ===== FILE UPLOAD HANDLER =====
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("Selected file:", file);

    // TEMP: Replace later with real upload logic
    alert(`Selected: ${file.name}`);
  };

  // ===== VIDEO EXTRACT HANDLER =====
  const handleExtract = async () => {
    if (!videoUrl) {
      alert("Enter a video URL");
      return;
    }

    try {
      setLoading(true);

      console.log("Sending URL:", videoUrl);

      const res = await fetch("/api/extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: videoUrl }),
      });

      const data = await res.json();

      console.log("Extract response:", data);
      alert("Check console for response");
    } catch (err) {
      console.error(err);
      alert("Extraction failed");
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
        zIndex: 10,
      }}
    >
      {/* ===== TITLE ===== */}
      <div style={{ color: "#aaa", fontSize: "0.8rem", letterSpacing: "1px" }}>
        INPUT LAYER
      </div>

      {/* ===== HIDDEN FILE INPUT ===== */}
      <input
        type="file"
        id="mediaUpload"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* ===== UPLOAD BUTTON ===== */}
      <button
        className="crystal-button"
        onClick={() => document.getElementById("mediaUpload")?.click()}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          justifyContent: "center",
        }}
      >
        <Upload size={16} />
        Upload Media
      </button>

      {/* ===== VIDEO INPUT ===== */}
      <input
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
        placeholder="Paste video link"
        style={{
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid rgba(255,255,255,0.1)",
          background: "rgba(0,0,0,0.5)",
          color: "#fff",
          outline: "none",
          fontSize: "0.85rem",
        }}
      />

      {/* ===== EXTRACT BUTTON ===== */}
      <button
        className="crystal-button"
        onClick={handleExtract}
        disabled={loading}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          justifyContent: "center",
          opacity: loading ? 0.6 : 1,
        }}
      >
        <Link2 size={16} />
        {loading ? "Processing..." : "Extract Video"}
      </button>
    </div>
  );
}
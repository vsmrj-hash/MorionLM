"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

import LeftPanel from "@/components/panels/LeftPanel";
import RightPanel from "@/components/panels/RightPanel";
import { GraphProvider } from "@/lib/store/GraphContext";

// 🔥 FIX: Disable SSR for ReactFlow
const GraphEngine = dynamic(
  () => import("@/components/graph/GraphEngine"),
  { ssr: false }
);

export default function AppView() {
  const [mode] = useState<"app" | "demo">("app");

  return (
    <GraphProvider>
      <main
        style={{
          display: "flex",
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
          background: "#000",
        }}
      >
        {/* LEFT PANEL */}
        <LeftPanel />

        {/* GRAPH */}
        <GraphEngine />

        {/* RIGHT PANEL */}
        <RightPanel />
      </main>
    </GraphProvider>
  );
}
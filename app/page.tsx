"use client";

import { useState } from "react";
import AppView from "@/components/app/AppView";

export default function Home() {
  const [mode, setMode] = useState<"app" | "demo" | "landing">("app");

  return (
    <main style={{ width: "100vw", height: "100vh" }}>
      <AppView />
    </main>
  );
}
"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface GraphContextType {
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  synthesize: () => Promise<void>;
}

const GraphContext = createContext<GraphContextType | null>(null);

export function GraphProvider({ children }: { children: ReactNode }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const synthesize = async () => {
    if (selectedIds.length < 2) {
      alert("Select at least 2 nodes");
      return;
    }

    try {
      // 🔥 extract labels from nodes
      const labels = selectedIds.map((id) => {
        const el = document.querySelector(`[data-id='${id}']`);
        return el?.textContent || "";
      });

      const res = await fetch("/api/synthesis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nodes: labels.map((l) => ({ label: l })),
          prompt:
            "Find deep connections, contradictions, and generate a new insight.",
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      // 🔥 create new node
      window.dispatchEvent(
        new CustomEvent("ADD_NODE", { detail: data.insight })
      );

      // clear selection
      setSelectedIds([]);

    } catch (err: any) {
      alert("Synthesis failed: " + err.message);
    }
  };

  return (
    <GraphContext.Provider
      value={{
        selectedIds,
        setSelectedIds,
        synthesize,
      }}
    >
      {children}
    </GraphContext.Provider>
  );
}

export function useGraph() {
  const ctx = useContext(GraphContext);
  if (!ctx) throw new Error("useGraph must be used inside provider");
  return ctx;
}
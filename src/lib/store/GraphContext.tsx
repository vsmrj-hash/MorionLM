"use client";

import React, { createContext, useContext, useState } from "react";

export interface NodeType {
  id: string;
  data: { label: string };
  position: { x: number; y: number };
}

interface GraphContextType {
  nodes: NodeType[];
  setNodes: React.Dispatch<React.SetStateAction<NodeType[]>>;

  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;

  addNode: (label: string) => void;
  synthesize: () => void;

  clearSelection: () => void;
  deleteSelectedNodes: () => void;
}

const GraphContext = createContext<GraphContextType | undefined>(undefined);

export const GraphProvider = ({ children }: { children: React.ReactNode }) => {
  const [nodes, setNodes] = useState<NodeType[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // ✅ Add node
  const addNode = (label: string) => {
    const newNode: NodeType = {
      id: crypto.randomUUID(),
      data: { label },
      position: {
        x: Math.random() * 400,
        y: Math.random() * 400,
      },
    };

    setNodes((prev) => [...prev, newNode]);
  };

  // ✅ Clear selection
  const clearSelection = () => {
    setSelectedIds([]);
  };

  // ✅ Delete selected nodes
  const deleteSelectedNodes = () => {
    setNodes((prev) => prev.filter((n) => !selectedIds.includes(n.id)));
    setSelectedIds([]);
  };

  // ✅ Mock synthesis
  const synthesize = () => {
    if (selectedIds.length < 2) {
      alert("Select at least 2 nodes");
      return;
    }

    const selectedNodes = nodes.filter((n) =>
      selectedIds.includes(n.id)
    );

    const combined = selectedNodes
      .map((n) => n.data.label)
      .join(" + ");

    const insight = `Insight: ${combined} → deeper connection emerges`;

    addNode(insight);
    setSelectedIds([]);
  };

  return (
    <GraphContext.Provider
      value={{
        nodes,
        setNodes,
        selectedIds,
        setSelectedIds,
        addNode,
        synthesize,
        clearSelection,
        deleteSelectedNodes,
      }}
    >
      {children}
    </GraphContext.Provider>
  );
};

export const useGraph = () => {
  const context = useContext(GraphContext);
  if (!context) throw new Error("useGraph must be used inside GraphProvider");
  return context;
};
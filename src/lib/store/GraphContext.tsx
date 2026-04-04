"use client";

import React, { createContext, useContext, useState } from "react";

export interface NodeType {
  id: string;
  data: { label: string };
  position: { x: number; y: number };
}

export interface GraphContextType {
  nodes: NodeType[];
  setNodes: React.Dispatch<React.SetStateAction<NodeType[]>>;

  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;

  addNode: (label: string) => void;
  synthesize: () => void;

  clearSelection: () => void;
  deleteSelectedNodes: () => void;
}

const GraphContext = createContext<GraphContextType | null>(null);

export const GraphProvider = ({ children }: { children: React.ReactNode }) => {
  const [nodes, setNodes] = useState<NodeType[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const deleteSelectedNodes = () => {
    setNodes((prev) => prev.filter((n) => !selectedIds.includes(n.id)));
    setSelectedIds([]);
  };

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

    addNode(`Insight: ${combined}`);
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
  const ctx = useContext(GraphContext);
  if (!ctx) throw new Error("useGraph must be used inside GraphProvider");
  return ctx;
};
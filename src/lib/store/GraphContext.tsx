"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Node, Edge, addEdge, Connection } from "@xyflow/react";

export interface MorionNodeData extends Record<string, unknown> {
  label: string;
  type: string;
  tags?: string[];
  content?: string;
}

export type NodeType = Node<MorionNodeData>;

export interface GraphContextType {
  nodes: NodeType[];
  setNodes: React.Dispatch<React.SetStateAction<NodeType[]>>;
  edges: Edge[];
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;

  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;

  addNode: (label: string, type?: string) => void;
  synthesize: () => void;
  synthesizeNodes: (query: string) => Promise<void>;
  isSynthesizing: boolean;

  toast: { message: string } | null;
  clearToast: () => void;
  undoDelete: () => void;

  clearSelection: () => void;
  deleteSelectedNodes: () => void;
  onConnect: (params: Connection) => void;
}

const GraphContext = createContext<GraphContextType | null>(null);

export const GraphProvider = ({ children }: { children: React.ReactNode }) => {
  const [nodes, setNodes] = useState<NodeType[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [toast, setToast] = useState<{ message: string } | null>(null);
  const [lastDeletedNodes, setLastDeletedNodes] = useState<NodeType[]>([]);

  const addNode = useCallback((label: string, type: string = "thought") => {
    const newNode: NodeType = {
      id: crypto.randomUUID(),
      type: "base",
      data: { label, type, tags: [] },
      position: {
        x: Math.random() * 400,
        y: Math.random() * 400,
      },
    };

    setNodes((prev) => [...prev, newNode]);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const deleteSelectedNodes = useCallback(() => {
    const nodesToDelete = nodes.filter((n) => selectedIds.includes(n.id));
    if (nodesToDelete.length === 0) return;

    setLastDeletedNodes(nodesToDelete);
    setNodes((prev) => prev.filter((n) => !selectedIds.includes(n.id)));
    setSelectedIds([]);
    setToast({ message: `Deleted ${nodesToDelete.length} nodes` });
  }, [nodes, selectedIds]);

  const undoDelete = useCallback(() => {
    if (lastDeletedNodes.length === 0) return;
    setNodes((prev) => [...prev, ...lastDeletedNodes]);
    setLastDeletedNodes([]);
    setToast(null);
  }, [lastDeletedNodes]);

  const clearToast = useCallback(() => setToast(null), []);

  const synthesize = useCallback(() => {
    if (selectedIds.length < 2) {
      alert("Select at least 2 nodes");
      return;
    }

    const selectedNodes = nodes.filter((n) => selectedIds.includes(n.id));
    const combined = selectedNodes.map((n) => n.data.label).join(" + ");

    addNode(`Insight: ${combined}`, "insight");
    setSelectedIds([]);
  }, [nodes, selectedIds, addNode]);

  const synthesizeNodes = useCallback(async (query: string) => {
    setIsSynthesizing(true);
    // Mock synthesis delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    addNode(`Pattern found for "${query}"`, "insight");
    setIsSynthesizing(false);
  }, [addNode]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  return (
    <GraphContext.Provider
      value={{
        nodes,
        setNodes,
        edges,
        setEdges,
        selectedIds,
        setSelectedIds,
        addNode,
        synthesize,
        synthesizeNodes,
        isSynthesizing,
        toast,
        clearToast,
        undoDelete,
        clearSelection,
        deleteSelectedNodes,
        onConnect,
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
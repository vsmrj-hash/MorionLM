"use client";

import React, { useCallback, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Node,
} from "reactflow";

import "reactflow/dist/style.css";
import { useGraph } from "@/lib/store/GraphContext";

export default function GraphEngine() {
  const { setSelectedIds } = useGraph();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // 🔥 LOCAL SELECTION STATE (CRITICAL)
  const [selected, setSelected] = useState<string[]>([]);

  // 🔥 Add node
  const addNode = useCallback((label: string) => {
    const newNode: Node = {
      id: Date.now().toString(),
      position: {
        x: Math.random() * 600,
        y: Math.random() * 400,
      },
      data: { label },
      style: {
        background: "#1e1e1e",
        color: "#fff",
        border: "1px solid rgba(255,255,255,0.2)",
        borderRadius: "8px",
        padding: "10px",
        fontSize: "12px",
        maxWidth: 180,
      },
    };

    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  // 🔥 Listen for add
  React.useEffect(() => {
    const handler = (e: any) => addNode(e.detail);
    window.addEventListener("ADD_NODE", handler);
    return () => window.removeEventListener("ADD_NODE", handler);
  }, [addNode]);

  // 🔥 Connect
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // 🔥 CLICK SELECTION (FIXED)
  const onNodeClick = (_: any, node: any) => {
    setSelected((prev) => {
      let updated;

      if (prev.includes(node.id)) {
        updated = prev.filter((id) => id !== node.id);
      } else {
        updated = [...prev, node.id];
      }

      // 🔥 update global selection
      setSelectedIds(updated);

      return updated;
    });
  };

  // 🔥 APPLY GREEN HIGHLIGHT
  const styledNodes = nodes.map((n) => ({
    ...n,
    style: {
      ...n.style,
      border: selected.includes(n.id)
        ? "2px solid #00ff88"
        : "1px solid rgba(255,255,255,0.2)",
      boxShadow: selected.includes(n.id)
        ? "0 0 12px rgba(0,255,136,0.6)"
        : "none",
    },
  }));

  return (
    <div style={{ flex: 1, height: "100%" }}>
      <ReactFlow
        nodes={styledNodes} // 🔥 IMPORTANT
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
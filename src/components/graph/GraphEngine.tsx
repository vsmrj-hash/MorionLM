"use client";

import React, { useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
  Node,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import { useGraph, NodeType } from "@/lib/store/GraphContext";
import BaseNode from "./nodes/BaseNode";

const nodeTypes = {
  base: BaseNode,
};

export default function GraphEngine() {
  const {
    nodes,
    setNodes,
    edges,
    setEdges,
    onConnect,
    setSelectedIds,
  } = useGraph();

  const onNodesChange = useCallback(
    (changes: NodeChange<NodeType>[]) => setNodes((nds) => applyNodeChanges<NodeType>(changes, nds)),
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedIds((prev) => {
      if (prev.includes(node.id)) {
        return prev.filter((id) => id !== node.id);
      } else {
        return [...prev, node.id];
      }
    });
  }, [setSelectedIds]);

  const onPaneClick = useCallback(() => {
    setSelectedIds([]);
  }, [setSelectedIds]);

  return (
    <div style={{ flex: 1, height: "100%", position: "relative" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background color="#111" gap={20} />
        <Controls />
      </ReactFlow>

      <style jsx global>{`
        .react-flow__node {
          cursor: pointer;
          border: none !important;
          background: transparent !important;
          padding: 0 !important;
        }
        .react-flow__handle {
          width: 8px !important;
          height: 8px !important;
          background: rgba(255,255,255,0.2) !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
        }
        .react-flow__handle:hover {
          background: var(--accent-red) !important;
        }
        .react-flow__attribution {
          display: none;
        }
      `}</style>
    </div>
  );
}
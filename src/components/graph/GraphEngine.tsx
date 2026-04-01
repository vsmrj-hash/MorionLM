"use client";

import { ReactFlow, Background, Controls, NodeTypes } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BaseNode from './nodes/BaseNode';
import FloatingToolbar from './FloatingToolbar';
import UndoToast from './UndoToast';
import { useGraph } from '@/lib/store/GraphContext';

const nodeTypes: NodeTypes = {
  custom: BaseNode,
};

export default function GraphEngine() {
  const {
    nodes, edges,
    onNodesChange, onEdgesChange, onConnect,
    selectedIds, setSelectedIds,
    deleteSelectedNodes, undoDelete, undoSnapshot
  } = useGraph();

  // Sync React Flow selection state → our context
  const handleSelectionChange = useCallback(
    ({ nodes: selNodes }: { nodes: { id: string }[], edges: { id: string }[] }) => {
      setSelectedIds(new Set(selNodes.map(n => n.id)));
    },
    [setSelectedIds]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelectedNodes();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (undoSnapshot) undoDelete();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [deleteSelectedNodes, undoDelete, undoSnapshot]);

  const isEmpty = nodes.length === 0;

  return (
    <div style={{ flex: 1, position: 'relative', height: '100%' }}>
      {/* Selection dim overlay */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            key="dim-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.25)',
              zIndex: 1,
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>

      {/* Empty state */}
      <AnimatePresence>
        {isEmpty && (
          <motion.div
            key="empty-state"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
              pointerEvents: 'none',
            }}
          >
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'rgba(255,255,255,0.2)', textAlign: 'center', lineHeight: 1.5 }}>
              Clean slate.<br />
              <span style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.12)' }}>Now build something better.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={handleSelectionChange}
        fitView
        multiSelectionKeyCode="Shift"
        selectionOnDrag={true}
        nodesDraggable
        nodesConnectable
        elementsSelectable
        deleteKeyCode={null} /* we handle Delete ourselves */
        proOptions={{ hideAttribution: true }}
        style={{ zIndex: 2 }}
      >
        <Background gap={24} size={2} color="rgba(255,255,255,0.03)" />
        <Controls
          style={{
            background: 'rgba(10,10,10,0.85)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
          }}
        />
      </ReactFlow>

      {/* Floating toolbar — renders above everything */}
      <FloatingToolbar />

      {/* Undo toast — lowest confirmed position */}
      <UndoToast />
    </div>
  );
}

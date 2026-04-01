"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef } from 'react';
import { Node, Edge, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange, Connection, addEdge } from '@xyflow/react';
import { db } from '@/lib/db/db';

export interface MorionNodeData {
  label: string;
  type: 'thought' | 'video' | 'image' | 'insight' | 'idea';
  tags?: string[];
  [key: string]: unknown;
}

export interface DeletedSnapshot {
  nodes: Node[];
  edges: Edge[];
  deletedAt: number;
}

interface GraphContextType {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange<Node>[]) => void;
  onEdgesChange: (changes: EdgeChange<Edge>[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (data: MorionNodeData, x?: number, y?: number) => void;
  synthesizeNodes: (query: string) => Promise<void>;
  isSynthesizing: boolean;

  // Selection
  selectedIds: Set<string>;
  setSelectedIds: (ids: Set<string>) => void;
  clearSelection: () => void;

  // Deletion + Undo
  deleteSelectedNodes: () => void;
  deleteNodeById: (id: string) => void;
  undoSnapshot: DeletedSnapshot | null;
  undoDelete: () => void;

  toast: { message: string; count: number } | null;
  clearToast: () => void;
}

const GraphContext = createContext<GraphContextType | null>(null);

// Auto-clean hard delete timeout (3 minutes)
const HARD_DELETE_TIMEOUT_MS = 3 * 60 * 1000;

export const GraphProvider = ({ children, initialMode = 'app' }: { children: ReactNode, initialMode?: 'app' | 'demo' }) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [undoSnapshot, setUndoSnapshot] = useState<DeletedSnapshot | null>(null);
  const [toast, setToast] = useState<{ message: string; count: number } | null>(null);
  const hardDeleteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (initialMode === 'demo') {
      const demoNodes: Node[] = [
        { id: 'd1', type: 'custom', position: { x: 100, y: 100 }, data: { label: 'AI Agents will replace workflows', type: 'video' } },
        { id: 'd2', type: 'custom', position: { x: 150, y: 270 }, data: { label: "People don't finish what they start", type: 'thought' } },
        { id: 'd3', type: 'custom', position: { x: 460, y: 180 }, data: { label: 'Tool that tracks behavioral patterns', type: 'idea' } },
        { id: 'd4', type: 'custom', position: { x: 50,  y: 360 }, data: { label: 'Abstract dark aesthetic', type: 'image' } },
        { id: 'd5', type: 'custom', position: { x: 310, y: 410 }, data: { label: 'Why do I lose momentum after day 3?', type: 'thought' } },
        { id: 'i1', type: 'custom', position: { x: 620, y: 310 }, data: { label: 'You repeat effort cycles but fail at consistency', type: 'insight' } },
        { id: 'i2', type: 'custom', position: { x: 660, y: 120 }, data: { label: 'Your ideas lean toward systems, not execution', type: 'insight' } },
      ];
      setNodes(demoNodes);
      const demoEdges: Edge[] = [
        { id: 'e1', source: 'd2', target: 'i1', animated: true, style: { stroke: 'rgba(255,255,255,0.3)', strokeWidth: 2 } },
        { id: 'e2', source: 'd5', target: 'i1', animated: true, style: { stroke: 'rgba(255,255,255,0.3)', strokeWidth: 2 } },
        { id: 'e3', source: 'd3', target: 'i2', animated: true, style: { stroke: 'rgba(255,255,255,0.3)', strokeWidth: 2 } },
        { id: 'e4', source: 'd1', target: 'i2', animated: true, style: { stroke: 'rgba(255,255,255,0.3)', strokeWidth: 2 } },
      ];
      setEdges(demoEdges);
      return;
    }

    db.nodes.toArray().then(dbNodes => {
      if (dbNodes.length > 0) {
        setNodes(dbNodes.map(n => ({
          id: n.id,
          type: 'custom',
          position: { x: n.positionX, y: n.positionY },
          data: { label: n.content, type: n.type, tags: n.tags }
        })));
      } else {
        setNodes([{
          id: 'intro',
          type: 'custom',
          position: { x: 250, y: 150 },
          data: { label: "This is where your thinking begins. Add one thought. We'll handle the rest.", type: 'thought', tags: ['onboarding'] }
        }]);
      }
    });
  }, [initialMode]);

  const onNodesChange = useCallback((changes: NodeChange<Node>[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange<Edge>[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) => addEdge({ ...connection, animated: true, style: { stroke: 'rgba(255,255,255,0.25)', strokeWidth: 2 } }, eds));
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const clearToast = useCallback(() => setToast(null), []);

  const showToast = useCallback((message: string, count: number) => {
    setToast({ message, count });
    const t = setTimeout(() => setToast(null), 5000);
    return t;
  }, []);

  /** Core internal delete — takes exact lists of nodes+edges to remove */
  const performDelete = useCallback((nodeIds: Set<string>, snapshotNodes: Node[], snapshotEdges: Edge[]) => {
    // Snapshot for undo
    const snapshot: DeletedSnapshot = { nodes: snapshotNodes, edges: snapshotEdges, deletedAt: Date.now() };
    setUndoSnapshot(snapshot);

    setNodes(prev => prev.filter(n => !nodeIds.has(n.id)));
    setEdges(prev => prev.filter(e => !nodeIds.has(e.source) && !nodeIds.has(e.target)));
    clearSelection();

    if (initialMode !== 'demo') {
      nodeIds.forEach(id => db.nodes.delete(id).catch(() => {}));
    }

    // Schedule hard-clear of undo buffer
    if (hardDeleteTimer.current) clearTimeout(hardDeleteTimer.current);
    hardDeleteTimer.current = setTimeout(() => setUndoSnapshot(null), HARD_DELETE_TIMEOUT_MS);
  }, [clearSelection, initialMode]);

  const deleteSelectedNodes = useCallback(() => {
    if (selectedIds.size === 0) return;
    const nodeIds = selectedIds;
    const snapshotNodes = nodes.filter(n => nodeIds.has(n.id));
    const snapshotEdges = edges.filter(e => nodeIds.has(e.source) || nodeIds.has(e.target));
    performDelete(nodeIds, snapshotNodes, snapshotEdges);
    showToast(`${nodeIds.size} node${nodeIds.size > 1 ? 's' : ''} deleted`, nodeIds.size);
  }, [selectedIds, nodes, edges, performDelete, showToast]);

  const deleteNodeById = useCallback((id: string) => {
    const nodeIds = new Set([id]);
    const snapshotNodes = nodes.filter(n => n.id === id);
    const snapshotEdges = edges.filter(e => e.source === id || e.target === id);
    performDelete(nodeIds, snapshotNodes, snapshotEdges);
    showToast('1 node deleted', 1);
  }, [nodes, edges, performDelete, showToast]);

  const undoDelete = useCallback(() => {
    if (!undoSnapshot) return;
    if (hardDeleteTimer.current) clearTimeout(hardDeleteTimer.current);

    setNodes(prev => {
      const existingIds = new Set(prev.map(n => n.id));
      const toRestore = undoSnapshot.nodes.filter(n => !existingIds.has(n.id));
      return [...prev, ...toRestore];
    });
    setEdges(prev => {
      const existingIds = new Set(prev.map(e => e.id));
      const toRestore = undoSnapshot.edges.filter(e => !existingIds.has(e.id));
      return [...prev, ...toRestore];
    });

    if (initialMode !== 'demo') {
      undoSnapshot.nodes.forEach(n => {
        const data = n.data as MorionNodeData;
        db.nodes.put({
          id: n.id,
          type: data.type,
          content: data.label,
          tags: data.tags || [],
          createdAt: Date.now(),
          positionX: n.position.x,
          positionY: n.position.y
        }).catch(() => {});
      });
    }

    setUndoSnapshot(null);
    setToast(null);
  }, [undoSnapshot, initialMode]);

  const addNode = useCallback((data: MorionNodeData, x?: number, y?: number) => {
    const px = x ?? (typeof window !== 'undefined' ? window.innerWidth / 2 - 100 : 400);
    const py = y ?? (typeof window !== 'undefined' ? window.innerHeight / 2 - 100 : 300);
    const newNode: Node = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'custom',
      position: { x: px + Math.random() * 50 - 25, y: py + Math.random() * 50 - 25 },
      data
    };
    setNodes(prev => [...prev, newNode]);

    if (initialMode === 'demo') return;
    db.nodes.put({
      id: newNode.id,
      type: data.type,
      content: data.label,
      tags: data.tags || [],
      createdAt: Date.now(),
      positionX: newNode.position.x,
      positionY: newNode.position.y
    }).catch(e => console.error('DB Save Error', e));
  }, [initialMode]);

  const synthesizeNodes = useCallback(async (query: string) => {
    setIsSynthesizing(true);

    if (initialMode === 'demo') {
      setTimeout(() => {
        setIsSynthesizing(false);
        addNode({
          label: 'Build a system that detects behavioral drop-offs and intervenes early',
          type: 'insight',
          tags: ['Demo Fusion']
        }, typeof window !== 'undefined' ? window.innerWidth / 2 + 100 : 600,
           typeof window !== 'undefined' ? window.innerHeight / 2 - 50 : 300);
      }, 500);
      return;
    }

    try {
      const response = await fetch('/api/synthesis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes: nodes.map(n => n.data), prompt: query })
      });
      const result = await response.json();
      if (result.insight) {
        addNode({ label: result.insight, type: 'insight', tags: ['AI'] },
          typeof window !== 'undefined' ? window.innerWidth / 2 + 150 : 600,
          typeof window !== 'undefined' ? window.innerHeight / 2 : 300);
      } else if (result.error) {
        addNode({ label: `Synthesis Error: ${result.error}`, type: 'insight', tags: ['System Alert'] },
          typeof window !== 'undefined' ? window.innerWidth / 2 + 150 : 600,
          typeof window !== 'undefined' ? window.innerHeight / 2 : 300);
      }
    } catch (e) {
      console.error('Failed to synthesize:', e);
    } finally {
      setIsSynthesizing(false);
    }
  }, [initialMode, nodes, addNode]);

  return (
    <GraphContext.Provider value={{
      nodes, edges,
      onNodesChange, onEdgesChange, onConnect,
      addNode, synthesizeNodes, isSynthesizing,
      selectedIds, setSelectedIds, clearSelection,
      deleteSelectedNodes, deleteNodeById,
      undoSnapshot, undoDelete,
      toast, clearToast
    }}>
      {children}
    </GraphContext.Provider>
  );
};

export const useGraph = () => {
  const ctx = useContext(GraphContext);
  if (!ctx) throw new Error('useGraph must be used within GraphProvider');
  return ctx;
};

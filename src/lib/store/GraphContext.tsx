"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { Node, Edge, addEdge, Connection } from "@xyflow/react";
import { db } from "@/lib/db/db";

export interface MorionNodeData extends Record<string, unknown> {
  label: string;
  type: string;
  tags?: string[];
  content?: string;
  sourceUrl?: string;
  notebook?: string;
}

export type NodeType = Node<MorionNodeData>;

export interface SynthesisResult {
  id: string;
  query: string;
  result: string;
  mode: string;
  nodeCount: number;
  timestamp: number;
  nodeIds: string[];
}

export interface GraphContextType {
  nodes: NodeType[];
  setNodes: React.Dispatch<React.SetStateAction<NodeType[]>>;
  edges: Edge[];
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;

  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;

  addNode: (label: string, type?: string, extra?: Partial<MorionNodeData>) => void;
  synthesize: () => void;
  synthesizeNodes: (query: string, mode?: string) => Promise<void>;
  isSynthesizing: boolean;
  synthesisHistory: SynthesisResult[];
  clearHistory: () => void;
  crystallizeResult: (result: SynthesisResult) => void;

  notebooks: string[];
  currentNotebook: string;
  addNotebook: (name: string) => void;
  setCurrentNotebook: (name: string) => void;

  ingestSource: (url: string, text?: string) => Promise<boolean>;
  isIngesting: boolean;

  toast: { message: string; type?: "info" | "error" } | null;
  clearToast: () => void;
  undoDelete: () => void;

  clearSelection: () => void;
  deleteSelectedNodes: () => void;
  connectSelected: () => void;
  onConnect: (params: Connection) => void;
}

const GraphContext = createContext<GraphContextType | null>(null);

export const GraphProvider = ({ children }: { children: React.ReactNode }) => {
  const [nodes, setNodes] = useState<NodeType[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const [synthesisHistory, setSynthesisHistory] = useState<SynthesisResult[]>([]);
  const [toast, setToast] = useState<{ message: string; type?: "info" | "error" } | null>(null);
  const [lastDeletedNodes, setLastDeletedNodes] = useState<NodeType[]>([]);
  const [notebooks, setNotebooks] = useState<string[]>(["Default"]);
  const [currentNotebook, setCurrentNotebook] = useState("Default");

  const isLoadingRef = useRef(false);
  const saveNodesRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveEdgesRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const load = async () => {
      isLoadingRef.current = true;
      try {
        const [dbNodes, dbEdges] = await Promise.all([db.nodes.toArray(), db.edges.toArray()]);

        if (dbNodes.length > 0) {
          setNodes(
            dbNodes.map((n) => ({
              id: n.id,
              type: "base",
              data: {
                label: n.content,
                type: n.type,
                tags: n.tags,
                content: n.content,
                sourceUrl: n.sourceUrl,
                notebook: n.notebook ?? "Default",
              },
              position: { x: n.positionX, y: n.positionY },
            }))
          );

          const allNotebooks = [
            "Default",
            ...new Set(dbNodes.map((n) => n.notebook ?? "Default").filter((nb) => nb !== "Default")),
          ];
          setNotebooks(allNotebooks);
        }

        if (dbEdges.length > 0) {
          setEdges(dbEdges.map((e) => ({ id: e.id, source: e.source, target: e.target })));
        }
      } finally {
        setTimeout(() => { isLoadingRef.current = false; }, 200);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (isLoadingRef.current) return;
    if (saveNodesRef.current) clearTimeout(saveNodesRef.current);
    saveNodesRef.current = setTimeout(async () => {
      try {
        await db.nodes.clear();
        await db.nodes.bulkPut(
          nodes.map((n) => ({
            id: n.id,
            type: (n.data.type as "thought" | "video" | "image" | "insight" | "idea" | "source") || "thought",
            content: n.data.label,
            tags: n.data.tags || [],
            createdAt: Date.now(),
            positionX: n.position?.x ?? 0,
            positionY: n.position?.y ?? 0,
            sourceUrl: n.data.sourceUrl,
            notebook: n.data.notebook ?? "Default",
          }))
        );
      } catch (e) {
        console.error("DB node save error:", e);
      }
    }, 600);
  }, [nodes]);

  useEffect(() => {
    if (isLoadingRef.current) return;
    if (saveEdgesRef.current) clearTimeout(saveEdgesRef.current);
    saveEdgesRef.current = setTimeout(async () => {
      try {
        await db.edges.clear();
        await db.edges.bulkPut(edges.map((e) => ({ id: e.id, source: e.source, target: e.target })));
      } catch (e) {
        console.error("DB edge save error:", e);
      }
    }, 600);
  }, [edges]);

  const addNode = useCallback(
    (label: string, type: string = "thought", extra: Partial<MorionNodeData> = {}) => {
      const id = crypto.randomUUID();
      setNodes((prev) => [
        ...prev,
        {
          id,
          type: "base",
          data: { label, type, tags: [], notebook: currentNotebook, ...extra },
          position: { x: 200 + Math.random() * 500, y: 150 + Math.random() * 350 },
        },
      ]);
    },
    [currentNotebook]
  );

  const clearSelection = useCallback(() => setSelectedIds([]), []);

  const deleteSelectedNodes = useCallback(() => {
    const toDelete = nodes.filter((n) => selectedIds.includes(n.id));
    if (toDelete.length === 0) return;
    setLastDeletedNodes(toDelete);
    setNodes((prev) => prev.filter((n) => !selectedIds.includes(n.id)));
    setEdges((prev) =>
      prev.filter((e) => !selectedIds.includes(e.source) && !selectedIds.includes(e.target))
    );
    setSelectedIds([]);
    setToast({ message: `Deleted ${toDelete.length} node${toDelete.length > 1 ? "s" : ""}` });
    setTimeout(() => setToast(null), 3000);
  }, [nodes, selectedIds]);

  const undoDelete = useCallback(() => {
    if (lastDeletedNodes.length === 0) return;
    setNodes((prev) => [...prev, ...lastDeletedNodes]);
    setLastDeletedNodes([]);
    setToast(null);
  }, [lastDeletedNodes]);

  const connectSelected = useCallback(() => {
    if (selectedIds.length < 2) return;
    const newEdges: Edge[] = [];
    for (let i = 0; i < selectedIds.length - 1; i++) {
      newEdges.push({
        id: `e-${selectedIds[i]}-${selectedIds[i + 1]}`,
        source: selectedIds[i],
        target: selectedIds[i + 1],
      });
    }
    setEdges((prev) => [...prev, ...newEdges]);
    setToast({ message: `Connected ${selectedIds.length} nodes` });
    setTimeout(() => setToast(null), 2000);
  }, [selectedIds]);

  const synthesize = useCallback(() => {
    const ids = selectedIds.length > 0 ? selectedIds : [];
    if (ids.length < 2) {
      setToast({ message: "Select at least 2 nodes to synthesize", type: "error" });
      setTimeout(() => setToast(null), 2000);
      return;
    }
    const selected = nodes.filter((n) => ids.includes(n.id));
    addNode(`Insight: ${selected.map((n) => n.data.label).join(" + ")}`, "insight");
    setSelectedIds([]);
  }, [nodes, selectedIds, addNode]);

  const synthesizeNodes = useCallback(
    async (query: string, mode: string = "ask") => {
      const targetIds = selectedIds.length > 0 ? selectedIds : nodes.map((n) => n.id);
      const targetNodes = nodes.filter((n) => targetIds.includes(n.id));

      if (targetNodes.length === 0) {
        setToast({ message: "Add some nodes first", type: "error" });
        setTimeout(() => setToast(null), 2000);
        return;
      }

      setIsSynthesizing(true);
      try {
        const res = await fetch("/api/synthesize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nodes: targetNodes.map((n) => ({
              label: n.data.label,
              type: n.data.type,
              content: n.data.content,
              tags: n.data.tags,
            })),
            query,
            mode,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Synthesis failed");

        setSynthesisHistory((prev) => [
          {
            id: crypto.randomUUID(),
            query: query || mode,
            result: data.result,
            mode: data.mode,
            nodeCount: data.nodeCount,
            timestamp: Date.now(),
            nodeIds: targetIds,
          },
          ...prev,
        ]);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Synthesis failed";
        setToast({ message: msg, type: "error" });
        setTimeout(() => setToast(null), 3000);
      } finally {
        setIsSynthesizing(false);
      }
    },
    [nodes, selectedIds]
  );

  const crystallizeResult = useCallback(
    (result: SynthesisResult) => {
      addNode(
        result.query || result.mode,
        "insight",
        { content: result.result.slice(0, 500), notebook: currentNotebook }
      );
      setToast({ message: "Crystallized to graph" });
      setTimeout(() => setToast(null), 2000);
    },
    [addNode, currentNotebook]
  );

  const ingestSource = useCallback(
    async (url: string, text?: string): Promise<boolean> => {
      setIsIngesting(true);
      try {
        const res = await fetch("/api/ingest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: url || undefined,
            text: text || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Ingestion failed");

        addNode(data.title, "source", {
          content: data.summary,
          tags: data.tags || [],
          sourceUrl: data.sourceUrl || url || undefined,
          notebook: currentNotebook,
        });
        setToast({ message: `Ingested: ${data.title}` });
        setTimeout(() => setToast(null), 3000);
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Ingest failed";
        setToast({ message: msg, type: "error" });
        setTimeout(() => setToast(null), 5000);
        return false;
      } finally {
        setIsIngesting(false);
      }
    },
    [addNode, currentNotebook]
  );

  const addNotebook = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setNotebooks((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
    setCurrentNotebook(trimmed);
  }, []);

  const clearHistory = useCallback(() => setSynthesisHistory([]), []);
  const clearToast = useCallback(() => setToast(null), []);
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
        synthesisHistory,
        clearHistory,
        crystallizeResult,
        notebooks,
        currentNotebook,
        addNotebook,
        setCurrentNotebook,
        ingestSource,
        isIngesting,
        toast,
        clearToast,
        undoDelete,
        clearSelection,
        deleteSelectedNodes,
        connectSelected,
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

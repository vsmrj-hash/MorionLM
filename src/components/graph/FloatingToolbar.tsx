"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Link, Tag, Layers, X } from 'lucide-react';
import { useGraph } from '@/lib/store/GraphContext';
import React, { useState } from 'react';

export default function FloatingToolbar() {
  const { selectedIds, clearSelection, deleteSelectedNodes } = useGraph();
  const count = selectedIds.size;

  if (count === 0) return null;

  // Use the sorted selection key as `key` for ConfirmDelete so its state resets
  // automatically when the selection changes — the idiomatic React pattern.
  const selectionKey = Array.from(selectedIds).sort().join(',');

  return (
    <AnimatePresence>
      <motion.div
        key="toolbar"
        initial={{ opacity: 0, y: 12, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 360, damping: 28 }}
        style={{
          position: 'absolute',
          bottom: 88,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 200,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          pointerEvents: 'auto',
        }}
      >
        <ConfirmDelete key={selectionKey} count={count} onConfirm={deleteSelectedNodes} />

        {/* Main pill toolbar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          background: 'rgba(12,12,12,0.92)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 100,
          padding: '6px 10px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
        }}>
          <div style={{
            padding: '3px 10px',
            background: 'rgba(255,255,255,0.08)',
            borderRadius: 100,
            fontSize: '0.75rem',
            color: 'rgba(255,255,255,0.7)',
            fontFamily: 'var(--font-display)',
            letterSpacing: '0.5px',
            marginRight: 4,
          }}>
            {count} selected
          </div>

          <ToolButton icon={<Trash2 size={15} />} label="Delete" danger
            onClick={count > 1
              ? () => { /* ConfirmDelete handles it */ document.getElementById('morion-confirm-delete')?.click(); }
              : deleteSelectedNodes}
          />
          <ToolButton icon={<Link size={15} />} label="Link" onClick={() => {}} />
          <ToolButton icon={<Tag size={15} />} label="Tag" onClick={() => {}} />
          <ToolButton icon={<Layers size={15} />} label="Combine" onClick={() => {}} />

          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />

          <ToolButton icon={<X size={14} />} label="Deselect" onClick={clearSelection} />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/** Self-contained confirm widget; state resets when `key` changes. */
function ConfirmDelete({ count, onConfirm }: { count: number; onConfirm: () => void }) {
  const [show, setShow] = useState(false);

  if (count <= 1) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          style={{
            background: 'rgba(15,15,15,0.95)',
            border: '1px solid rgba(211,47,47,0.4)',
            borderRadius: 10,
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            backdropFilter: 'blur(16px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            fontSize: '0.85rem',
            color: 'rgba(255,255,255,0.85)',
            fontFamily: 'var(--font-display)',
          }}
        >
          <span>Delete {count} nodes?</span>
          <button
            onClick={() => setShow(false)}
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, padding: '4px 12px', color: '#fff', cursor: 'pointer', fontSize: '0.8rem' }}
          >
            Cancel
          </button>
          <button
            onClick={() => { setShow(false); onConfirm(); }}
            style={{ background: 'rgba(211,47,47,0.85)', border: '1px solid rgba(211,47,47,0.5)', borderRadius: 6, padding: '4px 12px', color: '#fff', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
          >
            Delete
          </button>
        </motion.div>
      )}

      {/* Hidden trigger for the parent Delete button */}
      {!show && (
        <button
          id="morion-confirm-delete"
          onClick={() => setShow(true)}
          style={{ display: 'none' }}
        />
      )}
    </AnimatePresence>
  );
}

function ToolButton({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      title={label}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered
          ? danger ? 'rgba(211,47,47,0.25)' : 'rgba(255,255,255,0.1)'
          : 'transparent',
        border: 'none',
        borderRadius: 100,
        padding: '7px 10px',
        color: danger
          ? hovered ? '#ff6b6b' : 'rgba(255,100,100,0.8)'
          : hovered ? '#fff' : 'rgba(255,255,255,0.55)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.15s ease, color 0.15s ease',
      }}
    >
      {icon}
    </button>
  );
}

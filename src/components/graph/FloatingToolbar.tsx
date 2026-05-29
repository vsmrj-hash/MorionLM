"use client";

import { Trash2, Sparkles, Link2 } from 'lucide-react';
import { useGraph } from '@/lib/store/GraphContext';

export default function FloatingToolbar() {
  const { selectedIds, deleteSelectedNodes, synthesizeNodes, connectSelected, isSynthesizing } = useGraph();

  const count = selectedIds.length;
  if (count === 0) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#111',
        padding: '8px 14px',
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        border: '1px solid rgba(255,255,255,0.1)',
        zIndex: 100,
        boxShadow: '0 4px 24px rgba(0,0,0,0.6)',
      }}
    >
      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', marginRight: 8, paddingRight: 10, borderRight: '1px solid rgba(255,255,255,0.1)' }}>
        {count} selected
      </span>

      <ToolbarBtn icon={<Link2 size={14} />} label="Connect" onClick={connectSelected} disabled={count < 2} />

      <ToolbarBtn
        icon={<Sparkles size={14} />}
        label={isSynthesizing ? 'Thinking...' : 'Synthesize'}
        onClick={() => synthesizeNodes('', 'patterns')}
        disabled={isSynthesizing}
        accent
      />

      <ToolbarBtn icon={<Trash2 size={14} />} label="Delete" onClick={deleteSelectedNodes} danger />
    </div>
  );
}

function ToolbarBtn({
  icon, label, onClick, disabled, accent, danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  accent?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '5px 10px', borderRadius: 6, border: 'none',
        fontSize: '0.75rem', cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1, transition: 'all 0.15s',
        background: danger ? 'rgba(211,47,47,0.12)' : accent ? 'rgba(211,47,47,0.2)' : 'rgba(255,255,255,0.06)',
        color: danger || accent ? 'rgba(211,47,47,0.9)' : 'rgba(255,255,255,0.6)',
      }}
    >
      {icon} {label}
    </button>
  );
}

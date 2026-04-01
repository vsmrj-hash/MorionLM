"use client";

import { Handle, Position, NodeProps } from '@xyflow/react';
import { motion } from 'framer-motion';
import { LucideIcon, Brain, Video, Image as ImageIcon, Sparkles, Lightbulb } from 'lucide-react';
import { useGraph } from '@/lib/store/GraphContext';
import { MorionNodeData } from '@/lib/store/GraphContext';

const typeIcons: Record<string, LucideIcon> = {
  thought: Brain,
  video: Video,
  image: ImageIcon,
  insight: Sparkles,
  idea: Lightbulb,
};

export default function BaseNode({ data, id, selected }: NodeProps) {
  const { selectedIds } = useGraph();
  const nodeData = data as MorionNodeData;
  const Icon = typeIcons[nodeData.type] || Brain;
  const isInsight = nodeData.type === 'insight';
  const isSelected = selected || selectedIds.has(id);

  const borderColor = isSelected
    ? 'rgba(255,255,255,0.6)'
    : isInsight
      ? 'var(--accent-red)'
      : 'var(--glass-border)';

  const shadowStyle = isSelected
    ? '0 0 0 2px rgba(255,255,255,0.3), 0 0 30px rgba(255,255,255,0.15)'
    : isInsight
      ? '0 0 20px rgba(211, 47, 47, 0.4)'
      : 'var(--crystal-shadow)';

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, filter: isInsight ? 'blur(12px)' : 'blur(0px)' }}
      animate={{
        scale: isSelected ? 1.04 : 1,
        opacity: 1,
        filter: 'blur(0px)'
      }}
      whileHover={{ scale: isSelected ? 1.04 : 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22, filter: { duration: 0.6 } }}
      className="glass-panel"
      style={{
        padding: '16px',
        borderRadius: '8px',
        minWidth: '220px',
        maxWidth: '300px',
        border: `1px solid ${borderColor}`,
        boxShadow: shadowStyle,
        position: 'relative',
        cursor: 'pointer',
        userSelect: 'none',
        background: isSelected ? 'rgba(30,30,30,0.75)' : undefined,
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: 'var(--text-secondary)', border: 'none', width: 8, height: 8 }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: isInsight ? 'var(--accent-red)' : isSelected ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)' }}>
        <Icon size={16} />
        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>{nodeData.type}</span>
      </div>

      <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5, wordWrap: 'break-word' }}>
        {nodeData.label}
      </div>

      {nodeData.tags && nodeData.tags.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', marginTop: '14px', flexWrap: 'wrap' }}>
          {nodeData.tags.map(tag => (
            <span key={tag} style={{
              fontSize: '0.7rem',
              padding: '2px 8px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              color: 'var(--text-secondary)'
            }}>
              #{tag}
            </span>
          ))}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} style={{ background: 'var(--text-secondary)', border: 'none', width: 8, height: 8 }} />
    </motion.div>
  );
}

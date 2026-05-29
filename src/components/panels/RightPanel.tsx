"use client";

import React, { useState } from 'react';
import {
  MessageCircle, Activity, BookOpen, List, Network, Mic,
  Sparkles, Loader2, Bot, Trash2, Zap, ChevronDown, ChevronUp
} from 'lucide-react';
import { useGraph, SynthesisResult } from '@/lib/store/GraphContext';

const MODES = [
  { id: 'ask',        label: 'Ask',      icon: MessageCircle },
  { id: 'patterns',  label: 'Patterns', icon: Activity },
  { id: 'study_guide', label: 'Study',  icon: BookOpen },
  { id: 'faq',       label: 'FAQ',      icon: List },
  { id: 'connections', label: 'Map',   icon: Network },
  { id: 'podcast',   label: 'Podcast',  icon: Mic },
] as const;

type ModeId = typeof MODES[number]['id'];

// ---- Inline markdown renderer -----------------------------------------------

function renderInline(str: string): React.ReactNode[] {
  const parts = str.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[Node \d+\])/g);
  return parts.map((part, i) => {
    if (/^\*\*.*\*\*$/.test(part))
      return <strong key={i} style={{ color: 'rgba(255,255,255,0.95)', fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
    if (/^\*.*\*$/.test(part))
      return <em key={i} style={{ color: 'rgba(255,255,255,0.75)' }}>{part.slice(1, -1)}</em>;
    if (/^`.*`$/.test(part))
      return <code key={i} style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: 3, fontSize: '0.82em', fontFamily: 'monospace' }}>{part.slice(1, -1)}</code>;
    if (/^\[Node \d+\]$/.test(part))
      return (
        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(211,47,47,0.15)', border: '1px solid rgba(211,47,47,0.3)', padding: '0 5px', borderRadius: 10, fontSize: '0.72em', color: 'rgba(211,47,47,0.9)', fontWeight: 700, marginInline: 2 }}>
          {part}
        </span>
      );
    return part;
  });
}

function MarkdownRenderer({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div style={{ fontSize: '0.84rem', lineHeight: 1.65, color: 'rgba(255,255,255,0.8)' }}>
      {lines.map((line, i) => {
        if (line.startsWith('## ')) return <h2 key={i} style={{ fontSize: '0.93rem', fontWeight: 600, color: '#fff', margin: '12px 0 5px' }}>{line.slice(3)}</h2>;
        if (line.startsWith('### ')) return <h3 key={i} style={{ fontSize: '0.87rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', margin: '10px 0 4px' }}>{line.slice(4)}</h3>;
        if (line.startsWith('# ')) return <h1 key={i} style={{ fontSize: '1.02rem', fontWeight: 700, color: '#fff', margin: '14px 0 8px' }}>{line.slice(2)}</h1>;
        if (line.startsWith('- ') || line.startsWith('* ')) return (
          <div key={i} style={{ display: 'flex', gap: 8, margin: '3px 0' }}>
            <span style={{ color: 'var(--accent-red)', flexShrink: 0 }}>•</span>
            <span>{renderInline(line.slice(2))}</span>
          </div>
        );
        const ordM = line.match(/^(\d+)\. (.*)/);
        if (ordM) return (
          <div key={i} style={{ display: 'flex', gap: 8, margin: '3px 0' }}>
            <span style={{ color: 'var(--accent-red)', flexShrink: 0, fontWeight: 600, minWidth: 16 }}>{ordM[1]}.</span>
            <span>{renderInline(ordM[2])}</span>
          </div>
        );
        if (line.startsWith('> ')) return (
          <blockquote key={i} style={{ borderLeft: '2px solid var(--accent-red)', paddingLeft: 12, margin: '8px 0', color: 'rgba(255,255,255,0.6)', fontStyle: 'italic' }}>
            {renderInline(line.slice(2))}
          </blockquote>
        );
        if (line === '') return <div key={i} style={{ height: 6 }} />;
        return <p key={i} style={{ margin: '3px 0' }}>{renderInline(line)}</p>;
      })}
    </div>
  );
}

// ---- Result card ------------------------------------------------------------

function ResultCard({ result, onCrystallize }: { result: SynthesisResult; onCrystallize: () => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const mode = MODES.find(m => m.id === result.mode);
  const ModeIcon = mode?.icon ?? Sparkles;

  return (
    <div style={{
      background: 'rgba(15,15,15,0.7)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 8,
      padding: '14px 16px',
      marginBottom: 12,
    }}>
      {/* Card header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: collapsed ? 0 : 12 }}>
        <ModeIcon size={13} color="var(--accent-red)" />
        <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.45)' }}>
          {mode?.label ?? result.mode}
        </span>
        <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)' }}>
          {result.nodeCount} node{result.nodeCount !== 1 ? 's' : ''}
        </span>
        <button onClick={() => setCollapsed(c => !c)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: 2 }}>
          {collapsed ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
        </button>
      </div>

      {!collapsed && (
        <>
          {result.query && result.query !== result.mode && (
            <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginBottom: 10, fontStyle: 'italic' }}>
              &ldquo;{result.query}&rdquo;
            </p>
          )}
          <MarkdownRenderer text={result.result} />
          <button
            onClick={onCrystallize}
            style={{
              marginTop: 14,
              background: 'rgba(211,47,47,0.1)',
              border: '1px solid rgba(211,47,47,0.25)',
              color: 'rgba(211,47,47,0.8)',
              borderRadius: 4,
              padding: '5px 10px',
              fontSize: '0.72rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              letterSpacing: '0.5px',
            }}
          >
            <Zap size={11} /> Add to Graph
          </button>
        </>
      )}
    </div>
  );
}

// ---- Main component ---------------------------------------------------------

export default function RightPanel() {
  const { synthesizeNodes, isSynthesizing, synthesisHistory, clearHistory, crystallizeResult, selectedIds, nodes } = useGraph();
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<ModeId>('ask');

  const handleSynthesize = () => {
    synthesizeNodes(query, mode);
    setQuery('');
  };

  const selectedCount = selectedIds.length;
  const totalCount = nodes.length;
  const scopeLabel = selectedCount > 0 ? `${selectedCount} selected` : `all ${totalCount}`;

  return (
    <aside style={{
      width: 320,
      height: '100%',
      position: 'absolute',
      right: 0,
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      borderLeft: '1px solid var(--glass-border)',
      background: 'rgba(8, 8, 8, 0.75)',
      backdropFilter: 'var(--glass-blur)',
      zIndex: 10,
    }}>
      {/* Header */}
      <div style={{ padding: '18px 18px 0', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <Bot size={18} color="var(--accent-red)" />
        <h2 style={{ fontSize: '0.88rem', fontWeight: 500, fontFamily: 'var(--font-display)', letterSpacing: '0.5px', flex: 1 }}>Intelligence</h2>
        {synthesisHistory.length > 0 && (
          <button onClick={clearHistory} title="Clear history" style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', cursor: 'pointer', padding: 2 }}>
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {/* Mode tabs */}
      <div style={{ display: 'flex', gap: 4, padding: '0 12px 12px', flexWrap: 'wrap' }}>
        {MODES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setMode(id as ModeId)}
            style={{
              padding: '4px 9px',
              borderRadius: 4,
              fontSize: '0.72rem',
              fontFamily: 'var(--font-display)',
              letterSpacing: '0.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              transition: 'all 0.2s',
              background: mode === id ? 'rgba(211,47,47,0.18)' : 'rgba(255,255,255,0.04)',
              border: mode === id ? '1px solid rgba(211,47,47,0.4)' : '1px solid rgba(255,255,255,0.06)',
              color: mode === id ? 'rgba(211,47,47,0.9)' : 'rgba(255,255,255,0.45)',
            }}
          >
            <Icon size={10} />{label}
          </button>
        ))}
      </div>

      {/* Results area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px' }}>
        {synthesisHistory.length === 0 ? (
          <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.82rem', textAlign: 'center', marginTop: 60, lineHeight: 1.7 }}>
            Drop your nodes.<br />
            Ask your second brain.<br />
            <span style={{ fontSize: '0.72rem', letterSpacing: '1px', textTransform: 'uppercase', marginTop: 8, display: 'block' }}>Using {scopeLabel}</span>
          </div>
        ) : (
          synthesisHistory.map(r => (
            <ResultCard key={r.id} result={r} onCrystallize={() => crystallizeResult(r)} />
          ))
        )}
      </div>

      {/* Input */}
      <div style={{ padding: '12px 14px 16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.25)', marginBottom: 6, letterSpacing: '0.5px' }}>
          SCOPE: {scopeLabel.toUpperCase()} NODE{totalCount !== 1 ? 'S' : ''}
        </div>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="crystal-input"
            placeholder={mode === 'ask' ? 'Ask your brain...' : `Run ${MODES.find(m => m.id === mode)?.label}...`}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !isSynthesizing && handleSynthesize()}
            disabled={isSynthesizing}
            style={{ paddingRight: 40 }}
          />
          <button
            onClick={handleSynthesize}
            disabled={isSynthesizing}
            style={{
              position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', color: 'var(--accent-red)',
              cursor: isSynthesizing ? 'wait' : 'pointer', opacity: isSynthesizing ? 0.5 : 1,
            }}
          >
            {isSynthesizing ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={16} />}
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin { from { transform: translateY(-50%) rotate(0deg); } to { transform: translateY(-50%) rotate(360deg); } }
      `}</style>
    </aside>
  );
}

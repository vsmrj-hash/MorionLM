"use client";

import { useState, useRef } from 'react';
import {
  Brain, Video, Image as ImageIcon, Sparkles, Lightbulb, Globe,
  ChevronDown, Plus, X, Loader2, BookOpen, Link, FileText
} from 'lucide-react';
import { useGraph, NodeType } from '@/lib/store/GraphContext';

const TYPE_ICONS: Record<string, React.ElementType> = {
  thought: Brain,
  video: Video,
  image: ImageIcon,
  insight: Sparkles,
  idea: Lightbulb,
  source: Globe,
};

const TYPE_COLORS: Record<string, string> = {
  thought: 'rgba(255,255,255,0.5)',
  video: '#5C8DFF',
  image: '#7C5CF6',
  insight: 'var(--accent-red)',
  idea: '#F5A623',
  source: '#2FB67C',
};

function NodeRow({ node, isSelected, onSelect }: { node: NodeType; isSelected: boolean; onSelect: () => void }) {
  const Icon = TYPE_ICONS[node.data.type] ?? Brain;
  const color = TYPE_COLORS[node.data.type] ?? 'rgba(255,255,255,0.5)';

  return (
    <button
      onClick={onSelect}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 8, width: '100%', textAlign: 'left',
        padding: '7px 10px', borderRadius: 6, cursor: 'pointer', border: 'none',
        background: isSelected ? 'rgba(211,47,47,0.1)' : 'transparent',
        outline: isSelected ? '1px solid rgba(211,47,47,0.3)' : 'none',
        transition: 'background 0.15s',
      }}
    >
      <Icon size={13} color={color} style={{ marginTop: 2, flexShrink: 0 }} />
      <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
        {node.data.label}
      </span>
    </button>
  );
}

export default function LeftPanel() {
  const [thought, setThought] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [pasteText, setPasteText] = useState('');
  const [ingestMode, setIngestMode] = useState<'url' | 'text'>('url');
  const [newNotebook, setNewNotebook] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotebookInput, setShowNotebookInput] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    nodes, addNode,
    notebooks, currentNotebook, addNotebook, setCurrentNotebook,
    ingestSource, isIngesting,
    selectedIds, setSelectedIds,
  } = useGraph();

  const currentNodes = nodes.filter(n => (n.data.notebook ?? 'Default') === currentNotebook);

  const handleAddThought = () => {
    if (!thought.trim()) return;
    addNode(thought, 'thought');
    setThought('');
    textareaRef.current?.focus();
  };

  const handleIngest = async () => {
    if (ingestMode === 'url') {
      const url = sourceUrl.trim();
      if (!url) return;
      const ok = await ingestSource(url);
      if (ok) setSourceUrl('');
    } else {
      const text = pasteText.trim();
      if (!text) return;
      const ok = await ingestSource('', text);
      if (ok) setPasteText('');
    }
  };

  const canIngest = ingestMode === 'url' ? sourceUrl.trim().length > 0 : pasteText.trim().length > 0;

  const handleAddNotebook = () => {
    if (!newNotebook.trim()) return;
    addNotebook(newNotebook.trim());
    setNewNotebook('');
    setShowNotebookInput(false);
  };

  const toggleNodeSelect = (nodeId: string) => {
    setSelectedIds(prev =>
      prev.includes(nodeId) ? prev.filter(id => id !== nodeId) : [...prev, nodeId]
    );
  };

  return (
    <div
      style={{
        width: 260,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#080808',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        zIndex: 10,
        flexShrink: 0,
      }}
    >
      {/* Notebook selector */}
      <div style={{ padding: '16px 14px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <BookOpen size={12} color='rgba(255,255,255,0.35)' />
          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.3)' }}>Notebook</span>
        </div>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowDropdown(p => !p)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 5, padding: '7px 10px', cursor: 'pointer', color: 'rgba(255,255,255,0.8)',
              fontFamily: 'var(--font-display)', fontSize: '0.82rem',
            }}
          >
            {currentNotebook}
            <ChevronDown size={13} color='rgba(255,255,255,0.4)' />
          </button>
          {showDropdown && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
              background: '#111', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 5, marginTop: 3, overflow: 'hidden',
            }}>
              {notebooks.map(nb => (
                <button
                  key={nb}
                  onClick={() => { setCurrentNotebook(nb); setShowDropdown(false); }}
                  style={{
                    width: '100%', textAlign: 'left', padding: '8px 12px', background: nb === currentNotebook ? 'rgba(211,47,47,0.12)' : 'transparent',
                    border: 'none', cursor: 'pointer', fontSize: '0.82rem',
                    color: nb === currentNotebook ? 'rgba(211,47,47,0.9)' : 'rgba(255,255,255,0.65)',
                  }}
                >
                  {nb}
                </button>
              ))}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                {showNotebookInput ? (
                  <div style={{ display: 'flex', gap: 4, padding: '6px 8px' }}>
                    <input
                      autoFocus
                      value={newNotebook}
                      onChange={e => setNewNotebook(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleAddNotebook(); if (e.key === 'Escape') setShowNotebookInput(false); }}
                      placeholder='Notebook name'
                      style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3, padding: '4px 8px', fontSize: '0.8rem', color: '#fff', outline: 'none' }}
                    />
                    <button onClick={handleAddNotebook} style={{ background: 'var(--accent-red)', border: 'none', borderRadius: 3, padding: '4px 8px', cursor: 'pointer', color: '#fff', fontSize: '0.8rem' }}>+</button>
                    <button onClick={() => setShowNotebookInput(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: '4px' }}><X size={12} /></button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowNotebookInput(true)}
                    style={{ width: '100%', textAlign: 'left', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <Plus size={11} /> New notebook
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Thought capture */}
      <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <p style={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.28)', marginBottom: 8 }}>Capture Thought</p>
        <textarea
          ref={textareaRef}
          value={thought}
          onChange={e => setThought(e.target.value)}
          placeholder='Record a thought...'
          className='crystal-input'
          rows={3}
          style={{ resize: 'none' }}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddThought(); } }}
        />
        <button
          onClick={handleAddThought}
          style={{
            marginTop: 8, width: '100%', padding: '8px', borderRadius: 4,
            background: thought.trim() ? 'var(--accent-red)' : 'rgba(255,255,255,0.05)',
            border: '1px solid ' + (thought.trim() ? 'var(--accent-red)' : 'rgba(255,255,255,0.08)'),
            color: thought.trim() ? '#fff' : 'rgba(255,255,255,0.3)', cursor: thought.trim() ? 'pointer' : 'default',
            fontSize: '0.78rem', fontFamily: 'var(--font-display)', letterSpacing: '0.5px', transition: 'all 0.2s',
          }}
        >
          Add Node
        </button>
      </div>

      {/* Source ingest */}
      <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <p style={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.28)', margin: 0 }}>Ingest Source</p>
          <div style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,0.04)', borderRadius: 4, padding: 2 }}>
            <button
              onClick={() => setIngestMode('url')}
              title="Ingest from URL"
              style={{
                display: 'flex', alignItems: 'center', gap: 3, padding: '3px 7px', borderRadius: 3, border: 'none', cursor: 'pointer', fontSize: '0.68rem',
                background: ingestMode === 'url' ? 'rgba(47,182,124,0.2)' : 'transparent',
                color: ingestMode === 'url' ? '#2FB67C' : 'rgba(255,255,255,0.3)',
              }}
            >
              <Link size={10} /> URL
            </button>
            <button
              onClick={() => setIngestMode('text')}
              title="Paste text directly"
              style={{
                display: 'flex', alignItems: 'center', gap: 3, padding: '3px 7px', borderRadius: 3, border: 'none', cursor: 'pointer', fontSize: '0.68rem',
                background: ingestMode === 'text' ? 'rgba(47,182,124,0.2)' : 'transparent',
                color: ingestMode === 'text' ? '#2FB67C' : 'rgba(255,255,255,0.3)',
              }}
            >
              <FileText size={10} /> Text
            </button>
          </div>
        </div>

        {ingestMode === 'url' ? (
          <div style={{ display: 'flex', gap: 5 }}>
            <input
              type='url'
              value={sourceUrl}
              onChange={e => setSourceUrl(e.target.value)}
              placeholder='https://...'
              className='crystal-input'
              onKeyDown={e => e.key === 'Enter' && handleIngest()}
              disabled={isIngesting}
              style={{ fontSize: '0.8rem' }}
            />
            <button
              onClick={handleIngest}
              disabled={isIngesting || !canIngest}
              style={{
                flexShrink: 0, padding: '0 10px', borderRadius: 4, border: 'none',
                background: 'rgba(47,182,124,0.2)', color: '#2FB67C',
                cursor: canIngest && !isIngesting ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center',
                opacity: isIngesting || !canIngest ? 0.5 : 1,
              }}
            >
              {isIngesting
                ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                : <Globe size={13} />}
            </button>
          </div>
        ) : (
          <>
            <textarea
              value={pasteText}
              onChange={e => setPasteText(e.target.value)}
              placeholder='Paste article text, notes, or any content here...'
              className='crystal-input'
              rows={4}
              disabled={isIngesting}
              style={{ resize: 'none', fontSize: '0.78rem', width: '100%' }}
            />
            <button
              onClick={handleIngest}
              disabled={isIngesting || !canIngest}
              style={{
                marginTop: 6, width: '100%', padding: '7px', borderRadius: 4,
                background: canIngest && !isIngesting ? 'rgba(47,182,124,0.15)' : 'rgba(255,255,255,0.04)',
                border: '1px solid ' + (canIngest && !isIngesting ? 'rgba(47,182,124,0.3)' : 'rgba(255,255,255,0.08)'),
                color: canIngest && !isIngesting ? '#2FB67C' : 'rgba(255,255,255,0.25)',
                cursor: canIngest && !isIngesting ? 'pointer' : 'default',
                fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              }}
            >
              {isIngesting
                ? <><Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> Ingesting...</>
                : <><Globe size={11} /> Ingest Text</>}
            </button>
          </>
        )}

        <p style={{ fontSize: '0.63rem', color: 'rgba(255,255,255,0.18)', marginTop: 6, lineHeight: 1.4 }}>
          {ingestMode === 'url'
            ? 'Claude reads the page and extracts key knowledge.'
            : 'Claude structures the pasted content into a source node.'}
        </p>
      </div>

      {/* Node list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 6px 10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px 8px' }}>
          <span style={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.28)' }}>
            {currentNotebook} — {currentNodes.length} node{currentNodes.length !== 1 ? 's' : ''}
          </span>
          {selectedIds.length > 0 && (
            <button
              onClick={() => setSelectedIds([])}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: 3 }}
            >
              <X size={10} /> Clear
            </button>
          )}
        </div>
        {currentNodes.length === 0 ? (
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 20 }}>No nodes yet.<br />Capture a thought above.</p>
        ) : (
          currentNodes.map(node => (
            <NodeRow
              key={node.id}
              node={node}
              isSelected={selectedIds.includes(node.id)}
              onSelect={() => toggleNodeSelect(node.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

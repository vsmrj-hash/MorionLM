"use client";

import { useState } from 'react';
import { Sparkles, Bot, Loader2 } from 'lucide-react';
import { useGraph } from '@/lib/store/GraphContext';

export default function RightPanel() {
  const { synthesizeNodes, isSynthesizing } = useGraph();
  const [query, setQuery] = useState('');

  const handleSynthesize = () => {
    if (!query.trim()) return;
    synthesizeNodes(query);
    setQuery('');
  };

  return (
    <aside style={{
      width: '320px',
      height: '100%',
      position: 'absolute',
      right: '0',
      top: '0',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px',
      borderLeft: '1px solid var(--glass-border)',
      background: 'rgba(10, 10, 10, 0.65)',
      backdropFilter: 'var(--glass-blur)',
      zIndex: 10
    }}>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Bot size={20} color="var(--accent-red)" />
        <h2 style={{ fontSize: '1rem', fontWeight: 500, fontFamily: 'var(--font-display)' }}>Patterns you&apos;re missing</h2>
      </div>

      <div className="glass-panel" style={{ flex: 1, borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', marginTop: '40px' }}>
          Drop your context.<br/><br/>Synthesize below to reveal the patterns you overlook.
        </div>
      </div>

      <div style={{ marginTop: '24px' }}>
        <div style={{ position: 'relative' }}>
          <input 
            type="text" 
            className="crystal-input" 
            placeholder="Ask your brain. It remembers everything." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSynthesize()}
            style={{ paddingRight: '40px' }}
            disabled={isSynthesizing}
          />
          <button 
            onClick={handleSynthesize}
            disabled={isSynthesizing}
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: 'var(--accent-red)',
              cursor: isSynthesizing ? 'wait' : 'pointer',
              opacity: isSynthesizing ? 0.5 : 1
            }}>
            {isSynthesizing ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
          </button>
        </div>
      </div>
    </aside>
  );
}

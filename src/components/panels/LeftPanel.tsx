"use client";

import { useState } from 'react';
import { PlusCircle, Image as ImageIcon, Video, Share2 } from 'lucide-react';
import { useGraph } from '@/lib/store/GraphContext';

export default function LeftPanel() {
  const { addNode } = useGraph();
  const [thought, setThought] = useState('');

  const submitThought = () => {
    if (!thought.trim()) return;
    addNode({
      label: thought,
      type: 'thought',
      tags: []
    });
    setThought('');
  };

  return (
    <aside style={{
      width: '260px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px',
      borderRight: '1px solid var(--glass-border)',
      background: 'rgba(5, 5, 5, 0.8)',
      backdropFilter: 'blur(20px)',
      zIndex: 10
    }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' }}>
          Morion <span style={{ color: 'var(--accent-red)' }}>OS</span>
        </h1>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Capture</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <textarea 
            className="crystal-input" 
            placeholder="Drop a thought. Watch it evolve."
            rows={3}
            value={thought}
            onChange={(e) => setThought(e.target.value)}
            style={{ resize: 'none' }}
          />
          <button className="crystal-button" onClick={submitThought}>
            <PlusCircle size={16} /> Lock it in
          </button>
        </div>

        <div style={{ height: '1px', background: 'var(--glass-border)', margin: '8px 0' }} />

        <button className="crystal-button">
          <ImageIcon size={16} /> Upload Media
        </button>
        <button className="crystal-button">
          <Video size={16} /> Extract Video
        </button>
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>System</h2>
        <button className="crystal-button">
          <Share2 size={16} /> Send it out
        </button>
      </div>
    </aside>
  );
}

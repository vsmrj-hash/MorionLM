"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useGraph } from '@/lib/store/GraphContext';
import { useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

export default function UndoToast() {
  const { toast, clearToast, undoDelete } = useGraph();

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(clearToast, 5000);
    return () => clearTimeout(t);
  }, [toast, clearToast]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key="undo-toast"
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 380, damping: 26 }}
          style={{
            position: 'absolute',
            bottom: 32,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 300,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'rgba(14,14,14,0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 100,
            padding: '10px 10px 10px 20px',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 10px 50px rgba(0,0,0,0.8)',
            fontFamily: 'var(--font-display)',
            fontSize: '0.875rem',
            color: 'rgba(255,255,255,0.75)',
            pointerEvents: 'auto',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ letterSpacing: '0.2px' }}>{toast.message}</span>

          <button
            onClick={() => { undoDelete(); clearToast(); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.14)',
              borderRadius: 100,
              padding: '5px 14px',
              color: '#fff',
              fontFamily: 'var(--font-display)',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer',
              letterSpacing: '0.5px',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.18)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
          >
            <RotateCcw size={13} />
            Undo
          </button>

          <button
            onClick={clearToast}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.35)',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 100,
              fontSize: '1rem',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

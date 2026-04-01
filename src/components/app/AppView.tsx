"use client";

import { useState } from 'react';
import LeftPanel from "@/components/panels/LeftPanel";
import RightPanel from "@/components/panels/RightPanel";
import GraphEngine from "@/components/graph/GraphEngine";
import { GraphProvider } from "@/lib/store/GraphContext";
import UseCasesLayer from "@/components/discovery/UseCasesLayer";
import { Compass, LogOut } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  mode: 'app' | 'demo';
  onExitDemo: () => void;
}

export default function AppView({ mode, onExitDemo }: Props) {
  const [showUseCases, setShowUseCases] = useState(false);

  return (
    <GraphProvider initialMode={mode}>
      <motion.main 
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}
      >
        <LeftPanel />
        <GraphEngine />
        <RightPanel />

        {mode === 'demo' && (
          <button 
            onClick={onExitDemo}
            className="crystal-button"
            style={{ 
              position: 'absolute', 
              top: '24px', 
              left: '50%', 
              transform: 'translateX(-50%)', 
              zIndex: 50,
              padding: '8px 16px',
              borderRadius: '100px',
              background: 'rgba(211, 47, 47, 0.15)',
              border: '1px solid rgba(211, 47, 47, 0.3)',
              color: '#fff',
              fontSize: '0.8rem',
              letterSpacing: '1px'
            }}
          >
            <LogOut size={14} />
            Exit Sandbox
          </button>
        )}

        <button 
          onClick={() => setShowUseCases(true)}
          className="crystal-button"
          style={{ 
            position: 'absolute', 
            bottom: '32px', 
            left: '50%', 
            transform: 'translateX(-50%)', 
            zIndex: 50,
            padding: '12px 24px',
            borderRadius: '100px',
            background: 'rgba(5, 5, 5, 0.8)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.8), 0 0 15px rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <Compass size={18} color="var(--accent-red)" />
          Explore Capabilities
        </button>

        <UseCasesLayer isOpen={showUseCases} onClose={() => setShowUseCases(false)} />
      </motion.main>
    </GraphProvider>
  );
}

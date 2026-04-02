"use client";

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import LandingPage from '@/components/marketing/LandingPage';
import AppView from '@/components/app/AppView';

export type ViewMode = 'landing' | 'app' | 'demo';

export default function Home() {
  const [mode, setMode] = useState<ViewMode>('landing');

  return (
    <AnimatePresence mode="wait">
      {mode === 'landing' && (
        <LandingPage 
          key="landing"
          onStartDemo={() => setMode('demo')} 
          onStartApp={() => setMode('app')} 
        />
      )}
      {(mode === 'demo' || mode === 'app') && (
        <AppView 
          key="app-view"
          mode={mode} 
          onExitDemo={() => setMode('landing')} 
        />
      )}
    </AnimatePresence>
  );
}

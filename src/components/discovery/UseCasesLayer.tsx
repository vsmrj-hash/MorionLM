"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Sparkles, Activity, FileText, CheckCircle, PenTool, Database, Clock, Eye } from 'lucide-react';
import styles from './use-cases.module.css';

interface UseCaseData {
  id: string;
  title: string;
  scenario: string;
  icon: React.ElementType;
  inputs?: React.ReactNode;
  outputs: React.ReactNode;
}

const USE_CASES: UseCaseData[] = [
  {
    id: 'synthesis',
    title: 'Turn scattered thoughts into sharp ideas',
    scenario: 'You’ve consumed multiple videos and random thoughts.',
    icon: Sparkles,
    inputs: (
      <ul>
        <li>3 video links</li>
        <li>2 thoughts</li>
        <li>1 voice note</li>
      </ul>
    ),
    outputs: '→ A refined startup idea with positioning, angle, and execution plan'
  },
  {
    id: 'pattern',
    title: 'See what you’re blind to',
    scenario: 'You’ve been journaling or capturing thoughts daily.',
    icon: Activity,
    inputs: <span>Daily journal logs over 30 days</span>,
    outputs: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span>→ &quot;You abandon projects at the same stage&quot;</span>
        <span>→ &quot;Your best ideas come after long-form content consumption&quot;</span>
      </div>
    )
  },
  {
    id: 'fusion',
    title: 'Combine anything. Get something new.',
    scenario: 'You select a recent video, last image, and a spoken thought.',
    icon: FileText,
    inputs: (
      <ul>
        <li>Recent video</li>
        <li>Last image</li>
        <li>Thought you just spoke</li>
      </ul>
    ),
    outputs: '→ A creative concept / story / visual idea combining all inputs'
  },
  {
    id: 'decision',
    title: 'Stop overthinking. Decide faster.',
    scenario: 'You dump pros/cons, emotions, and context.',
    icon: CheckCircle,
    inputs: <span>Pros/cons list + emotional context</span>,
    outputs: '→ Clear recommendation + reasoning + trade-offs'
  },
  {
    id: 'content',
    title: 'Create content that actually hits',
    scenario: 'You feed notes, inspirations, and previous posts.',
    icon: PenTool,
    inputs: (
      <ul>
        <li>Raw Notes</li>
        <li>Inspirations</li>
        <li>Previous successful posts</li>
      </ul>
    ),
    outputs: '→ Script, hooks, or post ideas strictly aligned with your voice'
  },
  {
    id: 'memory',
    title: 'Never lose a thought again',
    scenario: 'Ask: "What did I think about AI agents last week?"',
    icon: Database,
    inputs: <span>Query: &quot;AI agents last week&quot;</span>,
    outputs: '→ Exact thoughts + connected ideas + evolution'
  },
  {
    id: 'digest',
    title: 'Your brain, summarized',
    scenario: 'System auto-analyzes your week.',
    icon: Clock,
    inputs: <span>7 days of continuous graph mapping</span>,
    outputs: '→ Patterns, contradictions, opportunities sent to Telegram/Email'
  },
  {
    id: 'awareness',
    title: 'Know yourself without bias',
    scenario: 'You track thoughts, mood, actions.',
    icon: Eye,
    inputs: <span>Behavioral inputs + metadata</span>,
    outputs: '→ Behavioral insights + emotional patterns exposed objectively'
  }
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function UseCasesLayer({ isOpen, onClose }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        >
          <div className={styles.header}>
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              System <span style={{ color: 'var(--accent-red)' }}>Capabilities</span>
            </motion.h2>
            <button className={styles.closeButton} onClick={onClose} aria-label="Close Use Cases">
              <X size={24} />
            </button>
          </div>

          <div className={styles.scrollContainer}>
            {USE_CASES.map((uc, i) => {
              const Icon = uc.icon;
              return (
                <motion.div
                  key={uc.id}
                  className={styles.card}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  whileHover={{ y: -5 }}
                >
                  <Icon size={24} color="var(--accent-red)" style={{ marginBottom: '16px' }} />
                  <h3 className={styles.title}>{uc.title}</h3>
                  <p className={styles.scenario}>{uc.scenario}</p>

                  <div className={styles.dataBlock}>
                    <div className={styles.dataLabel}>Input</div>
                    <div className={styles.dataContent}>{uc.inputs}</div>
                  </div>

                  <div className={`${styles.dataBlock} ${styles.outputBlock}`}>
                    <div className={styles.dataLabel} style={{ color: 'var(--accent-red)' }}>
                      Output <ArrowRight size={12} />
                    </div>
                    <div className={`${styles.dataContent} ${styles.outputContent}`}>
                      {uc.outputs}
                    </div>
                  </div>

                  <button 
                    className={styles.tryButton}
                    onClick={() => {
                      // Demo logic can inject this to graph context.
                      alert(`Activating demo context for: ${uc.title}`);
                    }}
                  >
                    Try this
                  </button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

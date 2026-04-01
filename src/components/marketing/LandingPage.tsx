"use client";

import { motion } from "framer-motion";
import styles from "./landing.module.css";
import { ArrowRight, Sparkles } from "lucide-react";

interface Props {
  onStartDemo: () => void;
  onStartApp: () => void;
}

export default function LandingPage({ onStartDemo, onStartApp }: Props) {
  return (
    <div className={styles.container}>
      {/* SECTION 1: HERO */}
      <section className={`${styles.section} ${styles.hero}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <div style={{ marginBottom: '24px', padding: '8px 16px', borderRadius: '100px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
            <Sparkles size={14} style={{ display: 'inline', marginRight: '8px', color: 'var(--accent-red)' }} />
            Morion OS v1.0
          </div>
          <h1 className={styles.headline}>Your mind is scattered.<br />This connects it.</h1>
          <p className={styles.subheadline}>
            MORIONLM turns everything you consume and think into a system that actually works.
          </p>
          <div className={styles.ctaGroup}>
            <button className={styles.ctaPrimary} onClick={onStartDemo}>
              Try Demo
            </button>
            <button className={styles.ctaSecondary} onClick={onStartApp}>
              Start Building
            </button>
          </div>
        </motion.div>
      </section>

      {/* SECTION 2: PROBLEM */}
      <section className={styles.section} style={{ minHeight: '60vh' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className={styles.problemText}>
            You consume. <span>You forget.</span><br />
            You think. <span>You lose it.</span><br />
            You start. <span>You stop.</span>
          </p>
        </motion.div>
      </section>

      {/* SECTION 3: SOLUTION */}
      <section className={`${styles.section} ${styles.solutionSection}`}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', marginBottom: '24px' }}>
            This is not note-taking.<br />
            <span style={{ color: 'var(--accent-red)' }}>This is thinking, upgraded.</span>
          </h2>
          <div style={{ width: '100%', maxWidth: '800px', height: '400px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            [ Graph Visualization Simulation ]
          </div>
        </motion.div>
      </section>

      {/* SECTION 4: HOW IT WORKS */}
      <section className={styles.section}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', marginBottom: '16px' }}>How it works</h2>
        <div className={styles.grid}>
          <div className={styles.gridCard}>
            <div className={styles.gridNumber}>01</div>
            <div className={styles.gridTitle}>Capture anything</div>
            <div style={{ color: 'var(--text-secondary)' }}>(text, video, voice, image)</div>
          </div>
          <div className={styles.gridCard}>
            <div className={styles.gridNumber}>02</div>
            <div className={styles.gridTitle}>It connects automatically</div>
            <div style={{ color: 'var(--text-secondary)' }}>Context is fused instantly.</div>
          </div>
          <div className={styles.gridCard}>
            <div className={styles.gridNumber}>03</div>
            <div className={styles.gridTitle}>It tells you what matters</div>
            <div style={{ color: 'var(--text-secondary)' }}>Uncover missing patterns.</div>
          </div>
        </div>
      </section>

      {/* SECTION 6: LIVE DEMO CTA */}
      <section className={styles.section} style={{ minHeight: '60vh' }}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          style={{ padding: '64px', background: 'rgba(20,20,20,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', cursor: 'pointer' }}
          onClick={onStartDemo}
        >
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', marginBottom: '24px' }}>Don’t read. Try it.</h2>
          <button className={styles.ctaPrimary} style={{ background: 'var(--accent-red)', color: '#fff' }}>
            Launch Demo <ArrowRight size={18} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '8px' }} />
          </button>
        </motion.div>
      </section>

      {/* SECTION 7: DIFFERENTIATION */}
      <section className={styles.section}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', marginBottom: '64px' }}>Why MORIONLM?</h2>
        <div className={styles.diffSection}>
          <div className={styles.diffRow}>
            <div className={styles.diffLabel}>vs NotebookLM</div>
            <div className={styles.diffValue}>Your entire life context, not just docs.</div>
          </div>
          <div className={styles.diffRow}>
            <div className={styles.diffLabel}>vs Obsidian</div>
            <div className={styles.diffValue}>Actual thinking, not just dead links.</div>
          </div>
        </div>
      </section>

      {/* SECTION 8: FINAL CTA */}
      <section className={styles.section} style={{ minHeight: '60vh' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '3.5rem', marginBottom: '16px' }}>
          You don’t need more information.
        </h2>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '3.5rem', color: 'var(--accent-red)', marginBottom: '48px' }}>
          You need clarity.
        </h2>
        <button className={styles.ctaPrimary} style={{ padding: '20px 48px', fontSize: '1.2rem' }} onClick={onStartApp}>
          Start Using MORIONLM
        </button>
      </section>

      <footer className={styles.footer}>
        MORIONLM © 2026. Built for cognitive clarity.
      </footer>
    </div>
  );
}

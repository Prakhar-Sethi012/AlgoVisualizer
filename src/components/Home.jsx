import React from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Zap,
  Calculator,
  GitBranch,
  Network,
  Layers,
  ArrowRight,
  Cpu,
  Activity,
  CheckCircle2,
  Terminal,
  BarChart2
} from 'lucide-react';

export function Home({ onNavigate }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10 pb-12 max-w-5xl mx-auto"
    >
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <motion.div
        variants={itemVariants}
        className="relative text-center space-y-5 pt-6 sm:pt-12 rounded-2xl overflow-hidden px-6 pb-8"
      >
        {/* Subtle grid background */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-40"
          style={{
            backgroundImage:
              'linear-gradient(to right, #80808014 1px, transparent 1px), linear-gradient(to bottom, #80808014 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        {/* Radial fade from center so grid fades out at edges */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background: 'radial-gradient(ellipse 70% 60% at 50% 40%, transparent 30%, var(--color-bg) 100%)',
          }}
        />

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight font-sans">
          Algorithm Visualizer &{' '}
          <span
            className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500"
          >
            Benchmarking Lab
          </span>
        </h1>

        <p className="text-base sm:text-lg text-theme-text-muted max-w-2xl mx-auto font-sans leading-relaxed">
          Explore algorithm state machines step-by-step with interactive generators, then benchmark
          them on dedicated Web Workers to validate theoretical math against bare-metal hardware.
        </p>

        {/* Soft pill badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs font-mono">
          <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full px-4 py-1 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5" /> Web Worker Multi-Threading
          </span>
          <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full px-4 py-1 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" /> ES6 Generator State Machines
          </span>
          <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full px-4 py-1 flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5" /> Master Theorem Recurrence Engine
          </span>
        </div>
      </motion.div>

      {/* ── Core Triad Feature Cards ──────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: The Visualizer */}
        <div
          onClick={() => onNavigate('visualizer')}
          className="group relative bg-slate-900/50 backdrop-blur-md border border-white/5 rounded-2xl p-6 overflow-hidden
                     transition-all duration-300 cursor-pointer
                     hover:-translate-y-1 hover:border-white/10 hover:shadow-[0_0_30px_rgba(99,102,241,0.1)]
                     flex flex-col justify-between"
        >
          {/* Subtle gradient overlay on hover */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
               style={{ background: 'radial-gradient(ellipse 60% 40% at 30% 20%, rgba(99,102,241,0.06), transparent)' }} />

          <div className="space-y-3 relative">
            <div className="bg-indigo-500/10 text-indigo-400 p-3 rounded-lg w-fit group-hover:bg-indigo-500/15 transition-colors">
              <Play className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-sans">The Visualizer</h3>
              <div className="text-xs font-mono text-slate-400 mt-0.5">Time-Traveling State Machines</div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Step-by-step state machine inspector for Sorting, Searching, and Trees. Control execution speed, scrub through swaps, and inspect variables deterministically.
            </p>
          </div>
          <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-indigo-400 group-hover:translate-x-0.5 transition-transform relative">
            <span>Launch Visualizer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 2: The Benchmarking Lab */}
        <div
          onClick={() => onNavigate('benchmark')}
          className="group relative bg-slate-900/50 backdrop-blur-md border border-white/5 rounded-2xl p-6 overflow-hidden
                     transition-all duration-300 cursor-pointer
                     hover:-translate-y-1 hover:border-white/10 hover:shadow-[0_0_30px_rgba(99,102,241,0.1)]
                     flex flex-col justify-between"
        >
          <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
               style={{ background: 'radial-gradient(ellipse 60% 40% at 30% 20%, rgba(99,102,241,0.06), transparent)' }} />

          <div className="space-y-3 relative">
            <div className="bg-indigo-500/10 text-indigo-400 p-3 rounded-lg w-fit group-hover:bg-indigo-500/15 transition-colors">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-sans">The Benchmark Lab</h3>
              <div className="text-xs font-mono text-slate-400 mt-0.5">Bare-Metal Execution Races</div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Multi-threaded Web Worker races to plot empirical Big-O runtimes. Stress algorithms with up to 5,000,000 integers in background threads with zero UI jank.
            </p>
          </div>
          <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-indigo-400 group-hover:translate-x-0.5 transition-transform relative">
            <span>Enter Benchmark Lab</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 3: The Math Engine */}
        <div
          onClick={() => onNavigate('recurrence')}
          className="group relative bg-slate-900/50 backdrop-blur-md border border-white/5 rounded-2xl p-6 overflow-hidden
                     transition-all duration-300 cursor-pointer
                     hover:-translate-y-1 hover:border-white/10 hover:shadow-[0_0_30px_rgba(99,102,241,0.1)]
                     flex flex-col justify-between"
        >
          <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
               style={{ background: 'radial-gradient(ellipse 60% 40% at 30% 20%, rgba(99,102,241,0.06), transparent)' }} />

          <div className="space-y-3 relative">
            <div className="bg-indigo-500/10 text-indigo-400 p-3 rounded-lg w-fit group-hover:bg-indigo-500/15 transition-colors">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-sans">The Math Engine</h3>
              <div className="text-xs font-mono text-slate-400 mt-0.5">Master Theorem &amp; Curve Fitting</div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Symbolic Master Theorem solver and asymptotic curve fitting. Parse divide-and-conquer recurrences and overlay theoretical curves directly on hardware runtimes.
            </p>
          </div>
          <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-indigo-400 group-hover:translate-x-0.5 transition-transform relative">
            <span>Solve Recurrences</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </motion.div>

      {/* ── Secondary Modules ─────────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="space-y-3">
        <div className="text-xs font-mono uppercase tracking-wider text-theme-text-muted px-1 flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-theme-primary" />
          <span>Specialized Data Structure Modules</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              view: 'trees',
              Icon: GitBranch,
              title: 'AVL Trees',
              desc: 'Interactive LL, RR, LR, and RL self-balancing rotations with animated height recalculation.',
            },
            {
              view: 'equation-converter',
              Icon: Calculator,
              title: 'Equation Converter',
              desc: 'AST generation via Shunting-Yard parser with step-by-step Postfix (RPN) and Prefix traversals.',
            },
            {
              view: 'graphs',
              Icon: Network,
              title: 'Graphs & MST',
              desc: 'Dijkstra shortest path and Kruskal MST algorithms with Disjoint Set Union cycle prevention.',
            },
            {
              view: 'data-structures',
              Icon: Layers,
              title: 'Linear Structures',
              desc: 'Radial circular linked lists, doubly linked chains, and animated LIFO stack & FIFO queue pipelines.',
            },
          ].map(({ view, Icon, title, desc }) => (
            <button
              key={view}
              onClick={() => onNavigate(view)}
              className="group p-4 rounded-xl bg-theme-surface/60 border border-theme-border
                         hover:border-white/10 hover:bg-slate-900/60 hover:-translate-y-0.5
                         hover:shadow-[0_0_20px_rgba(99,102,241,0.07)]
                         transition-all duration-200 text-left flex items-start gap-3"
            >
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/15 transition-colors flex-shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-theme-text font-sans">{title}</div>
                <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{desc}</div>
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Theory vs Reality Matrix ──────────────────────────────────────────── */}
      <motion.div
        variants={itemVariants}
        className="rounded-xl border border-theme-border bg-theme-surface/50 p-6 space-y-4"
      >
        <div className="flex items-center gap-2 text-sm font-bold text-theme-text font-sans">
          <BarChart2 className="w-4 h-4 text-theme-primary" />
          <span>Core Educational Hook: Theory vs. Reality</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 rounded-lg bg-theme-bg/60 border border-theme-border space-y-2">
            <div className="text-theme-primary font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Theoretical CS (Textbooks)</span>
            </div>
            <p className="text-slate-400 leading-relaxed font-sans text-xs">
              Abstract asymptotic bounds ($O(n \log n)$ vs $O(n^2)$) assume uniform memory access and zero hardware constant factors. In paper proofs, hardware caches and compiler optimizations do not exist.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-theme-bg/60 border border-theme-border space-y-2">
            <div className="text-emerald-400 font-bold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>Empirical Reality (Bare Metal)</span>
            </div>
            <p className="text-slate-400 leading-relaxed font-sans text-xs">
              V8 JIT optimization, L1/L2 cache locality, CPU branch prediction, and memory allocation overhead drastically reshape execution time. Watch theoretical curves align with real hardware measurements.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

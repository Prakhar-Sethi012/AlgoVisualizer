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
  Sparkles,
  CheckCircle2,
  Clock,
  Terminal,
  BarChart2
} from 'lucide-react';

export function Home({ onNavigate }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10 pb-12 max-w-5xl mx-auto"
    >
      {/* Hero Section */}
      <motion.div variants={itemVariants} className="text-center space-y-4 pt-4 sm:pt-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-theme-primary/10 border border-theme-primary/25 text-theme-primary text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Computer Science Laboratory</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-theme-text font-sans">
          Algorithm Visualizer &{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-theme-primary via-emerald-400 to-cyan-400">
            Benchmarking Lab
          </span>
        </h1>

        <p className="text-base sm:text-xl text-theme-text-muted max-w-2xl mx-auto font-sans">
          Watch algorithms think, then race them on bare metal to prove the math.
        </p>

        {/* Quick Metrics Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs font-mono text-theme-text-muted">
          <span className="px-2.5 py-1 rounded-md bg-theme-surface border border-theme-border flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-theme-primary" /> Web Worker Multi-Threading
          </span>
          <span className="px-2.5 py-1 rounded-md bg-theme-surface border border-theme-border flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" /> ES6 Yield State Machines
          </span>
          <span className="px-2.5 py-1 rounded-md bg-theme-surface border border-theme-border flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5 text-purple-400" /> Master Theorem Engine
          </span>
        </div>
      </motion.div>

      {/* Core Triad Feature Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: The Visualizer */}
        <div
          onClick={() => onNavigate('visualizer')}
          className="group relative bg-theme-surface hover:bg-theme-surface-hover rounded-xl border border-theme-border hover:border-theme-primary p-6 transition-all duration-200 cursor-pointer shadow-subtle flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-theme-primary/10 border border-theme-primary/30 flex items-center justify-center text-theme-primary group-hover:scale-105 transition-transform">
              <Play className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-theme-text font-sans">The Visualizer</h3>
              <div className="text-xs font-mono text-theme-primary mt-0.5">Time-Traveling State Machines</div>
            </div>
            <p className="text-xs text-theme-text-muted leading-relaxed font-sans">
              Step-by-step state machines for Sorting, Searching, Trees, and Graphs. Control execution speed, scrub through swaps, and watch array bars glide via spring physics.
            </p>
          </div>
          <div className="mt-5 pt-4 border-t border-theme-border flex items-center justify-between text-xs font-mono text-theme-primary group-hover:translate-x-1 transition-transform">
            <span>Launch Visualizer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 2: The Benchmarking Lab */}
        <div
          onClick={() => onNavigate('benchmark')}
          className="group relative bg-theme-surface hover:bg-theme-surface-hover rounded-xl border border-theme-border hover:border-emerald-500 p-6 transition-all duration-200 cursor-pointer shadow-subtle flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-theme-text font-sans">The Benchmark Lab</h3>
              <div className="text-xs font-mono text-emerald-400 mt-0.5">Bare-Metal Execution Races</div>
            </div>
            <p className="text-xs text-theme-text-muted leading-relaxed font-sans">
              Multi-threaded Web Worker races to plot empirical Big-O. Benchmarks algorithms across up to 5,000,000 elements on a background thread without freezing the UI.
            </p>
          </div>
          <div className="mt-5 pt-4 border-t border-theme-border flex items-center justify-between text-xs font-mono text-emerald-400 group-hover:translate-x-1 transition-transform">
            <span>Enter Benchmark Lab</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 3: The Math Engine */}
        <div
          onClick={() => onNavigate('recurrence')}
          className="group relative bg-theme-surface hover:bg-theme-surface-hover rounded-xl border border-theme-border hover:border-purple-500 p-6 transition-all duration-200 cursor-pointer shadow-subtle flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-theme-text font-sans">The Math Engine</h3>
              <div className="text-xs font-mono text-purple-400 mt-0.5">Master Theorem & Curve Fitting</div>
            </div>
            <p className="text-xs text-theme-text-muted leading-relaxed font-sans">
              Master theorem solver and theoretical curve fitting. Parses divide-and-conquer recurrences via Regex and scales theoretical asymptotic curves onto hardware runtimes.
            </p>
          </div>
          <div className="mt-5 pt-4 border-t border-theme-border flex items-center justify-between text-xs font-mono text-purple-400 group-hover:translate-x-1 transition-transform">
            <span>Solve Recurrences</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </motion.div>

      {/* Additional Dedicated Modules */}
      <motion.div variants={itemVariants} className="space-y-3">
        <div className="text-xs font-mono uppercase tracking-wider text-theme-text-muted px-1 flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-theme-primary" />
          <span>Specialized Data Structure Modules</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => onNavigate('trees')}
            className="p-4 rounded-xl bg-theme-surface border border-theme-border hover:border-purple-400/50 hover:bg-theme-surface-hover transition-all text-left flex items-start gap-3 group"
          >
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-105 transition-transform">
              <GitBranch className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-theme-text font-sans">AVL Trees</div>
              <div className="text-[11px] text-theme-text-muted mt-0.5">
                Physical LL, RR, LR, RL balancing rotations with coordinate recalculation.
              </div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('equation-converter')}
            className="p-4 rounded-xl bg-theme-surface border border-theme-border hover:border-pink-400/50 hover:bg-theme-surface-hover transition-all text-left flex items-start gap-3 group"
          >
            <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20 group-hover:scale-105 transition-transform">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-theme-text font-sans">Equation Converter</div>
              <div className="text-[11px] text-theme-text-muted mt-0.5">
                Expression Tree AST, Shunting-Yard builder, Postfix (RPN) &amp; Prefix tracers.
              </div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('graphs')}
            className="p-4 rounded-xl bg-theme-surface border border-theme-border hover:border-cyan-400/50 hover:bg-theme-surface-hover transition-all text-left flex items-start gap-3 group"
          >
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-105 transition-transform">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-theme-text font-sans">Graphs & MST</div>
              <div className="text-[11px] text-theme-text-muted mt-0.5">
                Dijkstra shortest path and Kruskal MST with Union-Find cycle detection.
              </div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('data-structures')}
            className="p-4 rounded-xl bg-theme-surface border border-theme-border hover:border-cyan-400/50 hover:bg-theme-surface-hover transition-all text-left flex items-start gap-3 group"
          >
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-105 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-theme-text font-sans">Linear Structures</div>
              <div className="text-[11px] text-theme-text-muted mt-0.5">
                Linked Lists (Singly, Doubly, Circular), Stack (LIFO), and Queue (FIFO) with amber pointer traversal.
              </div>
            </div>
          </button>
        </div>
      </motion.div>

      {/* Theory vs Reality Matrix */}
      <motion.div
        variants={itemVariants}
        className="rounded-xl border border-theme-border bg-theme-surface/70 p-6 space-y-4"
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
            <p className="text-theme-text-muted leading-relaxed font-sans text-xs">
              Abstract asymptotic bounds ($O(n \log n)$ vs $O(n^2)$) assume uniform memory access and zero hardware constant factors. In paper proofs, hardware caches and compiler optimizations do not exist.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-theme-bg/60 border border-theme-border space-y-2">
            <div className="text-emerald-400 font-bold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>Empirical Reality (Bare Metal)</span>
            </div>
            <p className="text-theme-text-muted leading-relaxed font-sans text-xs">
              V8 JIT optimization, L1/L2 cache locality, CPU branch prediction, and memory allocation overhead drastically reshape execution time. Watch theoretical curves align with real hardware measurements.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

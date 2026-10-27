import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitBranch,
  Play,
  Pause,
  StepForward,
  RotateCcw,
  Plus,
  Shuffle,
  Info,
  CheckCircle2,
  AlertTriangle,
  Zap,
  ArrowRight
} from 'lucide-react';
import { AVLTree } from '../../core/algorithms/trees/avlTree';
import { calculateTreeLayout } from '../../core/utils/treeLayout';

const NODE_RADIUS = 22;

export function TreeView() {
  const [inputValue, setInputValue] = useState('');
  const [speedMs, setSpeedMs] = useState(300);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDone, setIsDone] = useState(true);

  // Persistent AVL tree instance
  const treeRef = useRef(new AVLTree());
  const activeGeneratorRef = useRef(null);

  // Layout & UI display state
  const [treeState, setTreeState] = useState({
    root: null,
    activeNodeId: null,
    newNodeId: null,
    imbalanceNodeId: null,
    rotatedNodeIds: [],
    stepInfo: 'AVL Tree ready. Insert numbers to watch self-balancing rotations.'
  });

  const containerRef = useRef(null);
  const [containerDimensions, setContainerDimensions] = useState({ width: 800, height: 450 });

  // Dynamically update container dimensions on window and container resize
  useEffect(() => {
    function updateDimensions() {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        if (clientWidth > 0 && clientHeight > 0) {
          setContainerDimensions({
            width: Math.max(clientWidth, 360),
            height: Math.max(clientHeight, 360)
          });
        }
      }
    }

    updateDimensions();

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0) {
            setContainerDimensions((prev) => {
              if (Math.abs(prev.width - width) < 4 && Math.abs(prev.height - height) < 4) {
                return prev;
              }
              return {
                width: Math.max(width, 360),
                height: Math.max(height, 360)
              };
            });
          }
        }
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', updateDimensions);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Compute node and edge layout from current tree snapshot
  const { nodes, edges } = useMemo(() => {
    return calculateTreeLayout(
      treeState.root,
      containerDimensions.width,
      containerDimensions.height
    );
  }, [treeState.root, containerDimensions.width, containerDimensions.height]);

  // Memoized SVG Edge array to prevent layout thrashing and repaints
  const edgeElements = useMemo(() => {
    return edges.map((edge) => (
      <line
        key={edge.id}
        x1={edge.x1}
        y1={edge.y1}
        x2={edge.x2}
        y2={edge.y2}
        stroke="#64748b"
        strokeWidth={2}
        strokeOpacity={0.4}
        style={{
          transition: 'x1 300ms ease, y1 300ms ease, x2 300ms ease, y2 300ms ease',
          willChange: 'x1, y1, x2, y2'
        }}
      />
    ));
  }, [edges]);

  // Execute single generator step
  const handleStep = () => {
    if (!activeGeneratorRef.current) return;

    const { value, done } = activeGeneratorRef.current.next();
    if (value) {
      setTreeState(value);
    }
    if (done) {
      setIsPlaying(false);
      setIsDone(true);
      activeGeneratorRef.current = null;
    }
  };

  // Automated step loop when playing
  useEffect(() => {
    if (!isPlaying || isDone) return;

    const timer = setTimeout(() => {
      if (!activeGeneratorRef.current) {
        setIsPlaying(false);
        setIsDone(true);
        return;
      }

      const { value, done } = activeGeneratorRef.current.next();
      if (value) {
        setTreeState(value);
      }
      if (done) {
        setIsPlaying(false);
        setIsDone(true);
        activeGeneratorRef.current = null;
      }
    }, speedMs);

    return () => clearTimeout(timer);
  }, [isPlaying, isDone, treeState, speedMs]);

  // Start insertion flow
  const startInsertion = (val) => {
    const num = parseInt(val, 10);
    if (isNaN(num)) return;

    setIsPlaying(true);
    setIsDone(false);

    // Create generator for insertion
    const gen = treeRef.current.insert(num);
    activeGeneratorRef.current = gen;

    const initialYield = gen.next().value;
    if (initialYield) {
      setTreeState(initialYield);
    }
    setInputValue('');
  };

  const handleFormSubmit = (e) => {
    if (e) e.preventDefault();
    if (inputValue.trim() !== '') {
      startInsertion(inputValue);
    }
  };

  const handleRandomInsert = () => {
    const rand = Math.floor(Math.random() * 85) + 10;
    startInsertion(rand);
  };

  const handleClear = () => {
    treeRef.current.clear();
    activeGeneratorRef.current = null;
    setIsPlaying(false);
    setIsDone(true);
    setTreeState({
      root: null,
      activeNodeId: null,
      newNodeId: null,
      imbalanceNodeId: null,
      rotatedNodeIds: [],
      stepInfo: 'Tree cleared. Ready for fresh insertions.'
    });
  };

  // Presets designed specifically to illustrate rotations
  const handleRunPreset = (presetSequence, name) => {
    handleClear();
    setTreeState((prev) => ({
      ...prev,
      stepInfo: `Starting preset: ${name} (${presetSequence.join(', ')})...`
    }));

    // Sequential insertion chain
    let idx = 0;
    function insertNext() {
      if (idx < presetSequence.length) {
        const val = presetSequence[idx++];
        startInsertion(val);
      }
    }
    insertNext();
  };

  // Determine node styling based on state
  const getNodeColorClass = (node) => {
    // 1. Imbalance warning
    if (treeState.imbalanceNodeId === node.id) {
      return 'bg-rose-500/15 border-rose-500 text-rose-200 ring-1 ring-rose-500/40';
    }
    // 2. Newly rotated node
    if (treeState.rotatedNodeIds?.includes(node.id)) {
      return 'bg-purple-500/15 border-purple-400 text-purple-200 ring-1 ring-purple-400/40';
    }
    // 3. Active comparison traversal
    if (treeState.activeNodeId === node.id) {
      return 'bg-amber-500/15 border-amber-400 text-amber-200 ring-1 ring-amber-400/40';
    }
    // 4. Newly inserted leaf
    if (treeState.newNodeId === node.id) {
      return 'bg-emerald-500/15 border-emerald-400 text-emerald-200 ring-1 ring-emerald-400/40';
    }
    // 5. Default node
    return 'bg-theme-card border-theme-border text-theme-text hover:border-theme-primary';
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Top Header & Educational Context */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-theme-border">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-theme-text font-sans">
              AVL Tree Visualizer
            </h1>
            <span className="px-2 py-0.5 text-xs font-mono rounded bg-theme-primary/10 border border-theme-primary/20 text-theme-primary">
              Self-Balancing BST
            </span>
            <span className="px-2 py-0.5 text-xs font-mono rounded bg-theme-surface border border-theme-border text-theme-accent">
              Height: O(log n)
            </span>
          </div>
          <p className="text-sm text-theme-text-muted mt-1">
            Maintains strict height balance where for every node, |height(left) - height(right)| ≤ 1 via physical LL, RR, LR, and RL rotations.
          </p>
        </div>

        {/* Tree Telemetry HUD */}
        <div className="flex items-center gap-4 bg-theme-surface p-2.5 px-4 rounded-lg border border-theme-border font-mono text-xs self-start sm:self-auto">
          <div>
            <span className="text-theme-text-muted">Total Nodes:</span>{' '}
            <span className="font-semibold text-theme-primary">{nodes.length}</span>
          </div>
          <div className="h-4 w-px bg-theme-border" />
          <div>
            <span className="text-theme-text-muted">Root:</span>{' '}
            <span className="font-semibold text-theme-accent">
              {treeState.root ? treeState.root.value : 'None'}
            </span>
          </div>
          <div className="h-4 w-px bg-theme-border" />
          <div>
            <span className="text-theme-text-muted">Max Height:</span>{' '}
            <span className="font-semibold text-emerald-400">
              {treeState.root ? treeState.root.height : 0}
            </span>
          </div>
        </div>
      </div>

      {/* Rotation Presets Bar */}
      <div className="space-y-2">
        <div className="text-xs font-mono text-theme-text-muted flex items-center gap-1.5">
          <GitBranch className="w-3.5 h-3.5 text-theme-primary" />
          <span>Interactive Rotation Presets:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleRunPreset([30, 20, 10], 'Left-Left (Right Rotation)')}
            className="px-3 py-1.5 rounded-lg text-xs font-mono bg-theme-surface hover:bg-theme-surface-hover text-theme-text border border-theme-border transition-colors flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span>LL Rotation (30, 20, 10)</span>
          </button>
          <button
            onClick={() => handleRunPreset([10, 20, 30], 'Right-Right (Left Rotation)')}
            className="px-3 py-1.5 rounded-lg text-xs font-mono bg-theme-surface hover:bg-theme-surface-hover text-theme-text border border-theme-border transition-colors flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>RR Rotation (10, 20, 30)</span>
          </button>
          <button
            onClick={() => handleRunPreset([30, 10, 20], 'Left-Right (Double Rotation)')}
            className="px-3 py-1.5 rounded-lg text-xs font-mono bg-theme-surface hover:bg-theme-surface-hover text-theme-text border border-theme-border transition-colors flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>LR Double (30, 10, 20)</span>
          </button>
          <button
            onClick={() => handleRunPreset([10, 30, 20], 'Right-Left (Double Rotation)')}
            className="px-3 py-1.5 rounded-lg text-xs font-mono bg-theme-surface hover:bg-theme-surface-hover text-theme-text border border-theme-border transition-colors flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>RL Double (10, 30, 20)</span>
          </button>
        </div>
      </div>

      {/* Main Visualizer Container with Relative Positioning */}
      <div
        ref={containerRef}
        className="flex-1 min-h-[420px] bg-theme-surface rounded-xl border border-theme-border p-4 shadow-subtle relative overflow-hidden flex flex-col justify-between"
      >
        {/* Step Inspector HUD */}
        <div className="absolute top-4 left-4 right-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pointer-events-none z-20">
          <div className="flex items-center gap-2 text-xs font-mono bg-theme-bg/90 backdrop-blur-sm px-3 py-1.5 rounded-md border border-theme-border text-theme-text max-w-xl truncate shadow-subtle">
            <Info className="w-3.5 h-3.5 text-theme-primary flex-shrink-0" />
            <span className="truncate">{treeState.stepInfo}</span>
          </div>

          {/* Color Legend */}
          <div className="hidden md:flex items-center gap-3 text-[11px] font-mono bg-theme-bg/90 backdrop-blur-sm px-3 py-1.5 rounded-md border border-theme-border shadow-subtle">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
              <span className="text-theme-text-muted">Comparing</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
              <span className="text-theme-text-muted">Imbalance</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block" />
              <span className="text-theme-text-muted">Rotated</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
              <span className="text-theme-text-muted">Balanced</span>
            </div>
          </div>
        </div>

        {/* Tree Rendering Area (SVG Background Edges + Framer Motion Foreground Nodes) */}
        <div className="w-full h-full relative min-h-[360px] select-none">
          {/* Background SVG Edge Layer */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {edgeElements}
          </svg>

          {/* Foreground Animated Nodes with AnimatePresence */}
          <AnimatePresence>
            {nodes.map((node) => {
              return (
                <motion.div
                  key={node.id}
                  layout
                  layoutId={`tree-node-${node.id}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    x: node.x - NODE_RADIUS,
                    y: node.y - NODE_RADIUS,
                    scale: 1,
                    opacity: 1
                  }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: NODE_RADIUS * 2,
                    height: NODE_RADIUS * 2
                  }}
                  className={`rounded-full border-2 flex flex-col items-center justify-center font-mono shadow-minimal z-10 cursor-pointer transition-colors ${getNodeColorClass(
                    node
                  )}`}
                >
                  <span className="text-xs font-bold leading-none">{node.value}</span>
                  <span className="text-[8px] font-mono text-theme-text-muted/80 mt-0.5 leading-none">
                    bf:{node.balanceFactor}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {nodes.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-theme-text-muted space-y-2 pointer-events-none">
              <GitBranch className="w-8 h-8 text-theme-border" />
              <div className="text-xs font-mono">Tree is currently empty.</div>
              <div className="text-[11px] font-mono text-theme-text-muted/60">
                Insert elements or click one of the rotation presets above.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-theme-surface rounded-xl border border-theme-border p-4 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-subtle">
        {/* Insert Form & Presets */}
        <form onSubmit={handleFormSubmit} className="flex items-center gap-2 w-full lg:w-auto">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Number (e.g. 45)"
            disabled={isPlaying}
            className="w-32 sm:w-36 bg-theme-bg border border-theme-border rounded-lg px-3 py-2 text-xs font-mono text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary"
          />

          <button
            type="submit"
            disabled={isPlaying || !inputValue.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-theme-primary hover:bg-theme-primary-hover text-slate-950 transition-all shadow-subtle disabled:opacity-40"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Insert</span>
          </button>

          <button
            type="button"
            onClick={handleRandomInsert}
            disabled={isPlaying}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono border border-theme-border bg-theme-card hover:bg-theme-surface-hover text-theme-text-muted hover:text-theme-text transition-colors disabled:opacity-40"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Random</span>
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={isPlaying || nodes.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono border border-theme-border bg-theme-card hover:bg-theme-surface-hover text-theme-text-muted hover:text-theme-text transition-colors disabled:opacity-40"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Tree</span>
          </button>
        </form>

        {/* Stepping & Speed Controls */}
        <div className="flex items-center gap-4 w-full lg:w-auto justify-end">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={isDone && !activeGeneratorRef.current}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-xs transition-all shadow-subtle disabled:opacity-40 ${
                isPlaying
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-theme-card hover:bg-theme-surface-hover text-theme-text border border-theme-border'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5" /> Pause
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" /> Play
                </>
              )}
            </button>

            <button
              onClick={handleStep}
              disabled={isPlaying || (isDone && !activeGeneratorRef.current)}
              className="flex items-center gap-1 px-3.5 py-2 rounded-lg text-xs font-medium border border-theme-border bg-theme-card hover:bg-theme-surface-hover text-theme-text transition-colors disabled:opacity-40"
            >
              <StepForward className="w-3.5 h-3.5" /> Step
            </button>
          </div>

          {/* Speed slider */}
          <div className="flex items-center gap-2 text-xs font-mono text-theme-text-muted">
            <Zap className="w-3.5 h-3.5 text-theme-accent" />
            <input
              type="range"
              min="50"
              max="700"
              step="50"
              value={750 - speedMs}
              onChange={(e) => setSpeedMs(750 - Number(e.target.value))}
              className="w-20 accent-theme-primary cursor-pointer"
            />
            <span className="w-10 text-right">{speedMs}ms</span>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitBranch,
  Play,
  Pause,
  StepForward,
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle2,
  Copy,
  Check,
  Zap,
  ArrowRight,
  ArrowDown,
  Calculator,
  Terminal,
  HelpCircle,
  FileCode,
  Layers
} from 'lucide-react';
import {
  buildExpressionTree,
  getPostfix,
  getPrefix,
  getInfix
} from '../../core/algorithms/trees/expressionTree';
import { calculateTreeLayout } from '../../core/utils/treeLayout';

const NODE_RADIUS = 24;

const EQUATION_PRESETS = [
  { label: 'Basic Precedence', expr: 'a+b*c' },
  { label: 'Parenthesized', expr: '(a+b)*(c-d)' },
  { label: 'Multi-Operator', expr: 'a+b-c*d' },
  { label: 'Exponentiation', expr: 'a+b*c^d' },
  { label: 'Complex Nested', expr: '(a+b*c)/(d-e^f)' }
];

export function ExpressionConverterView() {
  const [equationInput, setEquationInput] = useState('a+b*c');
  const [speedMs, setSpeedMs] = useState(350);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeMode, setActiveMode] = useState('idle'); // 'idle' | 'building' | 'postfix' | 'prefix' | 'infix'
  const [traversalType, setTraversalType] = useState('postfix'); // 'postfix' | 'prefix' | 'infix'

  // Tree and Generator State
  const [treeRoot, setTreeRoot] = useState(null);
  const [activeNodeId, setActiveNodeId] = useState(null);
  const [visitedNodeIds, setVisitedNodeIds] = useState([]);
  const [currentResultString, setCurrentResultString] = useState('');
  const [statusMessage, setStatusMessage] = useState(
    'Expression Graph Converter ready. Enter an equation and build the expression tree.'
  );
  const [operatorStackDisplay, setOperatorStackDisplay] = useState([]);
  const [copied, setCopied] = useState(false);

  // Viewport Sizing
  const containerRef = useRef(null);
  const [containerDimensions, setContainerDimensions] = useState({ width: 800, height: 420 });

  // Generator & Animation Loop references
  const generatorRef = useRef(null);
  const timerRef = useRef(null);
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  // Responsive Dimensions Listener
  useEffect(() => {
    function updateDimensions() {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        if (clientWidth > 0 && clientHeight > 0) {
          setContainerDimensions({
            width: Math.max(clientWidth, 380),
            height: Math.max(clientHeight, 380)
          });
        }
      }
    }

    updateDimensions();

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0) {
            setContainerDimensions((prev) => {
              if (Math.abs(prev.width - width) < 4 && Math.abs(prev.height - height) < 4) {
                return prev;
              }
              return {
                width: Math.max(width, 380),
                height: Math.max(height, 380)
              };
            });
          }
        }
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    window.addEventListener('resize', updateDimensions);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateDimensions);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Compute node and edge layout from active tree root
  const { nodes, edges } = useMemo(() => {
    return calculateTreeLayout(
      treeRoot,
      containerDimensions.width,
      containerDimensions.height
    );
  }, [treeRoot, containerDimensions]);

  // Memoized SVG Edge array to prevent layout thrashing and repaints
  const edgeElements = useMemo(() => {
    return edges.map((edge) => {
      const isChildActive = activeNodeId === edge.childId;
      const isParentActive = activeNodeId === edge.parentId;
      const isHighlighted = isChildActive || isParentActive;
      return (
        <line
          key={edge.id}
          x1={edge.x1}
          y1={edge.y1}
          x2={edge.x2}
          y2={edge.y2}
          stroke={isHighlighted ? '#ec4899' : 'var(--color-border)'}
          strokeWidth={isHighlighted ? 3.5 : 2}
          strokeOpacity={isHighlighted ? 1 : 0.6}
          style={{
            transition: 'x1 300ms ease, y1 300ms ease, x2 300ms ease, y2 300ms ease, stroke 300ms ease, stroke-width 300ms ease',
            willChange: 'x1, y1, x2, y2'
          }}
        />
      );
    });
  }, [edges, activeNodeId]);

  // Stop running animation
  const stopExecution = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsPlaying(false);
    generatorRef.current = null;
  };

  // Step runner for active generator
  const runNextStep = useCallback(() => {
    if (!generatorRef.current) {
      setIsPlaying(false);
      return;
    }

    const { value: stepState, done } = generatorRef.current.next();

    if (done || !stepState) {
      setIsPlaying(false);
      generatorRef.current = null;
      return;
    }

    // Apply yielded state
    if (stepState.root !== undefined) setTreeRoot(stepState.root);
    if (stepState.activeNodeId !== undefined) setActiveNodeId(stepState.activeNodeId);
    if (stepState.visitedNodeIds !== undefined) setVisitedNodeIds(stepState.visitedNodeIds);
    if (stepState.currentString !== undefined) setCurrentResultString(stepState.currentString);
    if (stepState.operatorStack !== undefined) setOperatorStackDisplay(stepState.operatorStack);
    if (stepState.stepInfo) setStatusMessage(stepState.stepInfo);

    if (isPlayingRef.current) {
      timerRef.current = setTimeout(() => {
        runNextStep();
      }, speedMs);
    }
  }, [speedMs]);

  // Launch a new generator
  const startGenerator = (gen, mode) => {
    stopExecution();
    setActiveMode(mode);
    generatorRef.current = gen;
    setIsPlaying(true);
    // Execute first step almost immediately
    setTimeout(() => {
      runNextStep();
    }, 50);
  };

  // Action: Build Expression Graph
  const handleBuildTree = (e) => {
    if (e) e.preventDefault();
    if (!equationInput.trim()) return;

    setActiveNodeId(null);
    setVisitedNodeIds([]);
    setCurrentResultString('');
    setOperatorStackDisplay([]);

    const gen = buildExpressionTree(equationInput.trim());
    startGenerator(gen, 'building');
  };

  // Action: Trace Postfix (Post-order)
  const handleTracePostfix = () => {
    if (!treeRoot) {
      setStatusMessage('Please build the Expression Tree first before tracing.');
      return;
    }

    setTraversalType('postfix');
    setActiveNodeId(null);
    setVisitedNodeIds([]);
    setCurrentResultString('');

    const gen = getPostfix(treeRoot);
    startGenerator(gen, 'postfix');
  };

  // Action: Trace Prefix (Pre-order)
  const handleTracePrefix = () => {
    if (!treeRoot) {
      setStatusMessage('Please build the Expression Tree first before tracing.');
      return;
    }

    setTraversalType('prefix');
    setActiveNodeId(null);
    setVisitedNodeIds([]);
    setCurrentResultString('');

    const gen = getPrefix(treeRoot);
    startGenerator(gen, 'prefix');
  };

  // Action: Trace Infix (In-order)
  const handleTraceInfix = () => {
    if (!treeRoot) {
      setStatusMessage('Please build the Expression Tree first before tracing.');
      return;
    }

    setTraversalType('infix');
    setActiveNodeId(null);
    setVisitedNodeIds([]);
    setCurrentResultString('');

    const gen = getInfix(treeRoot);
    startGenerator(gen, 'infix');
  };

  // Play / Pause toggle
  const handleTogglePlay = () => {
    if (isPlaying) {
      stopExecution();
    } else if (generatorRef.current) {
      setIsPlaying(true);
      timerRef.current = setTimeout(() => {
        runNextStep();
      }, speedMs);
    }
  };

  // Step Forward
  const handleStepForward = () => {
    if (isPlaying) {
      stopExecution();
    }
    runNextStep();
  };

  // Reset
  const handleReset = () => {
    stopExecution();
    setActiveNodeId(null);
    setVisitedNodeIds([]);
    setCurrentResultString('');
    setOperatorStackDisplay([]);
    setStatusMessage('Cleared equation workbench.');
    setActiveMode('idle');
  };

  // Load Preset
  const handleLoadPreset = (presetExpr) => {
    setEquationInput(presetExpr);
    stopExecution();
    setActiveNodeId(null);
    setVisitedNodeIds([]);
    setCurrentResultString('');
    setOperatorStackDisplay([]);
    // Automatically build tree for the preset
    const gen = buildExpressionTree(presetExpr);
    startGenerator(gen, 'building');
  };

  // Copy result string to clipboard
  const handleCopyResult = () => {
    if (!currentResultString) return;
    navigator.clipboard.writeText(currentResultString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine node visual styling
  const getNodeColorClass = (node) => {
    const isActive = activeNodeId === node.id;
    const isVisited = visitedNodeIds.includes(node.id);
    const isOperator = ['+', '-', '*', '/', '^', '%'].includes(node.value);

    // 1. Active Traversal Focus (Glowing Pink Accent)
    if (isActive) {
      return 'border-pink-500 bg-pink-500/25 text-pink-200 ring-4 ring-pink-400/70 shadow-[0_0_25px_rgba(236,72,153,0.8)] scale-110';
    }

    // 2. Visited in Traversal (Glowing Emerald Accent)
    if (isVisited) {
      return 'border-emerald-500 bg-emerald-500/20 text-emerald-200 ring-2 ring-emerald-400/40';
    }

    // 3. Unvisited Operator (Cyan Accent)
    if (isOperator) {
      return 'border-cyan-500/60 bg-cyan-950/40 text-cyan-300 hover:border-cyan-400';
    }

    // 4. Unvisited Operand Leaf (Purple Accent)
    return 'border-purple-500/60 bg-purple-950/40 text-purple-300 hover:border-purple-400';
  };

  // Result tokens array for animated display chips
  const resultTokenList = currentResultString ? currentResultString.split(' ').filter(Boolean) : [];

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Top Header & Presets */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-theme-border">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-cyan-400 to-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-pink-400" />
              <span>Expression Tree &amp; Notation Converter</span>
            </span>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-mono text-theme-text-muted mr-1">Presets:</span>
            {EQUATION_PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => handleLoadPreset(p.expr)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all border ${
                  equationInput === p.expr
                    ? 'bg-theme-card text-pink-400 font-bold border-pink-500/60 shadow-subtle'
                    : 'bg-theme-surface text-theme-text-muted hover:text-theme-text border-theme-border'
                }`}
              >
                {p.expr}
              </button>
            ))}
          </div>
        </div>

        {/* Telemetry HUD */}
        <div className="flex flex-wrap items-center gap-3 bg-theme-surface p-2.5 px-4 rounded-lg border border-theme-border font-mono text-xs self-start lg:self-auto">
          <div>
            <span className="text-theme-text-muted">Equation:</span>{' '}
            <span className="font-semibold text-pink-400">{equationInput || 'None'}</span>
          </div>
          <div className="h-4 w-px bg-theme-border" />
          <div>
            <span className="text-theme-text-muted">Tree Nodes:</span>{' '}
            <span className="font-semibold text-cyan-400">{nodes.length}</span>
          </div>
          <div className="h-4 w-px bg-theme-border" />
          <div>
            <span className="text-theme-text-muted">Phase:</span>{' '}
            <span className="font-semibold text-amber-400 uppercase tracking-wider">
              {activeMode}
            </span>
          </div>
        </div>
      </div>

      {/* Control Action Panel */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-theme-surface/70 rounded-xl border border-theme-border shadow-subtle">
        {/* Equation Input & Build Form */}
        <form onSubmit={handleBuildTree} className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={equationInput}
              onChange={(e) => setEquationInput(e.target.value)}
              placeholder="e.g. (a+b)*(c-d)"
              className="w-44 sm:w-56 px-3 py-1.5 rounded-lg bg-theme-card border border-theme-border text-xs font-mono text-theme-text focus:outline-none focus:ring-1 focus:ring-pink-500"
            />
          </div>

          <button
            type="submit"
            className="px-3.5 py-1.5 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/40 text-xs font-mono font-semibold text-pink-300 transition-colors flex items-center gap-1.5 shadow-subtle"
          >
            <GitBranch className="w-3.5 h-3.5 text-pink-400" />
            <span>Build Expression Graph</span>
          </button>
        </form>

        {/* Notation Tracing Triggers */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleTracePostfix}
            disabled={!treeRoot}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 border shadow-subtle ${
              activeMode === 'postfix'
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                : treeRoot
                ? 'bg-theme-card hover:bg-theme-surface-hover text-theme-text hover:text-cyan-400 border-theme-border'
                : 'bg-theme-surface text-theme-text-muted/40 border-theme-border cursor-not-allowed'
            }`}
          >
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
            <span>Trace Postfix (RPN)</span>
          </button>

          <button
            onClick={handleTracePrefix}
            disabled={!treeRoot}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 border shadow-subtle ${
              activeMode === 'prefix'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                : treeRoot
                ? 'bg-theme-card hover:bg-theme-surface-hover text-theme-text hover:text-emerald-400 border-theme-border'
                : 'bg-theme-surface text-theme-text-muted/40 border-theme-border cursor-not-allowed'
            }`}
          >
            <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />
            <span>Trace Prefix (Polish)</span>
          </button>

          <button
            onClick={handleTraceInfix}
            disabled={!treeRoot}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all border ${
              activeMode === 'infix'
                ? 'bg-purple-500 text-slate-950 border-purple-400 font-bold'
                : treeRoot
                ? 'bg-theme-card hover:bg-theme-surface-hover text-theme-text-muted hover:text-purple-400 border-theme-border'
                : 'bg-theme-surface text-theme-text-muted/40 border-theme-border cursor-not-allowed'
            }`}
            title="In-order traversal produces parenthesized Infix"
          >
            <span>Infix</span>
          </button>
        </div>

        {/* Playback Controls & Speed */}
        <div className="flex items-center gap-2 border-l border-theme-border pl-3">
          <button
            onClick={handleTogglePlay}
            disabled={!generatorRef.current}
            className={`p-1.5 rounded-lg border text-xs font-mono transition-all ${
              isPlaying
                ? 'bg-pink-500/20 border-pink-500 text-pink-400'
                : generatorRef.current
                ? 'bg-theme-card border-theme-border text-theme-text hover:text-pink-400'
                : 'bg-theme-surface border-theme-border text-theme-text-muted/40 cursor-not-allowed'
            }`}
            title={isPlaying ? 'Pause' : 'Resume Generator'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          </button>

          <button
            onClick={handleStepForward}
            disabled={!generatorRef.current}
            className={`p-1.5 rounded-lg border text-xs font-mono transition-all ${
              generatorRef.current
                ? 'bg-theme-card border-theme-border text-theme-text hover:text-pink-400'
                : 'bg-theme-surface border-theme-border text-theme-text-muted/40 cursor-not-allowed'
            }`}
            title="Step Forward"
          >
            <StepForward className="w-4 h-4" />
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-theme-card hover:bg-theme-surface-hover border border-theme-border text-theme-text-muted hover:text-theme-text transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1 ml-1 text-xs font-mono text-theme-text-muted">
            <span>Speed:</span>
            <select
              value={speedMs}
              onChange={(e) => setSpeedMs(Number(e.target.value))}
              className="bg-theme-card border border-theme-border rounded px-1.5 py-0.5 text-theme-text text-xs focus:outline-none font-mono"
            >
              <option value={600}>Slow (600ms)</option>
              <option value={350}>Normal (350ms)</option>
              <option value={150}>Fast (150ms)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Canvas Viewport for Tree Visualization */}
      <div
        ref={containerRef}
        className="flex-1 min-h-[420px] bg-theme-surface rounded-xl border border-theme-border p-6 flex flex-col justify-between shadow-subtle relative overflow-hidden"
      >
        {/* Floating Top Explainer Badge */}
        <div className="flex items-center justify-between pointer-events-none z-20 mb-4">
          <div className="flex items-center gap-2 text-xs font-mono bg-theme-bg/95 backdrop-blur-md px-3.5 py-2 rounded-lg border border-theme-border text-theme-text max-w-xl truncate shadow-subtle">
            <Info className="w-4 h-4 text-pink-400 flex-shrink-0" />
            <span className="truncate">{statusMessage}</span>
          </div>

          {/* Shunting Yard Operator Stack HUD during build */}
          {operatorStackDisplay.length > 0 && (
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono bg-theme-card/90 px-3 py-1.5 rounded-lg border border-theme-border text-theme-text-muted">
              <span>Op Stack:</span>
              <div className="flex items-center gap-1">
                {operatorStackDisplay.map((op, idx) => (
                  <span
                    key={idx}
                    className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold"
                  >
                    {op}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tree Rendering Area */}
        <div className="relative flex-1 w-full h-full min-h-[280px]">
          {/* Background SVG Connectors */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <defs>
              <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ec4899" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            {edgeElements}
          </svg>

          {/* Foreground Animated Nodes */}
          <AnimatePresence>
            {nodes.map((node) => {
              const isOperator = ['+', '-', '*', '/', '^', '%'].includes(node.value);
              const isActive = activeNodeId === node.id;

              return (
                <motion.div
                  key={node.id}
                  layout
                  layoutId={`expr-node-${node.id}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    x: node.x - NODE_RADIUS,
                    y: node.y - NODE_RADIUS,
                    scale: 1,
                    opacity: 1
                  }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: NODE_RADIUS * 2,
                    height: NODE_RADIUS * 2
                  }}
                  className={`rounded-full border-2 flex flex-col items-center justify-center font-mono shadow-subtle z-10 select-none transition-all duration-200 ${getNodeColorClass(
                    node
                  )}`}
                >
                  <span className={`font-bold leading-none ${isOperator ? 'text-sm' : 'text-xs'}`}>
                    {node.value}
                  </span>
                  <span className="text-[7px] font-mono opacity-60 uppercase mt-0.5 leading-none">
                    {isOperator ? 'op' : 'var'}
                  </span>

                  {/* Active Traversal Pointer Ping */}
                  {isActive && (
                    <motion.div
                      layoutId="activePing"
                      className="absolute inset-0 rounded-full border-2 border-pink-400 animate-ping opacity-60 pointer-events-none"
                    />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {nodes.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-theme-text-muted space-y-2 pointer-events-none">
              <GitBranch className="w-8 h-8 text-pink-500/40" />
              <div className="text-xs font-mono">No expression tree rendered.</div>
              <div className="text-[11px] font-mono text-theme-text-muted/60">
                Click &quot;Build Expression Graph&quot; above or pick a preset equation.
              </div>
            </div>
          )}
        </div>

        {/* Sleek Dynamic Result HUD Banner */}
        <div className="mt-4 pt-4 border-t border-theme-border z-20">
          <div className="rounded-xl bg-theme-card/90 border border-theme-border p-4 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/30">
                <Terminal className="w-5 h-5" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase tracking-wider font-bold text-theme-text">
                    {traversalType === 'postfix'
                      ? 'Postfix Output (Reverse Polish Notation)'
                      : traversalType === 'prefix'
                      ? 'Prefix Output (Polish Notation)'
                      : 'Infix Parenthesized Representation'}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-pink-500/10 text-pink-400 border border-pink-500/20">
                    {traversalType === 'postfix' ? 'Post-order' : traversalType === 'prefix' ? 'Pre-order' : 'In-order'}
                  </span>
                </div>

                {/* Animated Character Result Banner */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2 min-h-[32px]">
                  <span className="text-sm font-mono text-theme-text-muted mr-1 font-bold">
                    Result:
                  </span>
                  {resultTokenList.length > 0 ? (
                    <AnimatePresence>
                      {resultTokenList.map((token, idx) => {
                        const isOp = ['+', '-', '*', '/', '^', '%'].includes(token);
                        const isLatest = idx === resultTokenList.length - 1;
                        return (
                          <motion.span
                            key={`${token}-${idx}`}
                            initial={{ scale: 0, opacity: 0, y: -10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold border transition-all ${
                              isLatest
                                ? 'bg-pink-500 text-slate-950 border-pink-400 shadow-[0_0_12px_rgba(236,72,153,0.6)] scale-105'
                                : isOp
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                                : 'bg-theme-bg text-theme-text border-theme-border'
                            }`}
                          >
                            {token}
                          </motion.span>
                        );
                      })}
                    </AnimatePresence>
                  ) : (
                    <span className="text-xs font-mono text-theme-text-muted/60 italic">
                      Click &quot;Trace Postfix&quot; or &quot;Trace Prefix&quot; to animate traversal output...
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Copy Button */}
            {currentResultString && (
              <button
                onClick={handleCopyResult}
                className="self-end sm:self-auto px-3 py-1.5 rounded-lg bg-theme-bg hover:bg-theme-surface-hover border border-theme-border text-xs font-mono text-theme-text-muted hover:text-theme-text transition-colors flex items-center gap-1.5"
                title="Copy converted string"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-theme-text-muted" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Educational Matrix Footer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono text-theme-text-muted mt-6 pt-4 border-t border-theme-border">
          <div className="p-3 rounded-lg bg-theme-bg/40 border border-theme-border">
            <div className="text-purple-400 font-bold mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Infix Notation</span>
            </div>
            <p className="text-[11px] font-sans leading-relaxed">
              Standard operator-between-operands syntax ($a + b * c$). Ambiguous without precedence rules or explicit grouping parentheses.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-theme-bg/40 border border-theme-border">
            <div className="text-cyan-400 font-bold mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Postfix (RPN)</span>
            </div>
            <p className="text-[11px] font-sans leading-relaxed">
              Reverse Polish Notation derived from Post-order traversal ($a\ b\ c\ *\ +$). Unambiguous; requires zero parentheses and evaluates via a single stack.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-theme-bg/40 border border-theme-border">
            <div className="text-emerald-400 font-bold mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Prefix (Polish)</span>
            </div>
            <p className="text-[11px] font-sans leading-relaxed">
              Polish Notation derived from Pre-order traversal ($+\ a\ *\ b\ c$). Operators precede operands; forms the foundation of LISP S-expressions and AST compilers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

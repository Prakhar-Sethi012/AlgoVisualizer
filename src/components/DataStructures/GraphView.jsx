import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Network,
  Play,
  Pause,
  StepForward,
  RotateCcw,
  Shuffle,
  Info,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Waypoints,
  GitBranch,
  ArrowRight,
  TrendingUp,
  Maximize2,
  Layers
} from 'lucide-react';
import {
  GRAPH_PRESETS,
  initialNodes,
  initialEdges,
  randomizeWeights,
  getScaledNodes
} from '../../core/utils/graphData';
import { dijkstra } from '../../core/algorithms/graphs/dijkstra';
import { kruskal } from '../../core/algorithms/graphs/kruskal';

const NODE_RADIUS = 22;

export function GraphView() {
  // Map preset selection: 'wheel' | 'grid' | 'bottleneck'
  const [selectedMapId, setSelectedMapId] = useState('wheel');

  // Algorithm selection: 'dijkstra' | 'kruskal'
  const [algoMode, setAlgoMode] = useState('dijkstra');

  // Graph state: edges with weights, start/target nodes
  const [edges, setEdges] = useState(initialEdges);
  const [startNodeId, setStartNodeId] = useState('A');
  const [targetNodeId, setTargetNodeId] = useState('D');

  // Animation & Execution State
  const [speedMs, setSpeedMs] = useState(300);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDone, setIsDone] = useState(true);

  const activeGeneratorRef = useRef(null);

  // Layout container dimensions
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 720, height: 400 });

  // Dynamically recompute node positions on container or window resize
  useEffect(() => {
    function handleResize() {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        if (clientWidth > 0 && clientHeight > 0) {
          setDimensions({
            width: Math.max(clientWidth, 340),
            height: Math.max(clientHeight, 340)
          });
        }
      }
    }
    handleResize();

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0) {
            setDimensions({
              width: Math.max(width, 340),
              height: Math.max(height, 340)
            });
          }
        }
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', handleResize);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const nodes = useMemo(() => {
    return getScaledNodes(selectedMapId, dimensions.width, dimensions.height);
  }, [selectedMapId, dimensions]);

  // Lookup map for fast node coordinate retrieval
  const nodeMap = useMemo(() => {
    const map = {};
    for (const n of nodes) {
      map[n.id] = n;
    }
    return map;
  }, [nodes]);

  // Live yielded algorithm state
  const [visualState, setVisualState] = useState({
    phase: 'IDLE',
    activeNodeId: null,
    visitedNodeIds: [],
    evaluatingEdgeId: null,
    neighborNodeId: null,
    updatedNodeId: null,
    cycleEdgeId: null,
    pathEdgeIds: [],
    pathNodeIds: [],
    mstEdgeIds: [],
    rejectedEdgeIds: [],
    distances: {},
    previous: {},
    sortedEdges: [],
    totalWeight: 0,
    stepInfo: 'Map loaded. Choose Run or Step to watch the algorithm explore.'
  });

  // Step runner
  const handleStep = () => {
    if (!activeGeneratorRef.current) return;

    const { value, done } = activeGeneratorRef.current.next();
    if (value) {
      setVisualState((prev) => ({ ...prev, ...value }));
    }
    if (done) {
      setIsPlaying(false);
      setIsDone(true);
      activeGeneratorRef.current = null;
    }
  };

  // Playback timer loop
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
        setVisualState((prev) => ({ ...prev, ...value }));
      }
      if (done) {
        setIsPlaying(false);
        setIsDone(true);
        activeGeneratorRef.current = null;
      }
    }, speedMs);

    return () => clearTimeout(timer);
  }, [isPlaying, isDone, speedMs, visualState]);

  // Start Dijkstra
  const startDijkstra = () => {
    resetVisualState();
    setIsPlaying(true);
    setIsDone(false);

    const gen = dijkstra(nodes, edges, startNodeId, targetNodeId);
    activeGeneratorRef.current = gen;

    const initialYield = gen.next().value;
    if (initialYield) {
      setVisualState((prev) => ({ ...prev, ...initialYield }));
    }
  };

  // Start Kruskal
  const startKruskal = () => {
    resetVisualState();
    setIsPlaying(true);
    setIsDone(false);

    const gen = kruskal(nodes, edges);
    activeGeneratorRef.current = gen;

    const initialYield = gen.next().value;
    if (initialYield) {
      setVisualState((prev) => ({ ...prev, ...initialYield }));
    }
  };

  // Switch between graph presets (Wheel, City Grid, Bottleneck)
  const handleMapChange = (mapId) => {
    setSelectedMapId(mapId);
    const preset = GRAPH_PRESETS[mapId] || GRAPH_PRESETS.wheel;
    setEdges(preset.edges);
    setStartNodeId(preset.defaultStart);
    setTargetNodeId(preset.defaultTarget);
    resetVisualState();
    setVisualState((prev) => ({
      ...prev,
      stepInfo: `Loaded ${preset.name}. Select an algorithm to begin visualization.`
    }));
  };

  // Randomize edge weights
  const handleRandomizeWeights = () => {
    const updated = randomizeWeights(edges);
    setEdges(updated);
    resetVisualState();
    setVisualState((prev) => ({
      ...prev,
      stepInfo: 'Randomized all road travel costs between 1 and 20.'
    }));
  };

  // Reset visualizer state
  const resetVisualState = () => {
    activeGeneratorRef.current = null;
    setIsPlaying(false);
    setIsDone(true);
    setVisualState({
      phase: 'IDLE',
      activeNodeId: null,
      visitedNodeIds: [],
      evaluatingEdgeId: null,
      neighborNodeId: null,
      updatedNodeId: null,
      cycleEdgeId: null,
      pathEdgeIds: [],
      pathNodeIds: [],
      mstEdgeIds: [],
      rejectedEdgeIds: [],
      distances: {},
      previous: {},
      sortedEdges: [],
      totalWeight: 0,
      stepInfo: 'Map ready. Choose an operation to explore.'
    });
  };

  // Switch between Dijkstra and Kruskal
  const handleModeChange = (mode) => {
    setAlgoMode(mode);
    resetVisualState();
  };

  // Determine edge SVG styling
  const getEdgeStyle = (edge) => {
    // 1. Rejected cycle in Kruskal
    if (visualState.cycleEdgeId === edge.id || visualState.rejectedEdgeIds?.includes(edge.id)) {
      return {
        stroke: '#ef4444',
        strokeWidth: 3,
        strokeDasharray: '5 3',
        opacity: visualState.cycleEdgeId === edge.id ? 1 : 0.4,
        isHighlighted: true,
        badgeBg: '#450a0a',
        badgeBorder: '#ef4444',
        textColor: '#fca5a5'
      };
    }

    // 2. Currently evaluating edge
    if (visualState.evaluatingEdgeId === edge.id) {
      return {
        stroke: '#fbbf24',
        strokeWidth: 4,
        strokeDasharray: 'none',
        opacity: 1,
        isHighlighted: true,
        badgeBg: '#451a03',
        badgeBorder: '#fbbf24',
        textColor: '#fde68a'
      };
    }

    // 3. Accepted into MST or Dijkstra Shortest Path
    const isPath = visualState.pathEdgeIds?.includes(edge.id);
    const isMst = visualState.mstEdgeIds?.includes(edge.id);
    if (isPath || isMst) {
      return {
        stroke: '#06b6d4',
        strokeWidth: 4.5,
        strokeDasharray: 'none',
        opacity: 1,
        isHighlighted: true,
        badgeBg: '#083344',
        badgeBorder: '#06b6d4',
        textColor: '#67e8f9'
      };
    }

    // 4. Default edge
    return {
      stroke: '#64748b',
      strokeWidth: 2,
      strokeDasharray: 'none',
      opacity: 0.35,
      isHighlighted: false,
      badgeBg: '#1e293b',
      badgeBorder: '#334155',
      textColor: '#94a3b8'
    };
  };

  // Determine node styling
  const getNodeColorClass = (node) => {
    // 1. Active node extracted from queue
    if (visualState.activeNodeId === node.id) {
      return 'bg-amber-500/25 border-amber-400 text-amber-200 ring-4 ring-amber-400/40 shadow-glow';
    }
    // 2. Neighbor node under evaluation
    if (visualState.neighborNodeId === node.id) {
      return 'bg-cyan-500/20 border-cyan-400 text-cyan-200 ring-4 ring-cyan-400/30';
    }
    // 3. Final path node in Dijkstra
    if (visualState.pathNodeIds?.includes(node.id)) {
      return 'bg-cyan-500/25 border-cyan-400 text-cyan-200 ring-4 ring-cyan-400/40';
    }
    // 4. Visited node
    if (visualState.visitedNodeIds?.includes(node.id)) {
      return 'bg-emerald-500/20 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400/30';
    }
    // 5. Start node (if idle/ready)
    if (algoMode === 'dijkstra' && node.id === startNodeId) {
      return 'bg-purple-500/20 border-purple-400 text-purple-200 ring-2 ring-purple-400/40';
    }
    // 6. Target node (if idle/ready)
    if (algoMode === 'dijkstra' && node.id === targetNodeId) {
      return 'bg-rose-500/20 border-rose-400 text-rose-200 ring-2 ring-rose-400/40';
    }
    // 7. Default node
    return 'bg-theme-card border-theme-border text-theme-text hover:border-theme-primary';
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Top Header & Educational Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-theme-border">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-theme-text font-sans">
              Graph Visualizer
            </h1>
            <span className="px-2 py-0.5 text-xs font-mono rounded bg-theme-primary/10 border border-theme-primary/20 text-theme-primary">
              {algoMode === 'dijkstra' ? "Dijkstra's Shortest Path" : "Kruskal's MST"}
            </span>
            <span className="px-2 py-0.5 text-xs font-mono rounded bg-theme-surface border border-theme-border text-theme-accent">
              {algoMode === 'dijkstra' ? 'O((V + E) log V)' : 'O(E log E)'}
            </span>
          </div>
          <p className="text-sm text-theme-text-muted mt-1">
            {algoMode === 'dijkstra'
              ? 'Finds the optimal path between vertices using greedy min-distance relaxation.'
              : 'Constructs the Minimum Spanning Tree without cycles using Disjoint Set Union (Union-Find).'}
          </p>
        </div>

        {/* Algorithm Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-theme-surface p-1 rounded-lg border border-theme-border font-mono text-xs">
          <button
            onClick={() => handleModeChange('dijkstra')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              algoMode === 'dijkstra'
                ? 'bg-theme-card text-purple-400 font-semibold shadow-subtle border border-theme-border'
                : 'text-theme-text-muted hover:text-theme-text'
            }`}
          >
            <Waypoints className="w-3.5 h-3.5 text-purple-400" />
            <span>Dijkstra</span>
          </button>
          <button
            onClick={() => handleModeChange('kruskal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              algoMode === 'kruskal'
                ? 'bg-theme-card text-cyan-400 font-semibold shadow-subtle border border-theme-border'
                : 'text-theme-text-muted hover:text-theme-text'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
            <span>Kruskal MST</span>
          </button>
        </div>
      </div>

      {/* Plain English Algorithm Explainer HUD */}
      <div className="bg-theme-surface rounded-xl border border-theme-border p-4 shadow-subtle flex items-start gap-3.5 relative overflow-hidden">
        <div
          className={`p-2.5 rounded-lg flex-shrink-0 ${
            algoMode === 'dijkstra'
              ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
              : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
          }`}
        >
          {algoMode === 'dijkstra' ? <Waypoints className="w-5 h-5" /> : <GitBranch className="w-5 h-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-theme-text">
              Plain English Explainer
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-theme-bg border border-theme-border text-theme-accent">
              {algoMode === 'dijkstra' ? 'GPS Shortest Path Analogy' : 'Cheapest Road Network Analogy'}
            </span>
          </div>
          <p className="text-sm font-sans leading-relaxed text-theme-text font-medium">
            {algoMode === 'dijkstra'
              ? "Dijkstra's Algorithm finds the fastest route like a GPS avoiding traffic. It explores outward, always taking the shortest known step first. If it finds a shortcut to a node it already visited, it updates its map."
              : "Kruskal's Algorithm paves the cheapest roads to connect every town. It grabs the shortest available road on the whole map. If that road creates a useless loop, it throws it away. It stops when everything is connected."}
          </p>
        </div>
      </div>

      {/* Main Graph Viewport + Live HUD Side Panel */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-[440px]">
        {/* Left: SVG + Framer Motion Canvas Container */}
        <div
          ref={containerRef}
          className="lg:col-span-3 bg-theme-surface rounded-xl border border-theme-border p-4 shadow-subtle relative overflow-hidden flex flex-col justify-between select-none"
        >
          {/* Step Inspector Badge */}
          <div className="absolute top-4 left-4 right-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pointer-events-none z-20">
            <div className="flex items-center gap-2 text-xs font-mono bg-theme-bg/90 backdrop-blur-sm px-3 py-1.5 rounded-md border border-theme-border text-theme-text max-w-xl truncate shadow-subtle">
              <Info className="w-3.5 h-3.5 text-theme-primary flex-shrink-0" />
              <span className="truncate">{visualState.stepInfo}</span>
            </div>

            {/* Color Legend */}
            <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono bg-theme-bg/90 backdrop-blur-sm px-3 py-1.5 rounded-md border border-theme-border shadow-subtle">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                <span className="text-theme-text-muted">Checking</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                <span className="text-theme-text-muted">Visited</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
                <span className="text-theme-text-muted">{algoMode === 'dijkstra' ? 'Fastest Path' : 'Paved Road'}</span>
              </div>
              {algoMode === 'kruskal' && (
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
                  <span className="text-theme-text-muted">Loop (Discard)</span>
                </div>
              )}
            </div>
          </div>

          {/* Graph Visualization Layers */}
          <div className="w-full h-full relative min-h-[360px]">
            {/* Background SVG Edge & Weight Layer */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              {edges.map((edge) => {
                const sourceNode = nodeMap[edge.source];
                const targetNode = nodeMap[edge.target];
                if (!sourceNode || !targetNode) return null;

                const midX = (sourceNode.x + targetNode.x) / 2;
                const midY = (sourceNode.y + targetNode.y) / 2;
                const style = getEdgeStyle(edge);

                return (
                  <g key={edge.id}>
                    {/* The Connecting Line */}
                    <line
                      x1={sourceNode.x}
                      y1={sourceNode.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      stroke={style.stroke}
                      strokeWidth={style.strokeWidth}
                      strokeDasharray={style.strokeDasharray}
                      strokeOpacity={style.opacity}
                      className="transition-all duration-300"
                    />

                    {/* Edge Weight Badge Pill */}
                    <g transform={`translate(${midX}, ${midY})`}>
                      <rect
                        x="-13"
                        y="-10"
                        width="26"
                        height="20"
                        rx="5"
                        fill={style.badgeBg}
                        stroke={style.badgeBorder}
                        strokeWidth="1.5"
                        className="transition-colors duration-300 shadow-sm"
                      />
                      <text
                        x="0"
                        y="1"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={style.textColor}
                        className="text-[10px] font-mono font-bold select-none pointer-events-none"
                      >
                        {edge.weight}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>

            {/* Foreground Animated Nodes with Framer Motion */}
            {nodes.map((node) => {
              return (
                <motion.div
                  key={node.id}
                  layout
                  animate={{
                    x: node.x - NODE_RADIUS,
                    y: node.y - NODE_RADIUS
                  }}
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
                  <span className="text-sm font-bold leading-none">{node.label}</span>
                  {algoMode === 'dijkstra' && visualState.distances[node.id] !== undefined && (
                    <span className="text-[9px] font-mono leading-none mt-0.5 text-theme-text-muted">
                      {visualState.distances[node.id] === Infinity ? '∞' : visualState.distances[node.id]}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right: Live Algorithm Telemetry HUD */}
        <div className="bg-theme-surface rounded-xl border border-theme-border p-4 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-theme-border">
              <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-theme-text">
                <TrendingUp className="w-3.5 h-3.5 text-theme-primary" />
                <span>{algoMode === 'dijkstra' ? 'Live Travel Costs' : 'Road Priority Queue'}</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-theme-bg border border-theme-border text-theme-text-muted">
                {algoMode === 'dijkstra' ? `Start: ${startNodeId}` : `Total: ${visualState.totalWeight}`}
              </span>
            </div>

            {/* Dijkstra Live Distance Table */}
            {algoMode === 'dijkstra' && (
              <div className="mt-3 space-y-1.5 max-h-[290px] overflow-y-auto pr-1">
                <div className="grid grid-cols-4 text-[10px] font-mono text-theme-text-muted uppercase tracking-wider px-2 py-1 bg-theme-bg/60 rounded">
                  <span>Location</span>
                  <span>Cost</span>
                  <span>Via</span>
                  <span>Status</span>
                </div>

                {nodes.map((n) => {
                  const dist = visualState.distances[n.id];
                  const isUpdated = visualState.updatedNodeId === n.id;
                  const isVisited = visualState.visitedNodeIds?.includes(n.id);
                  const isCurrent = visualState.activeNodeId === n.id;
                  const prevNode = visualState.previous[n.id]?.prevNodeId || '-';

                  return (
                    <div
                      key={n.id}
                      className={`grid grid-cols-4 items-center text-xs font-mono px-2 py-1.5 rounded transition-colors ${
                        isCurrent
                          ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30'
                          : isUpdated
                          ? 'bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/30'
                          : isVisited
                          ? 'bg-theme-bg/40 text-emerald-400'
                          : 'text-theme-text-muted'
                      }`}
                    >
                      <span className="font-bold">{n.id}</span>
                      <span>{dist === undefined ? '—' : dist === Infinity ? '∞' : dist}</span>
                      <span>{prevNode}</span>
                      <span className="text-[10px]">
                        {isCurrent ? 'Visiting' : isUpdated ? 'Shortcut!' : isVisited ? 'Visited' : 'Queued'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Kruskal Live Sorted Edge Queue */}
            {algoMode === 'kruskal' && (
              <div className="mt-3 space-y-1.5 max-h-[290px] overflow-y-auto pr-1">
                <div className="grid grid-cols-3 text-[10px] font-mono text-theme-text-muted uppercase tracking-wider px-2 py-1 bg-theme-bg/60 rounded">
                  <span>Road</span>
                  <span>Cost</span>
                  <span>Status</span>
                </div>

                {(visualState.sortedEdges.length > 0 ? visualState.sortedEdges : edges).map((e) => {
                  const isEvaluating = visualState.evaluatingEdgeId === e.id;
                  const isAccepted = visualState.mstEdgeIds?.includes(e.id);
                  const isRejected = visualState.rejectedEdgeIds?.includes(e.id);

                  return (
                    <div
                      key={e.id}
                      className={`grid grid-cols-3 items-center text-xs font-mono px-2 py-1.5 rounded transition-colors ${
                        isEvaluating
                          ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30'
                          : isAccepted
                          ? 'bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/30'
                          : isRejected
                          ? 'bg-red-500/15 text-red-400 border border-red-500/30 opacity-70'
                          : 'text-theme-text-muted'
                      }`}
                    >
                      <span>{e.source}—{e.target}</span>
                      <span className="font-bold">{e.weight}</span>
                      <span className="text-[10px]">
                        {isEvaluating
                          ? 'Checking'
                          : isAccepted
                          ? 'Paved (Keep)'
                          : isRejected
                          ? 'Loop (Discard)'
                          : 'Available'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom Telemetry Footer */}
          <div className="pt-3 border-t border-theme-border font-mono text-[11px] space-y-1">
            {algoMode === 'dijkstra' ? (
              <div className="flex items-center justify-between text-theme-text-muted">
                <span>Destination: <span className="text-theme-accent font-semibold">{targetNodeId}</span></span>
                <span>
                  Fastest Route Cost:{' '}
                  <span className="text-emerald-400 font-semibold">
                    {visualState.distances[targetNodeId] !== undefined && visualState.distances[targetNodeId] !== Infinity
                      ? visualState.distances[targetNodeId]
                      : '—'}
                  </span>
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between text-theme-text-muted">
                <span>Roads Paved: <span className="text-cyan-400 font-semibold">{visualState.mstEdgeIds.length} / {nodes.length - 1}</span></span>
                <span>Total Road Cost: <span className="text-emerald-400 font-semibold">{visualState.totalWeight}</span></span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-theme-surface rounded-xl border border-theme-border p-4 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-subtle">
        {/* Left Side: Algorithm Configuration & Triggers */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Select Map Dropdown */}
          <div className="flex items-center gap-1.5 text-xs font-mono text-theme-text-muted bg-theme-bg/60 px-2.5 py-1.5 rounded-lg border border-theme-border shadow-inner">
            <Layers className="w-3.5 h-3.5 text-theme-primary" />
            <span className="font-semibold text-theme-text">Select Map:</span>
            <select
              aria-label="Select Map"
              value={selectedMapId}
              onChange={(e) => handleMapChange(e.target.value)}
              disabled={isPlaying}
              className="bg-transparent border-0 text-theme-text focus:outline-none focus:ring-0 font-mono text-xs cursor-pointer font-medium"
            >
              <option value="wheel" className="bg-theme-surface text-theme-text">Wheel</option>
              <option value="grid" className="bg-theme-surface text-theme-text">City Grid</option>
              <option value="bottleneck" className="bg-theme-surface text-theme-text">Bottleneck</option>
            </select>
          </div>
          {algoMode === 'dijkstra' ? (
            <>
              {/* Start Node Selector */}
              <div className="flex items-center gap-1.5 text-xs font-mono text-theme-text-muted">
                <span>Start:</span>
                <select
                  value={startNodeId}
                  onChange={(e) => {
                    setStartNodeId(e.target.value);
                    resetVisualState();
                  }}
                  disabled={isPlaying}
                  className="bg-theme-bg border border-theme-border rounded px-2 py-1 text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary font-mono text-xs"
                >
                  {nodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Node Selector */}
              <div className="flex items-center gap-1.5 text-xs font-mono text-theme-text-muted">
                <span>Target:</span>
                <select
                  value={targetNodeId}
                  onChange={(e) => {
                    setTargetNodeId(e.target.value);
                    resetVisualState();
                  }}
                  disabled={isPlaying}
                  className="bg-theme-bg border border-theme-border rounded px-2 py-1 text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary font-mono text-xs"
                >
                  {nodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={startDijkstra}
                disabled={isPlaying}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white transition-all shadow-subtle disabled:opacity-40"
              >
                <Waypoints className="w-3.5 h-3.5" />
                <span>Run Dijkstra</span>
              </button>
            </>
          ) : (
            <button
              onClick={startKruskal}
              disabled={isPlaying}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 text-white transition-all shadow-subtle disabled:opacity-40"
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Run Kruskal (MST)</span>
            </button>
          )}

          {/* Randomize Weights Button */}
          <button
            onClick={handleRandomizeWeights}
            disabled={isPlaying}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono border border-theme-border bg-theme-card hover:bg-theme-surface-hover text-theme-text-muted hover:text-theme-text transition-colors disabled:opacity-40"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Randomize Weights</span>
          </button>

          {/* Reset / Clear Button */}
          <button
            onClick={resetVisualState}
            disabled={isPlaying}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono border border-theme-border bg-theme-card hover:bg-theme-surface-hover text-theme-text-muted hover:text-theme-text transition-colors disabled:opacity-40"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Right Side: Stepping & Animation Speed Controls */}
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

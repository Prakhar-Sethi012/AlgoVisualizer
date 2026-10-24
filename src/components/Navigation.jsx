import React from 'react';
import {
  ArrowDownUp,
  Search,
  Network,
  GitFork,
  Palette,
  Terminal,
  Activity,
  CheckCircle2,
  Lock,
  BarChart3,
  Sliders,
  Zap,
  Play,
  Layers,
  Calculator,
  Box,
  GitBranch
} from 'lucide-react';

export const ALGORITHM_CATEGORIES = [
  {
    id: 'sorting',
    name: 'Sorting',
    icon: ArrowDownUp,
    algorithms: [
      { id: 'bubble-sort', name: 'Bubble Sort', implemented: true, tag: 'O(n²)' },
      { id: 'quick-sort', name: 'Quick Sort', implemented: true, tag: 'O(n log n)' },
      { id: 'merge-sort', name: 'Merge Sort', implemented: true, tag: 'O(n log n)' },
      { id: 'selection-sort', name: 'Selection Sort', implemented: false, tag: 'Next Phase' },
      { id: 'insertion-sort', name: 'Insertion Sort', implemented: false, tag: 'Next Phase' },
    ]
  },
  {
    id: 'searching',
    name: 'Searching',
    icon: Search,
    algorithms: [
      { id: 'linear-search', name: 'Linear Search', implemented: true, tag: 'O(n)' },
      { id: 'binary-search', name: 'Binary Search', implemented: true, tag: 'O(log n)' },
    ]
  },
  {
    id: 'data-structures',
    name: 'Data Structures',
    icon: Layers,
    algorithms: [
      { id: 'stack', name: 'Stack (LIFO)', implemented: true, tag: 'LIFO' },
      { id: 'queue', name: 'Queue (FIFO)', implemented: true, tag: 'FIFO' },
    ]
  },
  {
    id: 'trees',
    name: 'Trees',
    icon: GitFork,
    algorithms: [
      { id: 'avl-tree', name: 'AVL Tree (Self-Balancing)', implemented: true, tag: 'AVL' },
      { id: 'bst-operations', name: 'BST Operations', implemented: false, tag: 'Next Phase' },
      { id: 'tree-traversal', name: 'In/Pre/Post Order', implemented: false, tag: 'Next Phase' },
    ]
  },
  {
    id: 'graphs',
    name: 'Graphs',
    icon: Network,
    algorithms: [
      { id: 'dijkstra', name: "Dijkstra's Path", implemented: true, tag: 'Greedy' },
      { id: 'kruskal', name: "Kruskal's MST", implemented: true, tag: 'UnionFind' },
      { id: 'bfs', name: 'Breadth-First Search', implemented: false, tag: 'Next Phase' },
      { id: 'dfs', name: 'Depth-First Search', implemented: false, tag: 'Next Phase' },
    ]
  }
];

export const AVAILABLE_THEMES = [
  { id: 'default', name: 'Modern Minimalist (Dark)', hex: '#36454f' },
  { id: 'modern-minimalist-light', name: 'Modern Minimalist (Light)', hex: '#d3d3d3' },
  { id: 'ocean-depths', name: 'Ocean Depths', hex: '#2d8b8b' },
  { id: 'tech-innovation', name: 'Tech Innovation', hex: '#0066ff' },
  { id: 'arctic-frost', name: 'Arctic Frost', hex: '#4a6fa5' },
];

export function Navigation({
  currentView = 'visualizer',
  onViewChange,
  selectedAlgo,
  onSelectAlgo,
  selectedDS = 'stack',
  onSelectDS,
  currentTheme,
  onThemeChange
}) {
  return (
    <aside className="w-64 bg-theme-surface border-r border-theme-border flex flex-col h-full flex-shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-theme-border flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-theme-primary/10 border border-theme-primary/30 flex items-center justify-center text-theme-primary">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-theme-text font-sans leading-none">
              AlgoVisualizer
            </div>
            <div className="text-[10px] font-mono text-theme-text-muted mt-1">
              Lab & Benchmarking
            </div>
          </div>
        </div>
      </div>

      {/* Primary Workspace View Toggles */}
      <div className="p-3 border-b border-theme-border space-y-1 bg-theme-bg/30">
        <button
          onClick={() => onViewChange && onViewChange('visualizer')}
          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all ${
            currentView === 'visualizer'
              ? 'bg-theme-primary text-slate-950 shadow-subtle'
              : 'text-theme-text hover:bg-theme-surface-hover hover:text-theme-primary'
          }`}
        >
          <div className="flex items-center gap-2">
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Visualizer Lab</span>
          </div>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-black/10">
            Generators
          </span>
        </button>

        <button
          onClick={() => onViewChange && onViewChange('data-structures')}
          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all ${
            currentView === 'data-structures'
              ? 'bg-theme-primary text-slate-950 shadow-subtle'
              : 'text-theme-text hover:bg-theme-surface-hover hover:text-theme-primary'
          }`}
        >
          <div className="flex items-center gap-2">
            <Box className="w-3.5 h-3.5" />
            <span>Stack & Queue</span>
          </div>
          <span className={`text-[9px] px-1.5 py-0.2 rounded ${
            currentView === 'data-structures' ? 'bg-black/10' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
          }`}>
            AnimatePresence
          </span>
        </button>

        <button
          onClick={() => onViewChange && onViewChange('trees')}
          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all ${
            currentView === 'trees'
              ? 'bg-theme-primary text-slate-950 shadow-subtle'
              : 'text-theme-text hover:bg-theme-surface-hover hover:text-theme-primary'
          }`}
        >
          <div className="flex items-center gap-2">
            <GitBranch className="w-3.5 h-3.5" />
            <span>AVL Tree</span>
          </div>
          <span className={`text-[9px] px-1.5 py-0.2 rounded ${
            currentView === 'trees' ? 'bg-black/10' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
          }`}>
            Rotations
          </span>
        </button>

        <button
          onClick={() => onViewChange && onViewChange('graphs')}
          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all ${
            currentView === 'graphs'
              ? 'bg-theme-primary text-slate-950 shadow-subtle'
              : 'text-theme-text hover:bg-theme-surface-hover hover:text-theme-primary'
          }`}
        >
          <div className="flex items-center gap-2">
            <Network className="w-3.5 h-3.5" />
            <span>Graphs</span>
          </div>
          <span className={`text-[9px] px-1.5 py-0.2 rounded ${
            currentView === 'graphs' ? 'bg-black/10' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
          }`}>
            Dijkstra / MST
          </span>
        </button>

        <button
          onClick={() => onViewChange && onViewChange('benchmark')}
          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all ${
            currentView === 'benchmark'
              ? 'bg-theme-primary text-slate-950 shadow-subtle'
              : 'text-theme-text hover:bg-theme-surface-hover hover:text-theme-primary'
          }`}
        >
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5" />
            <span>Benchmark Lab</span>
          </div>
          <span className={`text-[9px] px-1.5 py-0.2 rounded ${
            currentView === 'benchmark' ? 'bg-black/10' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          }`}>
            Web Worker
          </span>
        </button>

        <button
          onClick={() => onViewChange && onViewChange('recurrence')}
          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all ${
            currentView === 'recurrence'
              ? 'bg-theme-primary text-slate-950 shadow-subtle'
              : 'text-theme-text hover:bg-theme-surface-hover hover:text-theme-primary'
          }`}
        >
          <div className="flex items-center gap-2">
            <Calculator className="w-3.5 h-3.5" />
            <span>Recurrence Solver</span>
          </div>
          <span className={`text-[9px] px-1.5 py-0.2 rounded ${
            currentView === 'recurrence' ? 'bg-black/10' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
          }`}>
            Master Thm
          </span>
        </button>
      </div>

      {/* Navigation Groups for Algorithms */}
      <div className="flex-1 overflow-y-auto p-3 space-y-5">
        <div className="text-[10px] font-mono uppercase tracking-wider text-theme-text-muted px-2">
          Algorithm Suite
        </div>

        {ALGORITHM_CATEGORIES.map((category) => {
          const CategoryIcon = category.icon;
          return (
            <div key={category.id} className="space-y-1">
              <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-theme-text-muted uppercase tracking-wider font-mono">
                <CategoryIcon className="w-3.5 h-3.5" />
                <span>{category.name}</span>
              </div>

              <div className="space-y-0.5">
                {category.algorithms.map((algo) => {
                  const isDS = category.id === 'data-structures';
                  const isTree = category.id === 'trees';
                  const isGraph = category.id === 'graphs';
                  const isSelected = isDS
                    ? currentView === 'data-structures' && selectedDS === algo.id
                    : isTree
                    ? currentView === 'trees' && algo.id === 'avl-tree'
                    : isGraph
                    ? currentView === 'graphs' && (algo.id === 'dijkstra' || algo.id === 'kruskal')
                    : currentView === 'visualizer' && selectedAlgo === algo.id;

                  return (
                    <button
                      key={algo.id}
                      onClick={() => {
                        if (algo.implemented) {
                          if (isDS) {
                            if (onViewChange) onViewChange('data-structures');
                            if (onSelectDS) onSelectDS(algo.id);
                          } else if (isTree) {
                            if (onViewChange) onViewChange('trees');
                          } else if (isGraph) {
                            if (onViewChange) onViewChange('graphs');
                          } else {
                            if (onViewChange) onViewChange('visualizer');
                            if (onSelectAlgo) onSelectAlgo(algo.id);
                          }
                        }
                      }}
                      disabled={!algo.implemented}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        isSelected
                          ? 'bg-theme-primary/15 text-theme-primary font-semibold'
                          : algo.implemented
                          ? 'text-theme-text hover:bg-theme-surface-hover hover:text-theme-primary'
                          : 'text-theme-text-muted/50 cursor-not-allowed hover:bg-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {algo.implemented ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-theme-primary" />
                        ) : (
                          <Lock className="w-3 h-3 text-theme-text-muted/40" />
                        )}
                        <span className="truncate">{algo.name}</span>
                      </div>

                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                          algo.implemented
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-theme-surface border border-theme-border text-theme-text-muted/60'
                        }`}
                      >
                        {algo.tag}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Theme Selector (Dynamic Theming from secret_folder) */}
      <div className="p-3 border-t border-theme-border bg-theme-card/50">
        <div className="flex items-center gap-1.5 px-1 mb-2 text-xs font-mono text-theme-text-muted">
          <Palette className="w-3.5 h-3.5" />
          <span>Dynamic Theme</span>
        </div>
        <select
          value={currentTheme}
          onChange={(e) => onThemeChange(e.target.value)}
          className="w-full text-xs bg-theme-surface border border-theme-border rounded-md px-2.5 py-1.5 text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary font-mono cursor-pointer"
        >
          {AVAILABLE_THEMES.map((t) => (
            <option key={t.id} value={t.id} className="bg-slate-900 text-white">
              {t.name}
            </option>
          ))}
        </select>
        <div className="mt-2 text-[10px] text-theme-text-muted font-mono px-1 flex items-center justify-between">
          <span>Engine Core:</span>
          <span className="text-emerald-400">Generator + Trees</span>
        </div>
      </div>
    </aside>
  );
}

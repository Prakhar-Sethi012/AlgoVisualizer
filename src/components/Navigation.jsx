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
  GitBranch,
  Home as HomeIcon
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
      { id: 'heap-sort', name: 'Heap Sort', implemented: true, tag: 'O(n log n)' },
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
    name: 'Linear Structures',
    icon: Layers,
    algorithms: [
      { id: 'linked-list', name: 'Linked Lists', implemented: true, tag: 'Nodes' },
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
      { id: 'expression-tree', name: 'Equation Converter (AST)', implemented: true, tag: 'RPN' },
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
      <div
        onClick={() => onViewChange && onViewChange('home')}
        className="p-4 border-b border-theme-border flex items-center justify-between cursor-pointer hover:bg-theme-surface-hover/60 transition-colors"
      >
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
      <div className="p-3 border-b border-theme-border space-y-1 bg-theme-bg/20">
        {[
          { id: 'home', label: 'Overview / Home', icon: HomeIcon, tag: 'Guide' },
          { id: 'visualizer', label: 'Visualizer Lab', icon: Play, tag: 'Generators' },
          { id: 'data-structures', label: 'Linear Structures', icon: Box, tag: 'Lists & Queues' },
          { id: 'trees', label: 'AVL Tree', icon: GitBranch, tag: 'Rotations' },
          { id: 'equation-converter', label: 'Equation Converter', icon: Calculator, tag: 'AST / RPN' },
          { id: 'graphs', label: 'Graphs', icon: Network, tag: 'Dijkstra / MST' },
          { id: 'benchmark', label: 'Benchmark Lab', icon: Zap, tag: 'Web Worker' },
          { id: 'recurrence', label: 'Recurrence Solver', icon: Calculator, tag: 'Master Thm' },
        ].map(({ id, label, icon: Icon, tag }) => {
          const isActive = currentView === id;
          return (
            <button
              key={id}
              onClick={() => onViewChange && onViewChange(id)}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-150 ${
                isActive
                  ? 'bg-white/5 text-white font-semibold border-l-2 border-indigo-500 pl-[10px]'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border-l-2 border-transparent pl-[10px]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span>{label}</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${
                isActive
                  ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
                  : 'bg-theme-bg/60 text-slate-500 border-theme-border/60'
              }`}>
                {tag}
              </span>
            </button>
          );
        })}
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
                    ? (algo.id === 'expression-tree' ? currentView === 'equation-converter' : currentView === 'trees' && algo.id === 'avl-tree')
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
                            if (algo.id === 'expression-tree') {
                              if (onViewChange) onViewChange('equation-converter');
                            } else {
                              if (onViewChange) onViewChange('trees');
                            }
                          } else if (isGraph) {
                            if (onViewChange) onViewChange('graphs');
                          } else {
                            if (onViewChange) onViewChange('visualizer');
                            if (onSelectAlgo) onSelectAlgo(algo.id);
                          }
                        }
                      }}
                      disabled={!algo.implemented}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
                        isSelected
                          ? 'bg-white/5 text-white font-semibold border-l-2 border-indigo-500 pl-2'
                          : algo.implemented
                          ? 'text-slate-400 hover:text-white hover:bg-white/[0.04] border-l-2 border-transparent pl-2'
                          : 'text-slate-600 cursor-not-allowed border-l-2 border-transparent pl-2'
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
                            ? 'bg-theme-bg/60 text-theme-text-muted border border-theme-border/60'
                            : 'bg-theme-surface border border-theme-border text-theme-text-muted/40'
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
          <span className="text-theme-text-muted">Generator + Web Worker</span>
        </div>
      </div>
    </aside>
  );
}

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Navigation } from './components/Navigation';
import { Home } from './components/Home';
import {
  Cpu,
  Play,
  Zap,
  Calculator,
  Layers,
  Menu,
  X,
  GitBranch,
  Network,
  Home as HomeIcon,
  CheckCircle2
} from 'lucide-react';

// Code-split dynamic routes for optimized bundle sizes & fast initial load
const VisualizerView = lazy(() =>
  import('./components/VisualizerView').then((m) => ({ default: m.VisualizerView }))
);
const StackQueueView = lazy(() =>
  import('./components/DataStructures/StackQueueView').then((m) => ({ default: m.StackQueueView }))
);
const LinkedListView = lazy(() =>
  import('./components/DataStructures/LinkedListView').then((m) => ({ default: m.LinkedListView }))
);
const TreeView = lazy(() =>
  import('./components/DataStructures/TreeView').then((m) => ({ default: m.TreeView }))
);
const GraphView = lazy(() =>
  import('./components/DataStructures/GraphView').then((m) => ({ default: m.GraphView }))
);
const BenchmarkLab = lazy(() =>
  import('./components/BenchmarkLab').then((m) => ({ default: m.BenchmarkLab }))
);
const MathLab = lazy(() =>
  import('./components/MathLab').then((m) => ({ default: m.MathLab }))
);

/**
 * Minimalist Loading Spinner adhering to Dynamic Theming tokens
 */
function RouteFallback() {
  return (
    <div className="h-full w-full min-h-[360px] flex flex-col items-center justify-center space-y-3">
      <div className="w-8 h-8 rounded-full border-2 border-theme-border border-t-theme-primary animate-spin" />
      <span className="text-xs font-mono text-theme-text-muted">Loading module...</span>
    </div>
  );
}

export default function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'visualizer' | 'data-structures' | 'trees' | 'graphs' | 'benchmark' | 'recurrence'
  const [selectedAlgo, setSelectedAlgo] = useState('bubble-sort');
  const [selectedDS, setSelectedDS] = useState('linked-list');
  const [currentTheme, setCurrentTheme] = useState('default');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Apply dynamic theme from secret_folder tokens to document body / root
  useEffect(() => {
    if (currentTheme === 'default') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', currentTheme);
    }
  }, [currentTheme]);

  const handleNavigate = (view, algoId) => {
    setCurrentView(view);
    if (algoId) {
      setSelectedAlgo(algoId);
    }
  };

  const getBreadcrumb = () => {
    switch (currentView) {
      case 'home':
        return '/ Overview / Theory vs. Reality';
      case 'data-structures':
        return `/ Linear Structures / ${
          selectedDS === 'linked-list'
            ? 'Linked List (Singly, Doubly, Circular)'
            : selectedDS === 'stack'
            ? 'Stack (LIFO)'
            : 'Queue (FIFO)'
        }`;
      case 'trees':
        return '/ Trees / AVL Tree (Self-Balancing Rotations)';
      case 'graphs':
        return '/ Graphs / Dijkstra & Kruskal MST';
      case 'benchmark':
        return '/ Benchmarking Lab (Web Worker Offloaded)';
      case 'recurrence':
        return '/ Recurrence Solver (Master Theorem Engine)';
      default: {
        const names = {
          'bubble-sort': 'Sorting / Bubble Sort',
          'quick-sort': 'Sorting / Quick Sort',
          'merge-sort': 'Sorting / Merge Sort',
          'linear-search': 'Searching / Linear Search',
          'binary-search': 'Searching / Binary Search'
        };
        return `/ ${names[selectedAlgo] || selectedAlgo}`;
      }
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-theme-bg text-theme-text font-sans">
      {/* Desktop Sidebar Navigation */}
      <div className="hidden md:flex h-full">
        <Navigation
          currentView={currentView}
          onViewChange={setCurrentView}
          selectedAlgo={selectedAlgo}
          onSelectAlgo={setSelectedAlgo}
          selectedDS={selectedDS}
          onSelectDS={setSelectedDS}
          currentTheme={currentTheme}
          onThemeChange={setCurrentTheme}
        />
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-black/60 backdrop-blur-sm">
          <div className="w-72 h-full bg-theme-surface shadow-2xl relative">
            <button
              onClick={() => setIsMobileNavOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-md text-theme-text-muted hover:text-theme-text"
            >
              <X className="w-5 h-5" />
            </button>
            <Navigation
              currentView={currentView}
              onViewChange={(v) => {
                setCurrentView(v);
                setIsMobileNavOpen(false);
              }}
              selectedAlgo={selectedAlgo}
              onSelectAlgo={(id) => {
                setSelectedAlgo(id);
                setIsMobileNavOpen(false);
              }}
              selectedDS={selectedDS}
              onSelectDS={(ds) => {
                setSelectedDS(ds);
                setIsMobileNavOpen(false);
              }}
              currentTheme={currentTheme}
              onThemeChange={setCurrentTheme}
            />
          </div>
          <div className="flex-1" onClick={() => setIsMobileNavOpen(false)} />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Minimalist Header */}
        <header className="h-14 border-b border-theme-border bg-theme-surface/60 backdrop-blur-md px-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="md:hidden p-1.5 rounded-lg border border-theme-border text-theme-text"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Production Ready</span>
              </span>
              <span className="text-xs font-mono text-theme-text-muted hidden sm:inline">
                {getBreadcrumb()}
              </span>
            </div>
          </div>

          {/* Quick Header View Toggle Switch */}
          <div className="flex items-center gap-1.5 bg-theme-bg p-1 rounded-lg border border-theme-border text-xs font-mono overflow-x-auto max-w-[55vw] sm:max-w-none">
            <button
              onClick={() => setCurrentView('home')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                currentView === 'home'
                  ? 'bg-theme-card text-purple-400 font-semibold shadow-subtle border border-theme-border'
                  : 'text-theme-text-muted hover:text-theme-text'
              }`}
            >
              <HomeIcon className="w-3 h-3 text-purple-400" />
              <span className="hidden sm:inline">Overview</span>
            </button>

            <button
              onClick={() => setCurrentView('visualizer')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                currentView === 'visualizer'
                  ? 'bg-theme-card text-theme-primary font-semibold shadow-subtle border border-theme-border'
                  : 'text-theme-text-muted hover:text-theme-text'
              }`}
            >
              <Play className="w-3 h-3 fill-current" />
              <span className="hidden sm:inline">Visualizer</span>
            </button>

            <button
              onClick={() => setCurrentView('data-structures')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                currentView === 'data-structures'
                  ? 'bg-theme-card text-cyan-400 font-semibold shadow-subtle border border-theme-border'
                  : 'text-theme-text-muted hover:text-theme-text'
              }`}
            >
              <Layers className="w-3 h-3 text-cyan-400" />
              <span className="hidden sm:inline">Linear Structures</span>
            </button>

            <button
              onClick={() => setCurrentView('trees')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                currentView === 'trees'
                  ? 'bg-theme-card text-purple-400 font-semibold shadow-subtle border border-theme-border'
                  : 'text-theme-text-muted hover:text-theme-text'
              }`}
            >
              <GitBranch className="w-3 h-3 text-purple-400" />
              <span className="hidden sm:inline">AVL Tree</span>
            </button>

            <button
              onClick={() => setCurrentView('graphs')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                currentView === 'graphs'
                  ? 'bg-theme-card text-cyan-400 font-semibold shadow-subtle border border-theme-border'
                  : 'text-theme-text-muted hover:text-theme-text'
              }`}
            >
              <Network className="w-3 h-3 text-cyan-400" />
              <span className="hidden sm:inline">Graphs</span>
            </button>

            <button
              onClick={() => setCurrentView('benchmark')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                currentView === 'benchmark'
                  ? 'bg-theme-card text-emerald-400 font-semibold shadow-subtle border border-theme-border'
                  : 'text-theme-text-muted hover:text-theme-text'
              }`}
            >
              <Zap className="w-3 h-3 text-emerald-400" />
              <span className="hidden sm:inline">Benchmark</span>
            </button>

            <button
              onClick={() => setCurrentView('recurrence')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                currentView === 'recurrence'
                  ? 'bg-theme-card text-amber-400 font-semibold shadow-subtle border border-theme-border'
                  : 'text-theme-text-muted hover:text-theme-text'
              }`}
            >
              <Calculator className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">Solver</span>
            </button>
          </div>
        </header>

        {/* Workbench Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto h-full flex flex-col">
            <Suspense fallback={<RouteFallback />}>
              {currentView === 'home' ? (
                <Home onNavigate={handleNavigate} />
              ) : currentView === 'visualizer' ? (
                <VisualizerView
                  currentAlgoId={selectedAlgo}
                  onAlgoChange={setSelectedAlgo}
                />
              ) : currentView === 'data-structures' ? (
                selectedDS === 'linked-list' ? (
                  <LinkedListView
                    onSwitchStructure={(ds) => setSelectedDS(ds)}
                    currentStructure={selectedDS}
                  />
                ) : (
                  <StackQueueView
                    initialMode={selectedDS}
                    onSwitchStructure={(ds) => setSelectedDS(ds)}
                    currentStructure={selectedDS}
                  />
                )
              ) : currentView === 'trees' ? (
                <TreeView />
              ) : currentView === 'graphs' ? (
                <GraphView />
              ) : currentView === 'benchmark' ? (
                <BenchmarkLab />
              ) : (
                <MathLab />
              )}
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}

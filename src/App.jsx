import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Navigation, AVAILABLE_THEMES } from './components/Navigation';
import { Home } from './components/Home';
import {
  Menu,
  X,
  Search,
  ChevronRight,
  Palette
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
const ExpressionConverterView = lazy(() =>
  import('./components/DataStructures/ExpressionConverterView').then((m) => ({ default: m.ExpressionConverterView }))
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

/** Builds a two-segment breadcrumb for the current view */
function useBreadcrumb(currentView, selectedAlgo, selectedDS) {
  const segments = (() => {
    switch (currentView) {
      case 'home':
        return ['AlgoVisualizer', 'Overview'];
      case 'visualizer': {
        const names = {
          'bubble-sort': 'Bubble Sort',
          'quick-sort': 'Quick Sort',
          'merge-sort': 'Merge Sort',
          'heap-sort': 'Heap Sort',
          'linear-search': 'Linear Search',
          'binary-search': 'Binary Search',
        };
        return ['Visualizer Lab', names[selectedAlgo] || selectedAlgo];
      }
      case 'data-structures': {
        const ds = { 'linked-list': 'Linked List', stack: 'Stack (LIFO)', queue: 'Queue (FIFO)' };
        return ['Linear Structures', ds[selectedDS] || selectedDS];
      }
      case 'trees':
        return ['Trees', 'AVL Tree'];
      case 'equation-converter':
        return ['Trees', 'Equation Converter'];
      case 'graphs':
        return ['Graphs', 'Dijkstra & Kruskal MST'];
      case 'benchmark':
        return ['Benchmark Lab', 'Web Worker Offloaded'];
      case 'recurrence':
        return ['Math Lab', 'Master Theorem Engine'];
      default:
        return ['AlgoVisualizer', currentView];
    }
  })();
  return segments;
}

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedAlgo, setSelectedAlgo] = useState('bubble-sort');
  const [selectedDS, setSelectedDS] = useState('linked-list');
  const [currentTheme, setCurrentTheme] = useState('default');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [themePickerOpen, setThemePickerOpen] = useState(false);

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
    if (algoId) setSelectedAlgo(algoId);
  };

  const breadcrumb = useBreadcrumb(currentView, selectedAlgo, selectedDS);

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
              onViewChange={(v) => { setCurrentView(v); setIsMobileNavOpen(false); }}
              selectedAlgo={selectedAlgo}
              onSelectAlgo={(id) => { setSelectedAlgo(id); setIsMobileNavOpen(false); }}
              selectedDS={selectedDS}
              onSelectDS={(ds) => { setSelectedDS(ds); setIsMobileNavOpen(false); }}
              currentTheme={currentTheme}
              onThemeChange={setCurrentTheme}
            />
          </div>
          <div className="flex-1" onClick={() => setIsMobileNavOpen(false)} />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header: Breadcrumb · Search · Theme */}
        <header className="h-12 border-b border-theme-border bg-theme-bg/80 backdrop-blur-md px-4 sm:px-5 flex items-center justify-between flex-shrink-0 gap-4">
          {/* Left: Mobile hamburger + Breadcrumb */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="md:hidden p-1.5 rounded-lg border border-theme-border text-theme-text-muted hover:text-theme-text hover:bg-theme-surface/60 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Breadcrumb */}
            <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-xs font-mono truncate">
              <span className="text-theme-text-muted truncate">{breadcrumb[0]}</span>
              {breadcrumb[1] && (
                <>
                  <ChevronRight className="w-3 h-3 text-theme-border flex-shrink-0" />
                  <span className="text-theme-text font-medium truncate">{breadcrumb[1]}</span>
                </>
              )}
            </nav>
          </div>

          {/* Right: Search · Theme picker */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Global search (decorative) */}
            <button
              className="p-1.5 rounded-lg text-theme-text-muted hover:text-theme-text hover:bg-theme-surface/60 transition-colors"
              aria-label="Search"
              title="Search (coming soon)"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Theme dropdown */}
            <div className="relative">
              <button
                onClick={() => setThemePickerOpen((o) => !o)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-theme-border text-theme-text-muted hover:text-theme-text hover:bg-theme-surface/60 transition-colors text-xs font-mono"
                aria-label="Change theme"
              >
                <Palette className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Theme</span>
              </button>

              {themePickerOpen && (
                <>
                  {/* Backdrop */}
                  <div className="fixed inset-0 z-30" onClick={() => setThemePickerOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 z-40 w-52 bg-theme-surface border border-theme-border rounded-xl shadow-minimal overflow-hidden">
                    <div className="px-3 py-2 border-b border-theme-border text-[10px] font-mono uppercase tracking-wider text-theme-text-muted">
                      Color Theme
                    </div>
                    {AVAILABLE_THEMES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => { setCurrentTheme(t.id); setThemePickerOpen(false); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-mono transition-colors ${
                          currentTheme === t.id
                            ? 'bg-theme-primary/10 text-theme-primary'
                            : 'text-theme-text-muted hover:text-theme-text hover:bg-theme-surface-hover'
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0 border border-white/10"
                          style={{ backgroundColor: t.hex }}
                        />
                        {t.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
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
              ) : currentView === 'equation-converter' ? (
                <ExpressionConverterView />
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

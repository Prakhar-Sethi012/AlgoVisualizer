import React, { useState, useEffect, lazy, Suspense } from 'react';
import { TopNav } from './components/TopNav';
import { Footer } from './components/Footer';
import { Home } from './components/Home';

// Code-split dynamic routes for optimised bundle sizes & fast initial load
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

function RouteFallback() {
  return (
    <div className="w-full min-h-[360px] flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-indigo-400 animate-spin" />
      <span className="text-xs font-mono text-slate-500">Loading module…</span>
    </div>
  );
}

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedAlgo, setSelectedAlgo] = useState('bubble-sort');
  const [selectedDS,   setSelectedDS]   = useState('linked-list');
  const [currentTheme, setCurrentTheme] = useState('default');

  // Apply dynamic theme token to <html data-theme="…">
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

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-200 font-sans">
      {/* ── Sticky Top Navigation ──────────────────────────────────────────── */}
      <TopNav
        currentView={currentView}
        onViewChange={setCurrentView}
        currentTheme={currentTheme}
        onThemeChange={setCurrentTheme}
      />

      {/* ── Main Content ───────────────────────────────────────────────────── */}
      <main className="w-full flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="max-w-7xl mx-auto">
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

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <Footer />
    </div>
  );
}

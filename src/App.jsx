import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { VisualizerView } from './components/VisualizerView';
import { BenchmarkLab } from './components/BenchmarkLab';
import { MathLab } from './components/MathLab';
import { Cpu, Play, Zap, Calculator, Menu, X } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('visualizer'); // 'visualizer' | 'benchmark' | 'recurrence'
  const [selectedAlgo, setSelectedAlgo] = useState('bubble-sort');
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

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-theme-bg text-theme-text font-sans">
      {/* Desktop Sidebar Navigation */}
      <div className="hidden md:flex h-full">
        <Navigation
          currentView={currentView}
          onViewChange={setCurrentView}
          selectedAlgo={selectedAlgo}
          onSelectAlgo={setSelectedAlgo}
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
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-theme-primary/10 text-theme-primary border border-theme-primary/20">
                Phase 3 Active
              </span>
              <span className="text-xs font-mono text-theme-text-muted hidden sm:inline">
                {currentView === 'benchmark'
                  ? '/ Benchmarking Lab (Theory Overlay Enabled)'
                  : currentView === 'recurrence'
                  ? '/ Recurrence Solver (Master Theorem Engine)'
                  : `/ Sorting / ${selectedAlgo === 'bubble-sort' ? 'Bubble Sort' : selectedAlgo === 'quick-sort' ? 'Quick Sort' : 'Merge Sort'}`}
              </span>
            </div>
          </div>

          {/* Quick Header View Toggle Switch */}
          <div className="flex items-center gap-1.5 bg-theme-bg p-1 rounded-lg border border-theme-border text-xs font-mono">
            <button
              onClick={() => setCurrentView('visualizer')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                currentView === 'visualizer'
                  ? 'bg-theme-card text-theme-primary font-semibold shadow-subtle border border-theme-border'
                  : 'text-theme-text-muted hover:text-theme-text'
              }`}
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Visualizer</span>
            </button>
            <button
              onClick={() => setCurrentView('benchmark')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                currentView === 'benchmark'
                  ? 'bg-theme-card text-emerald-400 font-semibold shadow-subtle border border-theme-border'
                  : 'text-theme-text-muted hover:text-theme-text'
              }`}
            >
              <Zap className="w-3 h-3 text-emerald-400" />
              <span>Benchmark</span>
            </button>
            <button
              onClick={() => setCurrentView('recurrence')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                currentView === 'recurrence'
                  ? 'bg-theme-card text-purple-400 font-semibold shadow-subtle border border-theme-border'
                  : 'text-theme-text-muted hover:text-theme-text'
              }`}
            >
              <Calculator className="w-3 h-3 text-purple-400" />
              <span>Solver</span>
            </button>
          </div>
        </header>

        {/* Workbench Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto h-full flex flex-col">
            {currentView === 'visualizer' ? (
              <VisualizerView
                currentAlgoId={selectedAlgo}
                onAlgoChange={setSelectedAlgo}
              />
            ) : currentView === 'benchmark' ? (
              <BenchmarkLab />
            ) : (
              <MathLab />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

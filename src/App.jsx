import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { VisualizerView } from './components/VisualizerView';
import { Cpu, Sparkles, Menu, X, BookOpen } from 'lucide-react';

export default function App() {
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
                Phase 1.1 Active
              </span>
              <span className="text-xs font-mono text-theme-text-muted hidden sm:inline">
                / Sorting / Bubble Sort
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-theme-text-muted">
              <Cpu className="w-3.5 h-3.5 text-theme-primary" />
              <span>Web Worker Benchmarking</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-theme-card border border-theme-border text-theme-accent">
                Phase 2
              </span>
            </div>
          </div>
        </header>

        {/* Visualizer Workbench */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto h-full flex flex-col">
            <VisualizerView algorithmName="Bubble Sort" />
          </div>
        </main>
      </div>
    </div>
  );
}

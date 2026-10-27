import React, { useState } from 'react';
import { AVAILABLE_THEMES } from './Navigation';
import {
  Menu,
  X,
  Palette,
  Home as HomeIcon,
  Play,
  Layers,
  GitBranch,
  Calculator,
  Network,
  Zap,
  ChevronDown
} from 'lucide-react';

const NAV_LINKS = [
  { id: 'home',               label: 'Overview',    icon: HomeIcon   },
  { id: 'visualizer',         label: 'Visualizer',  icon: Play       },
  { id: 'data-structures',    label: 'Linear',      icon: Layers     },
  { id: 'trees',              label: 'Trees',       icon: GitBranch  },
  { id: 'equation-converter', label: 'Converter',   icon: Calculator },
  { id: 'graphs',             label: 'Graphs',      icon: Network    },
  { id: 'benchmark',          label: 'Benchmark',   icon: Zap        },
  { id: 'recurrence',         label: 'Math Lab',    icon: Calculator },
];

export function TopNav({ currentView, onViewChange, currentTheme, onThemeChange }) {
  const [mobileOpen, setMobileOpen]       = useState(false);
  const [themePickerOpen, setThemePickerOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* ── Main sticky header ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-slate-900/70 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

          {/* Brand */}
          <button
            onClick={() => onViewChange('home')}
            className="flex-shrink-0 font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 tracking-tight"
          >
            AlgoVisualizer
          </button>

          {/* Center links — desktop */}
          <nav className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map(({ id, label }) => {
              const isActive = currentView === id;
              return (
                <button
                  key={id}
                  onClick={() => onViewChange(id)}
                  className={`text-sm px-3 py-1.5 rounded-md transition-colors duration-150 ${
                    isActive
                      ? 'bg-white/10 text-white font-medium'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Theme picker — desktop */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setThemePickerOpen((o) => !o)}
                className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white px-3 py-1.5 rounded-md hover:bg-white/5 transition-colors"
                aria-label="Change theme"
              >
                <Palette className="w-4 h-4" />
                <span className="hidden lg:inline text-xs font-mono">Theme</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {themePickerOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setThemePickerOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 z-40 w-56 bg-slate-900 border border-white/10 rounded-xl shadow-lg overflow-hidden">
                    <div className="px-3 py-2 border-b border-white/10 text-[10px] font-mono uppercase tracking-widest text-slate-500">
                      Color Theme
                    </div>
                    {AVAILABLE_THEMES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => { onThemeChange(t.id); setThemePickerOpen(false); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-mono transition-colors ${
                          currentTheme === t.id
                            ? 'bg-indigo-500/15 text-indigo-400'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0 border border-white/15"
                          style={{ backgroundColor: t.hex }}
                        />
                        {t.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden p-2 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ── Mobile dropdown ────────────────────────────────────────────────── */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 bg-slate-900/95 backdrop-blur-md">
            <nav className="px-4 py-3 space-y-0.5">
              {NAV_LINKS.map(({ id, label, icon: Icon }) => {
                const isActive = currentView === id;
                return (
                  <button
                    key={id}
                    onClick={() => { onViewChange(id); closeMobile(); }}
                    className={`w-full flex items-center gap-2.5 text-sm px-3 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-white/10 text-white font-medium border-l-2 border-indigo-500 pl-2.5'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                    {label}
                  </button>
                );
              })}
            </nav>

            {/* Mobile theme row */}
            <div className="px-4 pb-4 pt-1 border-t border-white/5">
              <div className="text-[10px] font-mono uppercase tracking-widest text-slate-600 px-1 mb-2">Color Theme</div>
              <div className="grid grid-cols-2 gap-1.5">
                {AVAILABLE_THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { onThemeChange(t.id); closeMobile(); }}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-mono transition-colors ${
                      currentTheme === t.id
                        ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                        : 'text-slate-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.07]'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: t.hex }}
                    />
                    <span className="truncate">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

import React from 'react';

export function Footer() {
  return (
    <footer className="w-full py-6 text-center border-t border-white/5 bg-slate-950/50 flex-shrink-0">
      <p className="text-slate-400 text-sm font-medium tracking-wide select-none">
        Made with{' '}
        <span className="text-red-500 animate-pulse inline-block" aria-label="love">
          ♥️
        </span>{' '}
        by{' '}
        <span className="text-white font-semibold">Prakhar Sethi</span>
      </p>
    </footer>
  );
}

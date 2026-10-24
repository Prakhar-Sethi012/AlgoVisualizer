import React, { useState, useMemo } from 'react';
import {
  Calculator,
  GitBranch,
  Info,
  CheckCircle2,
  Sparkles,
  BookOpen,
  ArrowRight,
  HelpCircle,
  Hash
} from 'lucide-react';
import { solveRecurrence } from '../core/math/masterTheorem';

const PRESET_RECURRENCES = [
  { label: 'Merge Sort', formula: 'T(n) = 2T(n/2) + O(n)', desc: 'Standard divide-and-conquer (Case 2: Balanced work)' },
  { label: 'Binary Search', formula: 'T(n) = T(n/2) + O(1)', desc: 'Single branch halving (Case 2: Logarithmic)' },
  { label: 'Karatsuba Mult.', formula: 'T(n) = 3T(n/2) + O(n)', desc: 'Fast polynomial multiplication (Case 1: Leaves dominate)' },
  { label: 'Strassen Matrix', formula: 'T(n) = 7T(n/2) + O(n^2)', desc: 'Sub-cubic matrix multiplication (Case 1: n^2.81)' },
  { label: 'Quadratic Work', formula: 'T(n) = 2T(n/2) + n^2', desc: 'Heavy top-level merge (Case 3: Root dominates)' },
  { label: 'Quad Branching', formula: 'T(n) = 4T(n/2) + n', desc: 'Multiple subproblems (Case 1: n^2)' },
];

export function MathLab() {
  const [inputRecurrence, setInputRecurrence] = useState('T(n) = 2T(n/2) + O(n)');

  // Solve recurrence dynamically upon input change
  const result = useMemo(() => {
    return solveRecurrence(inputRecurrence);
  }, [inputRecurrence]);

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header & Theoretical Context */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-theme-border">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-theme-text font-sans">
              Recurrence Solver & Math Lab
            </h1>
            <span className="px-2 py-0.5 text-xs font-mono rounded bg-theme-primary/10 border border-theme-primary/20 text-theme-primary">
              Master Theorem Engine
            </span>
            <span className="px-2 py-0.5 text-xs font-mono rounded bg-theme-surface border border-theme-border text-theme-accent">
              Asymptotic Analysis
            </span>
          </div>
          <p className="text-sm text-theme-text-muted mt-1">
            Evaluate divide-and-conquer recurrence relations of the form <code className="text-theme-primary">T(n) = a·T(n/b) + O(n<sup>d</sup>)</code> using the Master Theorem.
          </p>
        </div>

        {/* Canonical Formula Badge */}
        <div className="bg-theme-surface p-2.5 px-4 rounded-lg border border-theme-border font-mono text-xs self-start sm:self-auto">
          <div className="text-[10px] text-theme-text-muted uppercase tracking-wider">Canonical Formula</div>
          <div className="font-semibold text-theme-primary">
            T(n) = a·T(n/b) + Θ(n<sup>d</sup>)
          </div>
        </div>
      </div>

      {/* Preset Selectors */}
      <div className="space-y-2">
        <div className="text-xs font-mono text-theme-text-muted flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-theme-primary" />
          <span>Quick Benchmark & Classic Presets:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESET_RECURRENCES.map((preset) => (
            <button
              key={preset.label}
              onClick={() => setInputRecurrence(preset.formula)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                inputRecurrence.trim() === preset.formula
                  ? 'bg-theme-primary text-slate-950 font-semibold border-theme-primary shadow-subtle'
                  : 'bg-theme-surface hover:bg-theme-surface-hover text-theme-text-muted hover:text-theme-text border-theme-border'
              }`}
              title={preset.desc}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Large Minimalist Input Box */}
      <div className="bg-theme-surface rounded-xl border border-theme-border p-5 shadow-subtle space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="recurrence-input" className="text-xs font-mono text-theme-text-muted uppercase tracking-wider flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5" />
            <span>Enter Recurrence Relation:</span>
          </label>
          <span className="text-[11px] font-mono text-theme-text-muted">
            Format: T(n) = aT(n/b) + O(n^d)
          </span>
        </div>

        <div className="relative">
          <input
            id="recurrence-input"
            type="text"
            value={inputRecurrence}
            onChange={(e) => setInputRecurrence(e.target.value)}
            placeholder="e.g. T(n) = 2T(n/2) + O(n)"
            className="w-full bg-theme-bg border border-theme-border rounded-lg px-4 py-3 text-lg sm:text-xl font-mono text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-primary transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Output / Analysis Card */}
      {result.isValid ? (
        <div className="space-y-6">
          {/* Top Row: Extracted Tokens, Case, and Complexity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Extracted Parameters */}
            <div className="bg-theme-surface rounded-xl border border-theme-border p-4 shadow-subtle flex flex-col justify-between">
              <div className="text-xs font-mono text-theme-text-muted uppercase tracking-wider mb-2">
                Extracted Parameters
              </div>
              <div className="grid grid-cols-3 gap-2 font-mono text-center">
                <div className="bg-theme-bg p-2 rounded-lg border border-theme-border">
                  <div className="text-[10px] text-theme-text-muted">subproblems (a)</div>
                  <div className="text-lg font-bold text-theme-primary">{result.a}</div>
                </div>
                <div className="bg-theme-bg p-2 rounded-lg border border-theme-border">
                  <div className="text-[10px] text-theme-text-muted">divisor (b)</div>
                  <div className="text-lg font-bold text-theme-accent">{result.b}</div>
                </div>
                <div className="bg-theme-bg p-2 rounded-lg border border-theme-border">
                  <div className="text-[10px] text-theme-text-muted">work exp (d)</div>
                  <div className="text-lg font-bold text-amber-400">{result.d}</div>
                </div>
              </div>
            </div>

            {/* Master Theorem Case & Comparison */}
            <div className="bg-theme-surface rounded-xl border border-theme-border p-4 shadow-subtle flex flex-col justify-between">
              <div className="text-xs font-mono text-theme-text-muted uppercase tracking-wider mb-2">
                Case Comparison
              </div>
              <div className="space-y-1 font-mono text-xs">
                <div className="flex items-center justify-between text-theme-text-muted">
                  <span>log<sub>b</sub>(a) = log<sub>{result.b}</sub>({result.a}):</span>
                  <span className="font-semibold text-theme-text">{result.logb_a_display}</span>
                </div>
                <div className="flex items-center justify-between text-theme-text-muted">
                  <span>Work exponent (d):</span>
                  <span className="font-semibold text-theme-text">{result.d}</span>
                </div>
                <div className="pt-2 border-t border-theme-border flex items-center justify-between">
                  <span className="text-[11px] font-bold text-theme-primary">
                    {result.logb_a > result.d
                      ? `log_${result.b}(${result.a}) > ${result.d}`
                      : result.logb_a === result.d
                      ? `log_${result.b}(${result.a}) == ${result.d}`
                      : `log_${result.b}(${result.a}) < ${result.d}`}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-theme-primary/10 text-theme-primary border border-theme-primary/20">
                    {result.caseName}
                  </span>
                </div>
              </div>
            </div>

            {/* Final Big-O Result */}
            <div className="bg-theme-surface rounded-xl border border-theme-border p-4 shadow-subtle flex flex-col justify-between border-l-4 border-l-theme-primary">
              <div className="text-xs font-mono text-theme-text-muted uppercase tracking-wider mb-1">
                Asymptotic Solution
              </div>
              <div
                className="text-2xl sm:text-3xl font-bold font-mono text-theme-text"
                dangerouslySetInnerHTML={{ __html: result.complexityFormatted }}
              />
              <div className="text-xs font-mono text-emerald-400 mt-1">
                {result.interpretation}
              </div>
            </div>
          </div>

          {/* Step-by-Step Mathematical Explanation */}
          <div className="bg-theme-surface rounded-xl border border-theme-border p-5 shadow-subtle space-y-2">
            <div className="text-xs font-mono uppercase tracking-wider font-semibold text-theme-text flex items-center gap-2">
              <Info className="w-4 h-4 text-theme-primary" />
              <span>Mathematical Proof & Explanation</span>
            </div>
            <p className="text-sm font-sans leading-relaxed text-theme-text-muted">
              {result.explanation}
            </p>
          </div>

          {/* Recursion Tree Breakdown */}
          <div className="bg-theme-surface rounded-xl border border-theme-border p-5 shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-mono uppercase tracking-wider font-semibold text-theme-text flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-theme-primary" />
                <span>Recursion Tree Level-by-Level Breakdown</span>
              </div>
              <span className="text-[11px] font-mono text-theme-text-muted">
                Tree Height: log<sub>{result.b}</sub>(n) levels
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono text-left">
                <thead>
                  <tr className="border-b border-theme-border text-theme-text-muted">
                    <th className="py-2.5 px-3">Tree Level</th>
                    <th className="py-2.5 px-3">Subproblem Nodes</th>
                    <th className="py-2.5 px-3">Problem Size</th>
                    <th className="py-2.5 px-3">Work Per Node</th>
                    <th className="py-2.5 px-3 text-right">Total Level Work</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-border">
                  {result.recursionTree.map((row, idx) => (
                    <tr
                      key={idx}
                      className={`hover:bg-theme-card/50 transition-colors ${
                        idx === result.recursionTree.length - 1 ? 'bg-theme-card/30 font-semibold' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 text-theme-primary">
                        Level {row.level}
                      </td>
                      <td className="py-2.5 px-3 text-theme-text">
                        {row.nodes}
                      </td>
                      <td className="py-2.5 px-3 text-theme-accent">
                        {row.subproblemSize}
                      </td>
                      <td className="py-2.5 px-3 text-theme-text-muted">
                        {row.workPerNode}
                      </td>
                      <td className="py-2.5 px-3 text-right text-emerald-400">
                        {row.totalLevelWork}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-theme-bg/60 rounded-lg border border-theme-border text-xs font-mono text-theme-text-muted flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-theme-text">Geometric Series Ratio:</span> Work multiplies by{' '}
                <span className="text-theme-primary font-bold">{result.levelRatio}</span> at each level.
                {result.caseNumber === 1 && ' Because ratio > 1, the geometric series is expanding, so the leaves dominate.'}
                {result.caseNumber === 2 && ' Because ratio == 1, each level contributes equal work, multiplying by log(n) height.'}
                {result.caseNumber === 3 && ' Because ratio < 1, the geometric series decays exponentially, so the root dominates.'}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-xs font-mono text-red-400 flex items-center gap-2">
          <Info className="w-4 h-4 flex-shrink-0" />
          <span>{result.error}</span>
        </div>
      )}
    </div>
  );
}

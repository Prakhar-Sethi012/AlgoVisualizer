import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  Cpu,
  Zap,
  Play,
  RotateCcw,
  CheckCircle2,
  BarChart3,
  Clock,
  Activity,
  Layers,
  Sparkles,
  Info,
  TrendingUp
} from 'lucide-react';
import BenchmarkWorker from '../workers/benchmark.worker.js?worker';
import { enrichDatasetWithTheory } from '../core/math/curveFitter';

const ALGORITHM_CONFIGS = [
  { id: 'bubble', name: 'Bubble Sort', complexity: 'O(n²)', color: '#f59e0b', defaultActive: true },
  { id: 'quick', name: 'Quick Sort', complexity: 'O(n log n)', color: '#a855f7', defaultActive: true },
  { id: 'merge', name: 'Merge Sort', complexity: 'O(n log n)', color: '#06b6d4', defaultActive: true },
];

const PRESET_SIZES = [1000, 5000, 10000, 25000];

// Custom Minimalist Tooltip for Recharts
function MinimalChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-theme-card border border-theme-border p-3 rounded-lg shadow-minimal text-xs font-mono">
      <div className="font-semibold text-theme-text mb-2 border-b border-theme-border pb-1">
        Dataset: {Number(label).toLocaleString()} elements
      </div>
      <div className="space-y-1.5">
        {payload.map((entry) => {
          const isTheory = entry.dataKey.includes('theory');
          return (
            <div key={entry.name} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: entry.color,
                    opacity: isTheory ? 0.6 : 1
                  }}
                />
                <span className={isTheory ? 'italic opacity-80' : 'font-medium'}>
                  {entry.name}:
                </span>
              </span>
              <span className={`text-theme-text ${isTheory ? 'opacity-80' : 'font-bold'}`}>
                {entry.value !== undefined ? `${entry.value.toFixed(2)} ms` : '-'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function BenchmarkLab() {
  const [selectedAlgos, setSelectedAlgos] = useState(['bubble', 'quick', 'merge']);
  const [sizes, setSizes] = useState(PRESET_SIZES);
  const [isRunning, setIsRunning] = useState(false);
  const [showTheoryOverlay, setShowTheoryOverlay] = useState(true);
  const [progressInfo, setProgressInfo] = useState(null);
  const [benchmarkResults, setBenchmarkResults] = useState(null);

  const workerRef = useRef(null);

  // Clean up worker on unmount
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  // Enrich data with theoretical curves when overlay is enabled
  const chartData = useMemo(() => {
    if (!benchmarkResults) return null;
    if (!showTheoryOverlay) return benchmarkResults;
    return enrichDatasetWithTheory(benchmarkResults, selectedAlgos);
  }, [benchmarkResults, showTheoryOverlay, selectedAlgos]);

  const toggleAlgorithm = (algoId) => {
    if (selectedAlgos.includes(algoId)) {
      if (selectedAlgos.length === 1) return; // Keep at least one
      setSelectedAlgos(selectedAlgos.filter((id) => id !== algoId));
    } else {
      setSelectedAlgos([...selectedAlgos, algoId]);
    }
  };

  const handleRunBenchmark = () => {
    if (isRunning || !selectedAlgos.length) return;

    if (workerRef.current) {
      workerRef.current.terminate();
    }

    setIsRunning(true);
    setProgressInfo({
      message: 'Initializing Web Worker & Warming up V8...',
      percent: 0
    });

    const worker = new BenchmarkWorker();
    workerRef.current = worker;

    worker.onmessage = (event) => {
      const data = event.data;

      if (data.type === 'status') {
        setProgressInfo((prev) => ({
          ...prev,
          message: data.message
        }));
      } else if (data.type === 'progress') {
        setProgressInfo({
          message: `Benchmarking ${data.currentAlgorithm.toUpperCase()} on N = ${data.currentSize.toLocaleString()}`,
          percent: data.progressPercent,
          currentSize: data.currentSize,
          currentAlgorithm: data.currentAlgorithm
        });
      } else if (data.type === 'done') {
        setBenchmarkResults(data.results);
        setIsRunning(false);
        setProgressInfo(null);
        worker.terminate();
        workerRef.current = null;
      }
    };

    worker.onerror = (err) => {
      console.error('Web Worker Error:', err);
      setIsRunning(false);
      setProgressInfo(null);
      worker.terminate();
      workerRef.current = null;
    };

    worker.postMessage({
      algorithms: selectedAlgos,
      sizes: sizes
    });
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header & Architecture Explainer */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-theme-border">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-theme-text font-sans">
              Benchmarking Lab
            </h1>
            <span className="px-2 py-0.5 text-xs font-mono rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              Web Worker Offloaded
            </span>
            <span className="px-2 py-0.5 text-xs font-mono rounded bg-theme-surface border border-theme-border text-theme-accent">
              V8 JIT Warmed
            </span>
          </div>
          <p className="text-sm text-theme-text-muted mt-1">
            Empirical runtime performance profiling using raw non-generator algorithms executed inside a dedicated browser background thread.
          </p>
        </div>

        {/* Worker Engine Status Badge */}
        <div className="flex items-center gap-3 bg-theme-surface p-2.5 px-4 rounded-lg border border-theme-border font-mono text-xs self-start sm:self-auto">
          <Cpu className={`w-4 h-4 ${isRunning ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`} />
          <div>
            <div className="text-[10px] text-theme-text-muted uppercase tracking-wider">Engine Thread</div>
            <div className="font-semibold text-theme-text">
              {isRunning ? 'Worker Busy (60 FPS Safe)' : 'Worker Idle'}
            </div>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-theme-surface rounded-xl border border-theme-border p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-subtle">
        {/* Algorithm Selectors */}
        <div className="space-y-2">
          <div className="text-xs font-mono text-theme-text-muted flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>Select Algorithms to Race:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {ALGORITHM_CONFIGS.map((algo) => {
              const isSelected = selectedAlgos.includes(algo.id);
              return (
                <button
                  key={algo.id}
                  onClick={() => toggleAlgorithm(algo.id)}
                  disabled={isRunning}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-2 border ${
                    isSelected
                      ? 'bg-theme-card text-theme-text border-theme-primary shadow-subtle'
                      : 'bg-theme-bg/60 text-theme-text-muted/60 border-theme-border hover:text-theme-text'
                  } ${isRunning ? 'cursor-not-allowed opacity-60' : ''}`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: isSelected ? algo.color : '#64748b' }}
                  />
                  <span>{algo.name}</span>
                  <span className="text-[10px] text-theme-text-muted opacity-70">
                    {algo.complexity}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions & Dataset Preset */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="hidden lg:flex items-center gap-1.5 text-xs font-mono text-theme-text-muted px-3 py-1.5 bg-theme-bg rounded-lg border border-theme-border">
            <span>Sizes:</span>
            <span className="font-semibold text-theme-text">1K, 5K, 10K, 25K</span>
          </div>

          <button
            onClick={handleRunBenchmark}
            disabled={isRunning || !selectedAlgos.length}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all shadow-subtle ${
              isRunning
                ? 'bg-amber-600/60 text-white cursor-wait'
                : 'bg-theme-primary hover:bg-theme-primary-hover text-slate-950 font-semibold'
            }`}
          >
            {isRunning ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                <span>Running Benchmark...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current" />
                <span>Run Benchmark</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Live Running HUD / Progress Bar */}
      {isRunning && progressInfo && (
        <div className="bg-theme-surface rounded-xl border border-amber-500/30 p-5 shadow-subtle space-y-3 animate-pulse">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-amber-400 font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 animate-spin" />
              {progressInfo.message}
            </span>
            <span className="text-theme-text-muted">{progressInfo.percent}% Complete</span>
          </div>
          <div className="w-full bg-theme-bg rounded-full h-2 overflow-hidden border border-theme-border">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressInfo.percent}%` }}
            />
          </div>
          <div className="text-[11px] font-mono text-theme-text-muted">
            Executing inside dedicated Web Worker. UI main thread remains responsive at 60 FPS.
          </div>
        </div>
      )}

      {/* Chart Canvas Area */}
      <div className="flex-1 min-h-[420px] bg-theme-surface rounded-xl border border-theme-border p-6 flex flex-col shadow-subtle relative">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 border-b border-theme-border pb-3">
          <div className="flex items-center gap-2 text-xs font-mono text-theme-text">
            <BarChart3 className="w-4 h-4 text-theme-primary" />
            <span className="font-semibold">Execution Time vs Dataset Size (N)</span>
          </div>

          {/* Theory Overlay Toggle Switch */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs font-mono cursor-pointer select-none px-2.5 py-1 rounded bg-theme-card border border-theme-border hover:border-theme-primary/50 transition-colors">
              <input
                type="checkbox"
                checked={showTheoryOverlay}
                onChange={(e) => setShowTheoryOverlay(e.target.checked)}
                className="w-3.5 h-3.5 accent-theme-primary cursor-pointer rounded"
              />
              <span className="text-theme-text font-medium flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-theme-primary" />
                <span>Show Theory Overlay</span>
                <span className="text-[10px] text-theme-text-muted font-normal">(C·f(N) dotted)</span>
              </span>
            </label>

            <div className="hidden md:block text-xs font-mono text-theme-text-muted">
              Y: Time (ms) · X: Size (N)
            </div>
          </div>
        </div>

        {chartData ? (
          <div className="w-full h-[320px] pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis
                  dataKey="size"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickFormatter={(val) => `${val / 1000}k`}
                  label={{
                    value: 'Array Size (N)',
                    position: 'insideBottom',
                    offset: -12,
                    fill: '#94a3b8',
                    fontSize: 11
                  }}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  unit="ms"
                  label={{
                    value: 'Execution Time (ms)',
                    angle: -90,
                    position: 'insideLeft',
                    offset: 5,
                    fill: '#94a3b8',
                    fontSize: 11
                  }}
                />
                <Tooltip content={<MinimalChartTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: 15, fontSize: 11, fontFamily: 'monospace' }}
                />

                {/* Empirical Physical Curves */}
                {selectedAlgos.includes('bubble') && (
                  <Line
                    type="monotone"
                    dataKey="bubble"
                    name="Bubble Sort (Physical)"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#f59e0b' }}
                    activeDot={{ r: 7 }}
                  />
                )}
                {selectedAlgos.includes('quick') && (
                  <Line
                    type="monotone"
                    dataKey="quick"
                    name="Quick Sort (Physical)"
                    stroke="#a855f7"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#a855f7' }}
                    activeDot={{ r: 7 }}
                  />
                )}
                {selectedAlgos.includes('merge') && (
                  <Line
                    type="monotone"
                    dataKey="merge"
                    name="Merge Sort (Physical)"
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#06b6d4' }}
                    activeDot={{ r: 7 }}
                  />
                )}

                {/* Theoretical Scaled Overlays (Dashed lines, opacity 0.6) */}
                {showTheoryOverlay && selectedAlgos.includes('bubble') && (
                  <Line
                    type="monotone"
                    dataKey="bubble_theory"
                    name="Bubble Theory: O(n²)"
                    stroke="#f59e0b"
                    strokeDasharray="5 5"
                    strokeWidth={1.8}
                    strokeOpacity={0.6}
                    dot={false}
                  />
                )}
                {showTheoryOverlay && selectedAlgos.includes('quick') && (
                  <Line
                    type="monotone"
                    dataKey="quick_theory"
                    name="Quick Theory: O(n log n)"
                    stroke="#a855f7"
                    strokeDasharray="5 5"
                    strokeWidth={1.8}
                    strokeOpacity={0.6}
                    dot={false}
                  />
                )}
                {showTheoryOverlay && selectedAlgos.includes('merge') && (
                  <Line
                    type="monotone"
                    dataKey="merge_theory"
                    name="Merge Theory: O(n log n)"
                    stroke="#06b6d4"
                    strokeDasharray="5 5"
                    strokeWidth={1.8}
                    strokeOpacity={0.6}
                    dot={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-theme-text-muted space-y-3">
            <div className="w-12 h-12 rounded-xl bg-theme-card border border-theme-border flex items-center justify-center text-theme-primary">
              <Zap className="w-6 h-6" />
            </div>
            <div className="text-sm font-semibold text-theme-text font-sans">
              No Benchmark Data Generated Yet
            </div>
            <p className="text-xs font-mono max-w-md">
              Click &quot;Run Benchmark&quot; above to spawn the Web Worker, generate datasets from 1,000 to 25,000 elements, and measure real execution times with theoretical curve-fitting.
            </p>
          </div>
        )}
      </div>

      {/* Summary Empirical Performance Table */}
      {benchmarkResults && (
        <div className="bg-theme-surface rounded-xl border border-theme-border p-5 shadow-subtle space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-theme-text">
              Empirical Results Table
            </h3>
            <span className="text-[10px] font-mono text-emerald-400">
              Measured via performance.now()
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono text-left">
              <thead>
                <tr className="border-b border-theme-border text-theme-text-muted">
                  <th className="py-2.5 px-3">Size (N)</th>
                  {selectedAlgos.includes('bubble') && <th className="py-2.5 px-3">Bubble Sort (ms)</th>}
                  {selectedAlgos.includes('quick') && <th className="py-2.5 px-3">Quick Sort (ms)</th>}
                  {selectedAlgos.includes('merge') && <th className="py-2.5 px-3">Merge Sort (ms)</th>}
                  <th className="py-2.5 px-3 text-right">Fastest</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border">
                {benchmarkResults.map((row) => {
                  const times = [];
                  if (row.bubble !== undefined) times.push({ name: 'Bubble', val: row.bubble });
                  if (row.quick !== undefined) times.push({ name: 'Quick', val: row.quick });
                  if (row.merge !== undefined) times.push({ name: 'Merge', val: row.merge });
                  times.sort((a, b) => a.val - b.val);
                  const fastest = times[0];

                  return (
                    <tr key={row.size} className="hover:bg-theme-card/40 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-theme-text">
                        {row.size.toLocaleString()}
                      </td>
                      {selectedAlgos.includes('bubble') && (
                        <td className="py-2.5 px-3 text-amber-400">
                          {row.bubble !== undefined ? `${row.bubble.toFixed(2)} ms` : '-'}
                        </td>
                      )}
                      {selectedAlgos.includes('quick') && (
                        <td className="py-2.5 px-3 text-purple-400">
                          {row.quick !== undefined ? `${row.quick.toFixed(2)} ms` : '-'}
                        </td>
                      )}
                      {selectedAlgos.includes('merge') && (
                        <td className="py-2.5 px-3 text-cyan-300">
                          {row.merge !== undefined ? `${row.merge.toFixed(2)} ms` : '-'}
                        </td>
                      )}
                      <td className="py-2.5 px-3 text-right">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                          {fastest ? fastest.name : '-'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

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
  Info,
  TrendingUp,
  Search,
  ArrowDownUp,
  Code2,
  AlertTriangle
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import BenchmarkWorker from '../workers/benchmark.worker.js?worker';
import { enrichDatasetWithTheory } from '../core/math/curveFitter';

const DEFAULT_CUSTOM_CODE = `// Write your custom sorting algorithm below.
// You must return the sorted array.
function customSort(arr) {
  // Example: Built-in JS sort
  return arr.sort((a, b) => a - b);
}

return customSort(arr);`;

const SORT_ALGO_CONFIGS = [
  { id: 'bubble', name: 'Bubble Sort', complexity: 'O(n²)', color: '#f59e0b', defaultActive: true },
  { id: 'quick', name: 'Quick Sort', complexity: 'O(n log n)', color: '#a855f7', defaultActive: true },
  { id: 'merge', name: 'Merge Sort', complexity: 'O(n log n)', color: '#06b6d4', defaultActive: true },
  { id: 'heap', name: 'Heap Sort', complexity: 'O(n log n)', color: '#10b981', defaultActive: true },
];

const SEARCH_ALGO_CONFIGS = [
  { id: 'linear', name: 'Linear Search', complexity: 'O(n)', color: '#f59e0b', defaultActive: true },
  { id: 'binary', name: 'Binary Search', complexity: 'O(log n)', color: '#10b981', defaultActive: true },
];

const PRESET_SORT_SIZES = [1000, 5000, 10000, 25000];
const PRESET_SEARCH_SIZES = [100000, 500000, 1000000, 5000000];

// Custom Minimalist Tooltip for Recharts
function MinimalChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  const numLabel = Number(label);
  const formattedLabel = numLabel >= 1000000
    ? `${(numLabel / 1000000).toFixed(1)}M`
    : numLabel >= 1000
    ? `${(numLabel / 1000).toLocaleString()}K`
    : numLabel.toLocaleString();

  return (
    <div className="bg-theme-card border border-theme-border p-3 rounded-lg shadow-minimal text-xs font-mono">
      <div className="font-semibold text-theme-text mb-2 border-b border-theme-border pb-1">
        Dataset: {formattedLabel} elements ({numLabel.toLocaleString()})
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
                {entry.value !== undefined ? `${entry.value.toFixed(4)} ms` : '-'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function BenchmarkLab() {
  const [benchmarkMode, setBenchmarkMode] = useState('sorting'); // 'sorting' | 'searching'
  const [selectedSortAlgos, setSelectedSortAlgos] = useState(['bubble', 'quick', 'merge', 'heap']);
  const [selectedSearchAlgos, setSelectedSearchAlgos] = useState(['linear', 'binary']);
  const [isRunning, setIsRunning] = useState(false);
  const [showTheoryOverlay, setShowTheoryOverlay] = useState(true);
  const [progressInfo, setProgressInfo] = useState(null);

  // Custom Algorithm Sandbox State
  const [enableCustomAlgo, setEnableCustomAlgo] = useState(false);
  const [customCode, setCustomCode] = useState(DEFAULT_CUSTOM_CODE);
  const [customCodeError, setCustomCodeError] = useState(null);

  const [sortResults, setSortResults] = useState(null);
  const [searchResults, setSearchResults] = useState(null);

  const workerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  const activeAlgos = benchmarkMode === 'sorting' ? selectedSortAlgos : selectedSearchAlgos;
  const currentRawResults = benchmarkMode === 'sorting' ? sortResults : searchResults;

  // Enrich data with theoretical curves when overlay is enabled
  const chartData = useMemo(() => {
    if (!currentRawResults) return null;
    if (!showTheoryOverlay) return currentRawResults;
    return enrichDatasetWithTheory(currentRawResults, activeAlgos);
  }, [currentRawResults, showTheoryOverlay, activeAlgos]);

  const toggleSortAlgorithm = (algoId) => {
    if (selectedSortAlgos.includes(algoId)) {
      if (selectedSortAlgos.length === 1) return;
      setSelectedSortAlgos(selectedSortAlgos.filter((id) => id !== algoId));
    } else {
      setSelectedSortAlgos([...selectedSortAlgos, algoId]);
    }
  };

  const toggleSearchAlgorithm = (algoId) => {
    if (selectedSearchAlgos.includes(algoId)) {
      if (selectedSearchAlgos.length === 1) return;
      setSelectedSearchAlgos(selectedSearchAlgos.filter((id) => id !== algoId));
    } else {
      setSelectedSearchAlgos([...selectedSearchAlgos, algoId]);
    }
  };

  const handleRunBenchmark = () => {
    if (isRunning) return;

    if (workerRef.current) {
      workerRef.current.terminate();
    }

    setIsRunning(true);
    setCustomCodeError(null);
    setProgressInfo({
      message: `Initializing Web Worker & Prepping ${benchmarkMode.toUpperCase()} datasets...`,
      percent: 0
    });

    const worker = new BenchmarkWorker();
    workerRef.current = worker;

    worker.onmessage = (event) => {
      const data = event.data;

      if (data.type === 'error') {
        setCustomCodeError(data.message || 'Error executing custom code.');
        setIsRunning(false);
        setProgressInfo(null);
        worker.terminate();
        workerRef.current = null;
      } else if (data.type === 'status') {
        setProgressInfo((prev) => ({
          ...prev,
          message: data.message
        }));
      } else if (data.type === 'progress') {
        const sizeFormatted = data.currentSize >= 1000000
          ? `${(data.currentSize / 1000000).toFixed(1)}M`
          : `${(data.currentSize / 1000).toLocaleString()}K`;

        setProgressInfo({
          message: `Benchmarking ${data.currentAlgorithm.toUpperCase()} on N = ${sizeFormatted}`,
          percent: data.progressPercent,
          currentSize: data.currentSize,
          currentAlgorithm: data.currentAlgorithm
        });
      } else if (data.type === 'done') {
        if (benchmarkMode === 'sorting') {
          setSortResults(data.results);
        } else {
          setSearchResults(data.results);
        }
        setIsRunning(false);
        setProgressInfo(null);
        worker.terminate();
        workerRef.current = null;
      }
    };

    worker.onerror = (err) => {
      console.error('Web Worker Error:', err);
      setCustomCodeError(err.message || 'Web Worker unexpected execution failure.');
      setIsRunning(false);
      setProgressInfo(null);
      worker.terminate();
      workerRef.current = null;
    };

    // Dispatch job to Web Worker
    if (benchmarkMode === 'sorting') {
      worker.postMessage({
        mode: 'sorting',
        algorithms: selectedSortAlgos,
        sizes: PRESET_SORT_SIZES,
        customCode: enableCustomAlgo ? customCode : null
      });
    } else {
      worker.postMessage({
        mode: 'searching',
        algorithms: selectedSearchAlgos,
        sizes: PRESET_SEARCH_SIZES
      });
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-theme-border">
        <div>
          <div className="inline-flex items-center gap-1 bg-theme-bg/60 p-1 rounded-lg border border-theme-border mb-2">
            <button
              onClick={() => setBenchmarkMode('sorting')}
              className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors flex items-center gap-1.5 border ${
                benchmarkMode === 'sorting'
                  ? 'bg-theme-surface text-theme-text font-semibold border-theme-border shadow-subtle'
                  : 'text-theme-text-muted hover:text-theme-text hover:bg-theme-surface/50 border-transparent'
              }`}
            >
              <ArrowDownUp className="w-3.5 h-3.5" />
              <span>Sorting Race (1K – 25K)</span>
            </button>

            <button
              onClick={() => setBenchmarkMode('searching')}
              className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors flex items-center gap-1.5 border ${
                benchmarkMode === 'searching'
                  ? 'bg-theme-surface text-theme-text font-semibold border-theme-border shadow-subtle'
                  : 'text-theme-text-muted hover:text-theme-text hover:bg-theme-surface/50 border-transparent'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Searching Race (100K – 5M)</span>
            </button>
          </div>

          <p className="text-xs text-theme-text-muted mt-1">
            {benchmarkMode === 'sorting'
              ? 'Empirical runtime profiling comparing O(n²) quadratic vs O(n log n) divide-and-conquer sorting.'
              : 'Empirical runtime comparison across massive contiguous arrays (up to 5,000,000 elements) proving O(n) vs O(log n).'}
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
            {benchmarkMode === 'sorting' ? (
              <>
                {SORT_ALGO_CONFIGS.map((algo) => {
                  const isSelected = selectedSortAlgos.includes(algo.id);
                  return (
                    <button
                      key={algo.id}
                      onClick={() => toggleSortAlgorithm(algo.id)}
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

                {/* Enable Custom Algorithm Toggle Button */}
                <button
                  onClick={() => {
                    setEnableCustomAlgo(!enableCustomAlgo);
                    setCustomCodeError(null);
                  }}
                  disabled={isRunning}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-2 border ${
                    enableCustomAlgo
                      ? 'bg-rose-500/15 text-rose-400 border-rose-500 shadow-subtle'
                      : 'bg-theme-bg/60 text-theme-text-muted hover:text-theme-text border-theme-border'
                  } ${isRunning ? 'cursor-not-allowed opacity-60' : ''}`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Enable Custom Algorithm</span>
                  {enableCustomAlgo && (
                    <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse ml-0.5" />
                  )}
                </button>
              </>
            ) : (
              SEARCH_ALGO_CONFIGS.map((algo) => {
                const isSelected = selectedSearchAlgos.includes(algo.id);
                return (
                  <button
                    key={algo.id}
                    onClick={() => toggleSearchAlgorithm(algo.id)}
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
              })
            )}
          </div>
        </div>

        {/* Actions & Dataset Preset */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="hidden lg:flex items-center gap-1.5 text-xs font-mono text-theme-text-muted px-3 py-1.5 bg-theme-bg rounded-lg border border-theme-border">
            <span>Sizes:</span>
            <span className="font-semibold text-theme-text">
              {benchmarkMode === 'sorting' ? '1K, 5K, 10K, 25K' : '100K, 500K, 1M, 5M'}
            </span>
          </div>

          <button
            onClick={handleRunBenchmark}
            disabled={isRunning || (!activeAlgos.length && !enableCustomAlgo)}
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
                <span>Run {benchmarkMode === 'sorting' ? 'Sorting' : 'Searching'} Benchmark</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Monaco Code Sandbox */}
      {benchmarkMode === 'sorting' && enableCustomAlgo && (
        <div className="bg-theme-surface rounded-xl border border-rose-500/30 p-5 shadow-subtle space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-theme-border pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Code2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-theme-text flex items-center gap-2">
                  <span>Custom Algorithm Sandbox</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 lowercase">
                    arr: number[]
                  </span>
                </h3>
                <p className="text-[11px] text-theme-text-muted mt-0.5 font-sans">
                  Write your custom sorting algorithm below. You must return the sorted array. Evaluated securely inside the Web Worker.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setCustomCode(DEFAULT_CUSTOM_CODE);
                setCustomCodeError(null);
              }}
              disabled={isRunning}
              className="px-2.5 py-1 text-xs font-mono rounded bg-theme-bg border border-theme-border text-theme-text-muted hover:text-theme-text transition-colors flex items-center gap-1.5 self-start sm:self-auto"
              title="Reset code template"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Template</span>
            </button>
          </div>

          {/* Monaco Editor Canvas */}
          <div className="rounded-lg border border-theme-border overflow-hidden shadow-inner bg-[#1e1e1e]">
            <Editor
              height="300px"
              defaultLanguage="javascript"
              theme="vs-dark"
              value={customCode}
              onChange={(value) => {
                setCustomCode(value || '');
                if (customCodeError) setCustomCodeError(null);
              }}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                fontLigatures: true,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                padding: { top: 10, bottom: 10 }
              }}
            />
          </div>

          {/* Clean Red Error Banner */}
          {customCodeError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3.5 rounded-lg text-xs font-mono flex items-start gap-2.5 shadow-subtle">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-bold flex items-center gap-2">
                  <span>Evaluation Error</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-500/20 uppercase font-mono">
                    Halted
                  </span>
                </div>
                <div className="text-red-300 font-sans text-xs leading-relaxed">
                  {customCodeError}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

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
            <span className="font-semibold">
              {benchmarkMode === 'sorting' ? 'Sorting Performance' : 'Massive Array Searching Performance'}: Execution Time vs N
            </span>
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
                <span className="text-[10px] text-theme-text-muted font-normal">(C·f(N) dashed)</span>
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
                  tickFormatter={(val) => (val >= 1000000 ? `${val / 1000000}M` : `${val / 1000}k`)}
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

                {/* Sorting Curves */}
                {benchmarkMode === 'sorting' && (
                  <>
                    {selectedSortAlgos.includes('bubble') && (
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
                    {selectedSortAlgos.includes('quick') && (
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
                    {selectedSortAlgos.includes('merge') && (
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

                    {/* Custom User Sorting Algorithm Line */}
                    {enableCustomAlgo && (
                      <Line
                        type="monotone"
                        dataKey="custom"
                        name="Custom Algorithm (Physical)"
                        stroke="#f43f5e"
                        strokeWidth={3}
                        dot={{ r: 5, fill: '#f43f5e' }}
                        activeDot={{ r: 8 }}
                      />
                    )}

                    {showTheoryOverlay && selectedSortAlgos.includes('bubble') && (
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
                    {showTheoryOverlay && selectedSortAlgos.includes('quick') && (
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
                    {showTheoryOverlay && selectedSortAlgos.includes('merge') && (
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
                  </>
                )}

                {/* Searching Curves */}
                {benchmarkMode === 'searching' && (
                  <>
                    {selectedSearchAlgos.includes('linear') && (
                      <Line
                        type="monotone"
                        dataKey="linear"
                        name="Linear Search (Physical O(N))"
                        stroke="#f59e0b"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: '#f59e0b' }}
                        activeDot={{ r: 7 }}
                      />
                    )}
                    {selectedSearchAlgos.includes('binary') && (
                      <Line
                        type="monotone"
                        dataKey="binary"
                        name="Binary Search (Physical O(log N))"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: '#10b981' }}
                        activeDot={{ r: 7 }}
                      />
                    )}

                    {showTheoryOverlay && selectedSearchAlgos.includes('linear') && (
                      <Line
                        type="monotone"
                        dataKey="linear_theory"
                        name="Linear Theory: O(n)"
                        stroke="#f59e0b"
                        strokeDasharray="5 5"
                        strokeWidth={1.8}
                        strokeOpacity={0.6}
                        dot={false}
                      />
                    )}
                    {showTheoryOverlay && selectedSearchAlgos.includes('binary') && (
                      <Line
                        type="monotone"
                        dataKey="binary_theory"
                        name="Binary Theory: O(log n)"
                        stroke="#10b981"
                        strokeDasharray="5 5"
                        strokeWidth={1.8}
                        strokeOpacity={0.6}
                        dot={false}
                      />
                    )}
                  </>
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
              No {benchmarkMode === 'sorting' ? 'Sorting' : 'Searching'} Benchmark Data Generated Yet
            </div>
            <p className="text-xs font-mono max-w-md">
              Click &quot;Run {benchmarkMode === 'sorting' ? 'Sorting' : 'Searching'} Benchmark&quot; to spawn the Web Worker and evaluate runtime execution times.
            </p>
          </div>
        )}
      </div>

      {/* Summary Empirical Performance Table */}
      {currentRawResults && (
        <div className="bg-theme-surface rounded-xl border border-theme-border p-5 shadow-subtle space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-theme-text">
              Empirical {benchmarkMode === 'sorting' ? 'Sorting' : 'Searching'} Results Table
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
                  {benchmarkMode === 'sorting' ? (
                    <>
                      {selectedSortAlgos.includes('bubble') && <th className="py-2.5 px-3">Bubble Sort (ms)</th>}
                      {selectedSortAlgos.includes('quick') && <th className="py-2.5 px-3">Quick Sort (ms)</th>}
                      {selectedSortAlgos.includes('merge') && <th className="py-2.5 px-3">Merge Sort (ms)</th>}
                      {enableCustomAlgo && <th className="py-2.5 px-3 text-rose-400">Custom Sort (ms)</th>}
                    </>
                  ) : (
                    <>
                      {selectedSearchAlgos.includes('linear') && <th className="py-2.5 px-3">Linear Search (ms)</th>}
                      {selectedSearchAlgos.includes('binary') && <th className="py-2.5 px-3">Binary Search (ms)</th>}
                    </>
                  )}
                  <th className="py-2.5 px-3 text-right">Fastest</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border">
                {currentRawResults.map((row) => {
                  const times = [];
                  if (benchmarkMode === 'sorting') {
                    if (row.bubble !== undefined) times.push({ name: 'Bubble', val: row.bubble });
                    if (row.quick !== undefined) times.push({ name: 'Quick', val: row.quick });
                    if (row.merge !== undefined) times.push({ name: 'Merge', val: row.merge });
                    if (row.custom !== undefined) times.push({ name: 'Custom', val: row.custom });
                  } else {
                    if (row.linear !== undefined) times.push({ name: 'Linear', val: row.linear });
                    if (row.binary !== undefined) times.push({ name: 'Binary', val: row.binary });
                  }
                  times.sort((a, b) => a.val - b.val);
                  const fastest = times[0];

                  return (
                    <tr key={row.size} className="hover:bg-theme-card/40 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-theme-text">
                        {row.size.toLocaleString()}
                      </td>
                      {benchmarkMode === 'sorting' ? (
                        <>
                          {selectedSortAlgos.includes('bubble') && (
                            <td className="py-2.5 px-3 text-amber-400">
                              {row.bubble !== undefined ? `${row.bubble.toFixed(2)} ms` : '-'}
                            </td>
                          )}
                          {selectedSortAlgos.includes('quick') && (
                            <td className="py-2.5 px-3 text-purple-400">
                              {row.quick !== undefined ? `${row.quick.toFixed(2)} ms` : '-'}
                            </td>
                          )}
                          {selectedSortAlgos.includes('merge') && (
                            <td className="py-2.5 px-3 text-cyan-300">
                              {row.merge !== undefined ? `${row.merge.toFixed(2)} ms` : '-'}
                            </td>
                          )}
                          {enableCustomAlgo && (
                            <td className="py-2.5 px-3 text-rose-400 font-bold">
                              {row.custom !== undefined ? `${row.custom.toFixed(2)} ms` : '-'}
                            </td>
                          )}
                        </>
                      ) : (
                        <>
                          {selectedSearchAlgos.includes('linear') && (
                            <td className="py-2.5 px-3 text-amber-400">
                              {row.linear !== undefined ? `${row.linear.toFixed(4)} ms` : '-'}
                            </td>
                          )}
                          {selectedSearchAlgos.includes('binary') && (
                            <td className="py-2.5 px-3 text-emerald-400 font-bold">
                              {row.binary !== undefined ? `${row.binary.toFixed(4)} ms` : '-'}
                            </td>
                          )}
                        </>
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

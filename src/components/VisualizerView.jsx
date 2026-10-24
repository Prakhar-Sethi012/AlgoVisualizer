import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  StepForward,
  RotateCcw,
  Shuffle,
  Info,
  Zap,
  ArrowDownUp,
  Layers,
  Sparkles
} from 'lucide-react';
import { bubbleSort } from '../core/algorithms/sorting/bubbleSort';
import { quickSort } from '../core/algorithms/sorting/quickSort';
import { mergeSort } from '../core/algorithms/sorting/mergeSort';

export const ALGORITHM_REGISTRY = {
  'bubble-sort': {
    id: 'bubble-sort',
    name: 'Bubble Sort',
    generator: bubbleSort,
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    stable: 'Yes',
    inPlace: 'Yes',
    description: 'Iteratively compares adjacent elements and swaps them into order, bubbling the largest unsorted element to the end of the array.'
  },
  'quick-sort': {
    id: 'quick-sort',
    name: 'Quick Sort',
    generator: quickSort,
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(log n)',
    stable: 'No',
    inPlace: 'Yes',
    description: 'Divides the array around an actively chosen pivot element, recursively partitioning smaller elements to the left and larger to the right.'
  },
  'merge-sort': {
    id: 'merge-sort',
    name: 'Merge Sort',
    generator: mergeSort,
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    stable: 'Yes',
    inPlace: 'No',
    description: 'Divides array into single elements, then merges sorted subarrays by overwriting elements into the primary array from auxiliary buffers.'
  }
};

export function VisualizerView({
  currentAlgoId = 'bubble-sort',
  onAlgoChange
}) {
  const [selectedAlgoId, setSelectedAlgoId] = useState(currentAlgoId);
  const [arraySize, setArraySize] = useState(20);
  const [speedMs, setSpeedMs] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // Sync internal state with external prop if changed from sidebar
  useEffect(() => {
    if (currentAlgoId && currentAlgoId !== selectedAlgoId && ALGORITHM_REGISTRY[currentAlgoId]) {
      handleAlgorithmSwitch(currentAlgoId);
    }
  }, [currentAlgoId]);

  // Base array data (kept unique for clean Framer Motion layout animations)
  const [baseArray, setBaseArray] = useState([]);
  const [state, setState] = useState({
    array: [],
    comparing: [],
    pivot: null,
    overwriting: [],
    swapped: false,
    sortedIndices: [],
    comparisons: 0,
    swaps: 0,
    stepInfo: 'Ready to visualize.'
  });

  const generatorRef = useRef(null);
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  // Generate distinct random integers so Framer Motion layout springs track unique keys
  const generateRandomArray = useCallback((size) => {
    const pool = Array.from({ length: 85 }, (_, i) => i + 15);
    // Fisher-Yates shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, size);
  }, []);

  // Initialize visualizer with the active algorithm
  const initVisualizer = useCallback((algoId, newArr) => {
    setIsPlaying(false);
    setIsDone(false);

    const arr = newArr ? [...newArr] : [...baseArray];
    if (newArr) {
      setBaseArray([...newArr]);
    }

    const algoConfig = ALGORITHM_REGISTRY[algoId] || ALGORITHM_REGISTRY['bubble-sort'];
    generatorRef.current = algoConfig.generator(arr);

    const initialYield = generatorRef.current.next().value;
    setState(initialYield || {
      array: arr,
      comparing: [],
      pivot: null,
      overwriting: [],
      swapped: false,
      sortedIndices: [],
      comparisons: 0,
      swaps: 0,
      stepInfo: `Ready to run ${algoConfig.name}.`
    });
  }, [baseArray]);

  // Handle switching algorithm: halts any execution and resets array
  const handleAlgorithmSwitch = (newAlgoId) => {
    if (!ALGORITHM_REGISTRY[newAlgoId]) return;
    setIsPlaying(false);
    setSelectedAlgoId(newAlgoId);
    if (onAlgoChange) {
      onAlgoChange(newAlgoId);
    }
    initVisualizer(newAlgoId, baseArray.length ? baseArray : null);
  };

  // Initial load
  useEffect(() => {
    const initial = generateRandomArray(arraySize);
    initVisualizer(selectedAlgoId, initial);
  }, [arraySize, generateRandomArray]);

  // Execute a single step of the generator
  const handleStep = useCallback(() => {
    if (!generatorRef.current) return;
    const { value, done } = generatorRef.current.next();
    if (value) {
      setState(value);
    }
    if (done) {
      setIsPlaying(false);
      setIsDone(true);
    }
  }, []);

  // Continuous play loop
  useEffect(() => {
    if (!isPlaying || isDone) return;

    const timer = setTimeout(() => {
      if (!generatorRef.current) return;
      const { value, done } = generatorRef.current.next();
      if (value) {
        setState(value);
      }
      if (done) {
        setIsPlaying(false);
        setIsDone(true);
      }
    }, speedMs);

    return () => clearTimeout(timer);
  }, [isPlaying, isDone, state, speedMs]);

  const togglePlay = () => {
    if (isDone) {
      initVisualizer(selectedAlgoId);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleShuffle = () => {
    const newArr = generateRandomArray(arraySize);
    initVisualizer(selectedAlgoId, newArr);
  };

  const handleReset = () => {
    initVisualizer(selectedAlgoId);
  };

  const currentAlgo = ALGORITHM_REGISTRY[selectedAlgoId] || ALGORITHM_REGISTRY['bubble-sort'];
  const maxVal = Math.max(...(state.array.length ? state.array : [100]), 100);

  // Determine bar styling based on generator state (Pivot > Overwriting > Comparing/Swapped > Sorted > Default)
  const getBarColorClass = (index) => {
    // 1. Pivot state for Quick Sort
    const isPivot = state.pivot === index || (Array.isArray(state.pivot) && state.pivot.includes(index));
    if (isPivot) {
      return 'bg-algo-pivot shadow-glow ring-2 ring-purple-400';
    }

    // 2. Overwriting state for Merge Sort
    const isOverwriting = state.overwriting?.includes(index) || state.overwriting === index;
    if (isOverwriting) {
      return 'bg-algo-overwriting shadow-glow ring-2 ring-cyan-300';
    }

    // 3. Comparison / Swapped state
    if (state.comparing?.includes(index)) {
      if (state.swapped) {
        return 'bg-algo-swapped shadow-glow ring-2 ring-red-400';
      }
      return 'bg-algo-comparing ring-2 ring-amber-300';
    }

    // 4. Sorted state
    if (state.sortedIndices?.includes(index)) {
      return 'bg-algo-sorted';
    }

    // 5. Default unsorted state
    return 'bg-algo-default hover:opacity-90';
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Top Header & Algorithm Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-theme-border">
        <div>
          {/* Minimalist Algorithm Tabs / Selector */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {Object.values(ALGORITHM_REGISTRY).map((algo) => {
              const isActive = selectedAlgoId === algo.id;
              return (
                <button
                  key={algo.id}
                  onClick={() => handleAlgorithmSwitch(algo.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all flex items-center gap-1.5 border ${
                    isActive
                      ? 'bg-theme-primary text-slate-950 border-theme-primary shadow-subtle'
                      : 'bg-theme-surface hover:bg-theme-surface-hover text-theme-text-muted hover:text-theme-text border-theme-border'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{algo.name}</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-theme-text-muted">
            <span className="px-2 py-0.5 rounded bg-theme-surface border border-theme-border text-theme-primary font-semibold">
              Time: {currentAlgo.timeComplexity}
            </span>
            <span className="px-2 py-0.5 rounded bg-theme-surface border border-theme-border text-theme-accent">
              Space: {currentAlgo.spaceComplexity}
            </span>
            <span className="px-2 py-0.5 rounded bg-theme-surface border border-theme-border text-theme-accent">
              Stable: {currentAlgo.stable}
            </span>
            <span className="px-2 py-0.5 rounded bg-theme-surface border border-theme-border text-theme-accent">
              In-Place: {currentAlgo.inPlace}
            </span>
          </div>

          <p className="text-xs text-theme-text-muted mt-2 max-w-2xl">
            {currentAlgo.description}
          </p>
        </div>

        {/* Real-time Counters */}
        <div className="flex items-center gap-4 bg-theme-surface p-2.5 px-4 rounded-lg border border-theme-border font-mono text-xs self-start lg:self-auto">
          <div>
            <span className="text-theme-text-muted">Comparisons:</span>{' '}
            <span className="font-semibold text-theme-primary">{state.comparisons}</span>
          </div>
          <div className="h-4 w-px bg-theme-border" />
          <div>
            <span className="text-theme-text-muted">Operations:</span>{' '}
            <span className="font-semibold text-algo-swapped">{state.swaps}</span>
          </div>
          <div className="h-4 w-px bg-theme-border" />
          <div>
            <span className="text-theme-text-muted">Status:</span>{' '}
            <span className={`font-semibold ${isDone ? 'text-algo-sorted' : isPlaying ? 'text-amber-400' : 'text-theme-text'}`}>
              {isDone ? 'Sorted' : isPlaying ? 'Running' : 'Paused'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Visualization Canvas with Framer Motion Layout Bars */}
      <div className="flex-1 min-h-[380px] bg-theme-surface rounded-xl border border-theme-border p-6 flex flex-col justify-end shadow-subtle relative overflow-hidden">
        {/* Step Inspector / Live Explainer HUD */}
        <div className="absolute top-4 left-4 right-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pointer-events-none z-10">
          <div className="flex items-center gap-2 text-xs font-mono bg-theme-bg/90 backdrop-blur-sm px-3 py-1.5 rounded-md border border-theme-border text-theme-text max-w-xl truncate shadow-subtle">
            <Info className="w-3.5 h-3.5 text-theme-primary flex-shrink-0" />
            <span className="truncate">{state.stepInfo}</span>
          </div>

          {/* Color Legend */}
          <div className="hidden lg:flex items-center gap-3 text-[11px] font-mono bg-theme-bg/90 backdrop-blur-sm px-3 py-1.5 rounded-md border border-theme-border shadow-subtle">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-algo-default inline-block" />
              <span className="text-theme-text-muted">Unsorted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-algo-comparing inline-block" />
              <span className="text-theme-text-muted">Compare</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-algo-swapped inline-block" />
              <span className="text-theme-text-muted">Swap</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-algo-pivot inline-block" />
              <span className="text-theme-text-muted">Pivot</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-algo-overwriting inline-block" />
              <span className="text-theme-text-muted">Overwrite</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-algo-sorted inline-block" />
              <span className="text-theme-text-muted">Sorted</span>
            </div>
          </div>
        </div>

        {/* Array Bars View with Framer Motion fluid positional swaps */}
        <div className="w-full h-[280px] flex items-end justify-center gap-1.5 sm:gap-2 px-2 pt-12">
          {state.array.map((value, idx) => {
            const heightPercent = Math.max((value / maxVal) * 100, 6);
            const isComparing = state.comparing?.includes(idx);
            const isPivot = state.pivot === idx || (Array.isArray(state.pivot) && state.pivot.includes(idx));
            const isOverwriting = state.overwriting?.includes(idx);

            return (
              <motion.div
                key={value}
                layout
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="flex-1 flex flex-col items-center justify-end h-full max-w-[40px] group relative"
              >
                {/* Numeric value label */}
                {arraySize <= 30 && (
                  <span
                    className={`text-[10px] sm:text-xs font-mono mb-1 transition-colors select-none ${
                      isPivot
                        ? 'text-purple-400 font-bold'
                        : isOverwriting
                        ? 'text-cyan-300 font-bold'
                        : isComparing
                        ? 'text-theme-primary font-bold'
                        : 'text-theme-text-muted opacity-80'
                    }`}
                  >
                    {value}
                  </span>
                )}

                {/* Vertical Bar Element */}
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full rounded-t-sm transition-colors duration-100 ease-out ${getBarColorClass(idx)}`}
                />

                {/* Index label */}
                {arraySize <= 25 && (
                  <span className="text-[9px] font-mono text-theme-text-muted mt-1.5 opacity-60 select-none">
                    {idx}
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-theme-surface rounded-xl border border-theme-border p-4 flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Playback Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium text-sm transition-all shadow-subtle ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-theme-primary hover:bg-theme-primary-hover text-slate-950 font-semibold'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" /> Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" /> Play
              </>
            )}
          </button>

          <button
            onClick={handleStep}
            disabled={isPlaying || isDone}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-theme-border bg-theme-card hover:bg-theme-surface-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-theme-text"
            title="Execute single generator step (yield)"
          >
            <StepForward className="w-4 h-4" /> Step
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium border border-theme-border bg-theme-card hover:bg-theme-surface-hover transition-colors text-theme-text-muted hover:text-theme-text"
            title="Reset to initial state"
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </button>

          <button
            onClick={handleShuffle}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium border border-theme-border bg-theme-card hover:bg-theme-surface-hover transition-colors text-theme-text-muted hover:text-theme-text"
            title="Generate new random array"
          >
            <Shuffle className="w-4 h-4" /> Randomize
          </button>
        </div>

        {/* Sliders: Speed & Array Size */}
        <div className="flex flex-wrap items-center gap-6 w-full lg:w-auto justify-end">
          {/* Speed slider */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-theme-text-muted whitespace-nowrap flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-theme-accent" /> Speed:
            </span>
            <input
              type="range"
              min="20"
              max="500"
              step="20"
              value={520 - speedMs}
              onChange={(e) => setSpeedMs(520 - Number(e.target.value))}
              className="w-24 sm:w-28 accent-theme-primary cursor-pointer"
            />
            <span className="text-xs font-mono text-theme-text-muted w-10 text-right">
              {speedMs}ms
            </span>
          </div>

          {/* Size slider */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-theme-text-muted whitespace-nowrap flex items-center gap-1">
              <ArrowDownUp className="w-3.5 h-3.5 text-theme-accent" /> Size:
            </span>
            <input
              type="range"
              min="8"
              max="45"
              step="1"
              disabled={isPlaying}
              value={arraySize}
              onChange={(e) => setArraySize(Number(e.target.value))}
              className="w-24 sm:w-28 accent-theme-primary cursor-pointer disabled:opacity-50"
            />
            <span className="text-xs font-mono text-theme-text-muted w-6 text-right">
              {arraySize}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

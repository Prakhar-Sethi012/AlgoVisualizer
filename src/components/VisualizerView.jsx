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
  Search,
  Target
} from 'lucide-react';
import { bubbleSort } from '../core/algorithms/sorting/bubbleSort';
import { quickSort } from '../core/algorithms/sorting/quickSort';
import { mergeSort } from '../core/algorithms/sorting/mergeSort';
import { heapSort } from '../core/algorithms/sorting/heapSort';
import { linearSearch } from '../core/algorithms/searching/linearSearch';
import { binarySearch } from '../core/algorithms/searching/binarySearch';

export const ALGORITHM_REGISTRY = {
  'bubble-sort': {
    id: 'bubble-sort',
    category: 'sorting',
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
    category: 'sorting',
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
    category: 'sorting',
    name: 'Merge Sort',
    generator: mergeSort,
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    stable: 'Yes',
    inPlace: 'No',
    description: 'Divides array into single elements, then merges sorted subarrays by overwriting elements into the primary array from auxiliary buffers.'
  },
  'heap-sort': {
    id: 'heap-sort',
    category: 'sorting',
    name: 'Heap Sort',
    generator: heapSort,
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(1)',
    stable: 'No',
    inPlace: 'Yes',
    description: 'Builds a Binary Max-Heap in O(n) time, then repeatedly extracts the root maximum to the sorted end in O(n log n) time.'
  },
  'linear-search': {
    id: 'linear-search',
    category: 'searching',
    name: 'Linear Search',
    generator: linearSearch,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    stable: 'N/A',
    inPlace: 'Yes',
    description: 'Inspects each item sequentially from index 0 to n-1 until the target is found or the end of the array is reached.'
  },
  'binary-search': {
    id: 'binary-search',
    category: 'searching',
    name: 'Binary Search',
    generator: binarySearch,
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    stable: 'N/A',
    inPlace: 'Yes',
    description: 'Requires sorted array. Evaluates midpoint, then discards half the array (opacity 0.2) in each step until target is found.'
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
  const [targetInput, setTargetInput] = useState('');

  // Sync internal state with external prop if changed from sidebar
  useEffect(() => {
    if (currentAlgoId && currentAlgoId !== selectedAlgoId && ALGORITHM_REGISTRY[currentAlgoId]) {
      handleAlgorithmSwitch(currentAlgoId);
    }
  }, [currentAlgoId]);

  // Base array data
  const [baseArray, setBaseArray] = useState([]);
  const [currentTarget, setCurrentTarget] = useState(null);

  const [state, setState] = useState({
    array: [],
    comparing: [],
    pivot: null,
    overwriting: [],
    swapped: false,
    sortedIndices: [],
    left: undefined,
    right: undefined,
    mid: undefined,
    currentIndex: undefined,
    foundIndex: -1,
    found: false,
    comparisons: 0,
    swaps: 0,
    stepInfo: 'Ready to visualize.'
  });

  const generatorRef = useRef(null);
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const currentAlgo = ALGORITHM_REGISTRY[selectedAlgoId] || ALGORITHM_REGISTRY['bubble-sort'];
  const isSearching = currentAlgo.category === 'searching';

  // Generate distinct random integers so Framer Motion layout springs track unique keys
  const generateRandomArray = useCallback((size) => {
    const pool = Array.from({ length: 85 }, (_, i) => i + 15);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, size);
  }, []);

  // Initialize visualizer with the active algorithm
  const initVisualizer = useCallback((algoId, newArr, customTarget) => {
    setIsPlaying(false);
    setIsDone(false);

    let arr = newArr ? [...newArr] : [...baseArray];
    if (newArr) {
      setBaseArray([...newArr]);
    }

    const algoConfig = ALGORITHM_REGISTRY[algoId] || ALGORITHM_REGISTRY['bubble-sort'];

    // Binary search requires pre-sorted input
    if (algoConfig.id === 'binary-search') {
      arr = [...arr].sort((a, b) => a - b);
    }

    // Determine target for search algorithms
    let target = customTarget !== undefined && customTarget !== null ? customTarget : currentTarget;
    if (algoConfig.category === 'searching') {
      if (target === null || !arr.includes(target)) {
        // Pick random element from array
        target = arr[Math.floor(Math.random() * arr.length)];
      }
      setCurrentTarget(target);
      setTargetInput(target.toString());
      generatorRef.current = algoConfig.generator(arr, target);
    } else {
      generatorRef.current = algoConfig.generator(arr);
    }

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
  }, [baseArray, currentTarget]);

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

  const handleTargetSubmit = (e) => {
    if (e) e.preventDefault();
    const val = parseInt(targetInput, 10);
    if (!isNaN(val)) {
      setCurrentTarget(val);
      initVisualizer(selectedAlgoId, baseArray, val);
    }
  };

  const maxVal = Math.max(...(state.array.length ? state.array : [100]), 100);

  // Determine bar styling based on generator state
  const getBarColorClass = (index) => {
    // 1. Found Target in Searching
    if (isSearching && state.foundIndex === index) {
      return 'bg-algo-sorted ring-1 ring-emerald-400/60 font-semibold';
    }

    // 2. Binary Search Midpoint
    if (selectedAlgoId === 'binary-search' && state.mid === index) {
      return 'bg-algo-comparing ring-1 ring-amber-300/70 font-semibold';
    }

    // 3. Linear Search Current Inspection Index
    if (selectedAlgoId === 'linear-search' && state.currentIndex === index) {
      return 'bg-algo-comparing ring-1 ring-amber-300/50';
    }

    // 4. Quick Sort Pivot
    const isPivot = state.pivot === index || (Array.isArray(state.pivot) && state.pivot.includes(index));
    if (isPivot) {
      return 'bg-algo-pivot ring-1 ring-purple-400/50';
    }

    // 5. Merge Sort Overwriting
    const isOverwriting = state.overwriting?.includes(index) || state.overwriting === index;
    if (isOverwriting) {
      return 'bg-algo-overwriting ring-1 ring-cyan-300/50';
    }

    // 6. Sorting Comparison / Swapped
    if (state.comparing?.includes(index)) {
      if (state.swapped) {
        return 'bg-algo-swapped ring-1 ring-rose-400/60';
      }
      return 'bg-algo-comparing ring-1 ring-amber-300/40';
    }

    // 7. Sorted Indices
    if (state.sortedIndices?.includes(index)) {
      return 'bg-algo-sorted';
    }

    // 8. Default Unsorted / Unsearched
    return 'bg-algo-default hover:opacity-90';
  };

  // Binary Search Rule: Bars outside [left, right] drop opacity to 0.2
  const getBarOpacityStyle = (index) => {
    if (selectedAlgoId === 'binary-search') {
      if (state.left !== undefined && state.right !== undefined && state.left !== -1) {
        if (index < state.left || index > state.right) {
          return 0.2; // Dimmed out of search space
        }
      }
    }
    if (selectedAlgoId === 'linear-search') {
      if (state.currentIndex !== undefined && index < state.currentIndex && index !== state.foundIndex) {
        return 0.45; // Already scanned
      }
    }
    return 1;
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Top Header & Algorithm Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-theme-border">
        <div>
          {/* Minimalist Algorithm Tabs / Selector */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {/* Quick Dropdown Select */}
            <div className="flex items-center gap-2 mr-2">
              <select
                value={selectedAlgoId}
                onChange={(e) => handleAlgorithmSwitch(e.target.value)}
                className="text-xs bg-theme-surface border border-theme-border rounded-lg px-2.5 py-1.5 text-theme-text font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-theme-primary cursor-pointer"
                title="Select Algorithm"
              >
                <optgroup label="Sorting Algorithms">
                  <option value="bubble-sort">Bubble Sort (O(n²))</option>
                  <option value="quick-sort">Quick Sort (O(n log n))</option>
                  <option value="merge-sort">Merge Sort (O(n log n))</option>
                  <option value="heap-sort">Heap Sort (O(n log n))</option>
                </optgroup>
                <optgroup label="Searching Algorithms">
                  <option value="linear-search">Linear Search (O(n))</option>
                  <option value="binary-search">Binary Search (O(log n))</option>
                </optgroup>
              </select>
            </div>

            {/* Minimalist Quick Tabs */}
            <div className="hidden sm:flex flex-wrap items-center gap-1 bg-theme-bg/60 p-1 rounded-lg border border-theme-border">
              {Object.values(ALGORITHM_REGISTRY).map((algo) => {
                const isActive = selectedAlgoId === algo.id;
                const isSearchTab = algo.category === 'searching';
                return (
                  <button
                    key={algo.id}
                    onClick={() => handleAlgorithmSwitch(algo.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors flex items-center gap-1.5 border ${
                      isActive
                        ? 'bg-theme-surface text-theme-text font-semibold border-theme-border shadow-subtle'
                        : 'text-theme-text-muted hover:text-theme-text hover:bg-theme-surface/50 border-transparent'
                    }`}
                  >
                    {isSearchTab ? <Search className="w-3.5 h-3.5" /> : <Layers className="w-3.5 h-3.5" />}
                    <span>{algo.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-theme-text-muted">
            <span className="px-2 py-0.5 rounded bg-theme-surface border border-theme-border text-theme-primary font-semibold">
              Time: {currentAlgo.timeComplexity}
            </span>
            <span className="px-2 py-0.5 rounded bg-theme-surface border border-theme-border text-theme-accent">
              Space: {currentAlgo.spaceComplexity}
            </span>
            <span className="px-2 py-0.5 rounded bg-theme-surface border border-theme-border text-theme-accent">
              Category: {currentAlgo.category === 'searching' ? 'Searching' : 'Sorting'}
            </span>
          </div>

          <p className="text-xs text-theme-text-muted mt-2 max-w-2xl">
            {currentAlgo.description}
          </p>
        </div>

        {/* Real-time Counters & Search Target HUD */}
        <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
          {/* Target Input Form for Search Algorithms */}
          {isSearching && (
            <form onSubmit={handleTargetSubmit} className="flex items-center gap-1.5 bg-theme-surface p-1.5 px-2.5 rounded-lg border border-theme-border font-mono text-xs">
              <Target className="w-3.5 h-3.5 text-theme-primary" />
              <span className="text-theme-text-muted">Target:</span>
              <input
                type="number"
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                className="w-14 bg-theme-bg border border-theme-border rounded px-1.5 py-0.5 text-xs font-mono text-theme-text"
              />
              <button
                type="submit"
                className="px-2 py-0.5 rounded bg-theme-card hover:bg-theme-surface-hover text-[11px] border border-theme-border"
              >
                Set
              </button>
            </form>
          )}

          <div className="flex items-center gap-4 bg-theme-surface p-2.5 px-4 rounded-lg border border-theme-border font-mono text-xs">
            <div>
              <span className="text-theme-text-muted">Checks:</span>{' '}
              <span className="font-semibold text-theme-primary">{state.comparisons}</span>
            </div>
            {!isSearching && (
              <>
                <div className="h-4 w-px bg-theme-border" />
                <div>
                  <span className="text-theme-text-muted">Operations:</span>{' '}
                  <span className="font-semibold text-algo-swapped">{state.swaps}</span>
                </div>
              </>
            )}
            <div className="h-4 w-px bg-theme-border" />
            <div>
              <span className="text-theme-text-muted">Status:</span>{' '}
              <span className={`font-semibold ${
                isSearching
                  ? state.found
                    ? 'text-algo-sorted'
                    : isDone
                    ? 'text-red-400'
                    : isPlaying
                    ? 'text-amber-400'
                    : 'text-theme-text'
                  : isDone
                  ? 'text-algo-sorted'
                  : isPlaying
                  ? 'text-amber-400'
                  : 'text-theme-text'
              }`}>
                {isSearching
                  ? state.found
                    ? 'Found!'
                    : isDone
                    ? 'Not Found'
                    : isPlaying
                    ? 'Searching'
                    : 'Paused'
                  : isDone
                  ? 'Sorted'
                  : isPlaying
                  ? 'Running'
                  : 'Paused'}
              </span>
            </div>
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

          {/* Color Legend for Searching vs Sorting */}
          {isSearching ? (
            <div className="hidden lg:flex items-center gap-3 text-[11px] font-mono bg-theme-bg/90 backdrop-blur-sm px-3 py-1.5 rounded-md border border-theme-border shadow-subtle">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-algo-comparing inline-block" />
                <span className="text-theme-text-muted">Mid / Current</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-algo-default opacity-20 inline-block border border-dashed border-theme-border" />
                <span className="text-theme-text-muted">Pruned (0.2 Opacity)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-algo-sorted inline-block" />
                <span className="text-theme-text-muted">Target Found</span>
              </div>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-3 text-[11px] font-mono bg-theme-bg/90 backdrop-blur-sm px-3 py-1.5 rounded-md border border-theme-border shadow-subtle">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-algo-default inline-block" />
                <span className="text-theme-text-muted">Unsorted</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-algo-comparing inline-block" />
                <span className="text-theme-text-muted">
                  {selectedAlgoId === 'heap-sort' ? 'Children' : 'Compare'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-algo-swapped inline-block" />
                <span className="text-theme-text-muted">Swap</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-algo-pivot inline-block" />
                <span className="text-theme-text-muted">
                  {selectedAlgoId === 'heap-sort' ? 'Root (Pivot)' : 'Pivot'}
                </span>
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
          )}
        </div>

        {/* Array Bars View with Framer Motion fluid positional swaps & search opacity dimming */}
        <div className="w-full h-[280px] flex items-end justify-center gap-1.5 sm:gap-2 px-2 pt-12">
          {state.array.map((value, idx) => {
            const heightPercent = Math.max((value / maxVal) * 100, 6);
            const isComparing = state.comparing?.includes(idx);
            const isMid = selectedAlgoId === 'binary-search' && state.mid === idx;
            const isCurrent = selectedAlgoId === 'linear-search' && state.currentIndex === idx;
            const isFound = isSearching && state.foundIndex === idx;
            const opacity = getBarOpacityStyle(idx);

            return (
              <motion.div
                key={value}
                layout
                animate={{ opacity }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="flex-1 flex flex-col items-center justify-end h-full max-w-[40px] group relative"
              >
                {/* Numeric value label */}
                {arraySize <= 30 && (
                  <span
                    className={`text-[10px] sm:text-xs font-mono mb-1 transition-colors select-none ${
                      isFound
                        ? 'text-emerald-400 font-bold'
                        : isMid || isCurrent
                        ? 'text-amber-300 font-bold'
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

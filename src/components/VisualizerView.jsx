import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, StepForward, RotateCcw, Shuffle, Info, Zap, ArrowDownUp } from 'lucide-react';
import { bubbleSort } from '../core/algorithms/sorting/bubbleSort';

export function VisualizerView({ algorithmName = 'Bubble Sort' }) {
  const [arraySize, setArraySize] = useState(20);
  const [speedMs, setSpeedMs] = useState(150);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // Initial and current array data
  const [baseArray, setBaseArray] = useState([]);
  const [state, setState] = useState({
    array: [],
    comparing: [],
    swapped: false,
    sortedIndices: [],
    comparisons: 0,
    swaps: 0,
    stepInfo: 'Generate an array and press Play or Step to begin.'
  });

  const generatorRef = useRef(null);
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  // Helper to generate a random array
  const generateRandomArray = useCallback((size) => {
    const arr = [];
    for (let i = 0; i < size; i++) {
      // Random integer between 10 and 100
      arr.push(Math.floor(Math.random() * 85) + 15);
    }
    return arr;
  }, []);

  // Reset visualizer with either new array or same base array
  const initVisualizer = useCallback((newArr) => {
    setIsPlaying(false);
    setIsDone(false);
    const arr = newArr || [...baseArray];
    if (newArr) {
      setBaseArray([...newArr]);
    }
    generatorRef.current = bubbleSort(arr);
    const initialYield = generatorRef.current.next().value;
    setState(initialYield || {
      array: arr,
      comparing: [],
      swapped: false,
      sortedIndices: [],
      comparisons: 0,
      swaps: 0,
      stepInfo: 'Ready to visualize.'
    });
  }, [baseArray]);

  // Initial load
  useEffect(() => {
    const initial = generateRandomArray(arraySize);
    initVisualizer(initial);
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

  // Play loop
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
      // If already done, reset first then play
      initVisualizer();
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleShuffle = () => {
    const newArr = generateRandomArray(arraySize);
    initVisualizer(newArr);
  };

  const handleReset = () => {
    initVisualizer();
  };

  const maxVal = Math.max(...(state.array.length ? state.array : [100]), 100);

  // Determine bar color styling based on generator state
  const getBarColorClass = (index) => {
    if (state.comparing.includes(index)) {
      if (state.swapped) {
        return 'bg-algo-swapped shadow-glow ring-2 ring-red-400';
      }
      return 'bg-algo-comparing ring-2 ring-amber-300';
    }
    if (state.sortedIndices?.includes(index)) {
      return 'bg-algo-sorted';
    }
    return 'bg-algo-default hover:opacity-90';
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Top Header & Educational Context */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-theme-border">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-theme-text font-sans">
              {algorithmName}
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-mono rounded bg-theme-surface border border-theme-border text-theme-accent">
              O(n²) Time
            </span>
            <span className="px-2.5 py-0.5 text-xs font-mono rounded bg-theme-surface border border-theme-border text-theme-accent">
              O(1) Space
            </span>
          </div>
          <p className="text-sm text-theme-text-muted mt-1">
            Iteratively steps through the list, compares adjacent elements, and swaps them if they are in the wrong order.
          </p>
        </div>

        {/* Real-time Counters */}
        <div className="flex items-center gap-4 bg-theme-surface p-2.5 px-4 rounded-lg border border-theme-border font-mono text-xs">
          <div>
            <span className="text-theme-text-muted">Comparisons:</span>{' '}
            <span className="font-semibold text-theme-primary">{state.comparisons}</span>
          </div>
          <div className="h-4 w-px bg-theme-border" />
          <div>
            <span className="text-theme-text-muted">Swaps:</span>{' '}
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

      {/* Main Visualization Canvas / Container */}
      <div className="flex-1 min-h-[380px] bg-theme-surface rounded-xl border border-theme-border p-6 flex flex-col justify-end shadow-subtle relative overflow-hidden">
        {/* Step Inspector / Live Explainer */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 text-xs font-mono bg-theme-bg/80 backdrop-blur-sm px-3 py-1.5 rounded-md border border-theme-border text-theme-text max-w-lg truncate">
            <Info className="w-3.5 h-3.5 text-theme-primary flex-shrink-0" />
            <span className="truncate">{state.stepInfo}</span>
          </div>

          {/* Color Legend */}
          <div className="hidden md:flex items-center gap-3 text-xs font-mono bg-theme-bg/80 backdrop-blur-sm px-3 py-1.5 rounded-md border border-theme-border">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-algo-default inline-block" />
              <span className="text-theme-text-muted">Unsorted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-algo-comparing inline-block" />
              <span className="text-theme-text-muted">Comparing</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-algo-swapped inline-block" />
              <span className="text-theme-text-muted">Swapped</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-algo-sorted inline-block" />
              <span className="text-theme-text-muted">Sorted</span>
            </div>
          </div>
        </div>

        {/* Array Bars View */}
        <div className="w-full h-[280px] flex items-end justify-center gap-1.5 sm:gap-2 px-2 pt-10">
          {state.array.map((value, idx) => {
            const heightPercent = Math.max((value / maxVal) * 100, 6);
            const isComparing = state.comparing.includes(idx);

            return (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center justify-end h-full max-w-[40px] group relative"
              >
                {/* Numeric value label */}
                {arraySize <= 30 && (
                  <span
                    className={`text-[10px] sm:text-xs font-mono mb-1 transition-colors ${
                      isComparing ? 'text-theme-primary font-bold' : 'text-theme-text-muted opacity-80'
                    }`}
                  >
                    {value}
                  </span>
                )}

                {/* Vertical Bar */}
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full rounded-t-sm transition-all duration-100 ease-out ${getBarColorClass(idx)}`}
                />

                {/* Index label */}
                {arraySize <= 25 && (
                  <span className="text-[9px] font-mono text-theme-text-muted mt-1.5 opacity-60">
                    {idx}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-theme-surface rounded-xl border border-theme-border p-4 flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Playback Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium text-sm transition-all shadow-subtle ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-theme-primary hover:bg-theme-primary-hover text-slate-900 font-semibold'
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
            title="Execute single generator step"
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

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  ArrowDown,
  ArrowUp,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Plus,
  Minus,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const MAX_CAPACITY = 10;

export function StackQueueView({ initialMode = 'stack' }) {
  const [mode, setMode] = useState(initialMode); // 'stack' | 'queue'
  const [inputValue, setInputValue] = useState('');
  const [items, setItems] = useState([
    { id: 1, value: 14 },
    { id: 2, value: 28 },
    { id: 3, value: 42 }
  ]);
  const [nextId, setNextId] = useState(4);
  const [statusMessage, setStatusMessage] = useState('Data structure ready. Try adding or removing elements.');
  const [lastAction, setLastAction] = useState(null);

  // Switch between Stack and Queue
  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setStatusMessage(`Switched to ${newMode === 'stack' ? 'Stack (LIFO)' : 'Queue (FIFO)'} view.`);
    setLastAction(null);
  };

  // Stack Push / Queue Enqueue
  const handleInsert = (e) => {
    if (e) e.preventDefault();

    if (items.length >= MAX_CAPACITY) {
      setStatusMessage(`Capacity limit reached (${MAX_CAPACITY} elements maximum).`);
      return;
    }

    const val = inputValue.trim() !== '' ? parseInt(inputValue, 10) : Math.floor(Math.random() * 90) + 10;
    if (isNaN(val)) return;

    const newItem = { id: nextId, value: val };
    setNextId((prev) => prev + 1);
    setInputValue('');

    if (mode === 'stack') {
      // Push: adds to top (end of array)
      setItems((prev) => [...prev, newItem]);
      setLastAction({ type: 'push', value: val });
      setStatusMessage(`Pushed element ${val} onto top of stack (LIFO).`);
    } else {
      // Enqueue: adds to rear (end of array)
      setItems((prev) => [...prev, newItem]);
      setLastAction({ type: 'enqueue', value: val });
      setStatusMessage(`Enqueued element ${val} at rear of queue (FIFO).`);
    }
  };

  // Stack Pop / Queue Dequeue
  const handleRemove = () => {
    if (items.length === 0) {
      setStatusMessage(`Underflow: Cannot remove from an empty ${mode}.`);
      return;
    }

    if (mode === 'stack') {
      // Pop: removes from top (last item)
      const popped = items[items.length - 1];
      setItems((prev) => prev.slice(0, prev.length - 1));
      setLastAction({ type: 'pop', value: popped.value });
      setStatusMessage(`Popped element ${popped.value} from top of stack.`);
    } else {
      // Dequeue: removes from front (first item)
      const dequeued = items[0];
      setItems((prev) => prev.slice(1));
      setLastAction({ type: 'dequeue', value: dequeued.value });
      setStatusMessage(`Dequeued element ${dequeued.value} from front of queue.`);
    }
  };

  // Peek operation
  const handlePeek = () => {
    if (items.length === 0) {
      setStatusMessage(`Cannot peek: ${mode} is currently empty.`);
      return;
    }

    if (mode === 'stack') {
      const top = items[items.length - 1];
      setStatusMessage(`Peek: Top of stack is value ${top.value} (O(1)).`);
    } else {
      const front = items[0];
      setStatusMessage(`Peek: Front of queue is value ${front.value} (O(1)).`);
    }
  };

  // Clear
  const handleClear = () => {
    setItems([]);
    setStatusMessage(`Cleared all elements from ${mode}.`);
    setLastAction(null);
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Top Header & Mode Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-theme-border">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => handleModeSwitch('stack')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 border ${
                mode === 'stack'
                  ? 'bg-theme-primary text-slate-950 border-theme-primary shadow-subtle'
                  : 'bg-theme-surface hover:bg-theme-surface-hover text-theme-text-muted hover:text-theme-text border-theme-border'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Stack (LIFO)</span>
            </button>

            <button
              onClick={() => handleModeSwitch('queue')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 border ${
                mode === 'queue'
                  ? 'bg-theme-primary text-slate-950 border-theme-primary shadow-subtle'
                  : 'bg-theme-surface hover:bg-theme-surface-hover text-theme-text-muted hover:text-theme-text border-theme-border'
              }`}
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>Queue (FIFO)</span>
            </button>
          </div>

          <p className="text-xs text-theme-text-muted mt-1">
            {mode === 'stack'
              ? 'Last-In, First-Out (LIFO). Elements are pushed and popped strictly from the top (O(1)).'
              : 'First-In, First-Out (FIFO). Elements are enqueued at the rear and dequeued from the front (O(1)).'}
          </p>
        </div>

        {/* Telemetry HUD */}
        <div className="flex items-center gap-4 bg-theme-surface p-2.5 px-4 rounded-lg border border-theme-border font-mono text-xs self-start sm:self-auto">
          <div>
            <span className="text-theme-text-muted">Size:</span>{' '}
            <span className="font-semibold text-theme-primary">{items.length}</span>
            <span className="text-theme-text-muted"> / {MAX_CAPACITY}</span>
          </div>
          <div className="h-4 w-px bg-theme-border" />
          <div>
            <span className="text-theme-text-muted">Access:</span>{' '}
            <span className="font-semibold text-emerald-400">
              {mode === 'stack' ? 'Top (LIFO)' : 'Front (FIFO)'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Visualizer Container */}
      <div className="flex-1 min-h-[380px] bg-theme-surface rounded-xl border border-theme-border p-6 flex flex-col items-center justify-center shadow-subtle relative overflow-hidden">
        {/* Status Explainer Badge */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
          <div className="flex items-center gap-2 text-xs font-mono bg-theme-bg/90 backdrop-blur-sm px-3 py-1.5 rounded-md border border-theme-border text-theme-text max-w-lg truncate shadow-subtle">
            <Info className="w-3.5 h-3.5 text-theme-primary flex-shrink-0" />
            <span className="truncate">{statusMessage}</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-theme-text-muted">
            <span>Capacity:</span>
            <div className="w-20 bg-theme-bg rounded-full h-1.5 border border-theme-border overflow-hidden">
              <div
                className="h-full bg-theme-primary transition-all duration-300"
                style={{ width: `${(items.length / MAX_CAPACITY) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* ===================== STACK VIEW (Vertical LIFO Bucket) ===================== */}
        {mode === 'stack' && (
          <div className="flex flex-col items-center justify-end h-[300px] w-full max-w-xs pt-8">
            <div className="text-[11px] font-mono text-theme-accent mb-2 flex items-center gap-1">
              <ArrowDown className="w-3 h-3 animate-bounce" />
              <span>TOP OF STACK</span>
            </div>

            {/* Stack Chamber (Open Top, Bordered Sides & Bottom) */}
            <div className="w-full flex-1 border-b-4 border-l-4 border-r-4 border-theme-border rounded-b-xl p-3 flex flex-col-reverse items-center justify-start gap-2 bg-theme-bg/40 backdrop-blur-sm overflow-y-auto">
              <AnimatePresence mode="popLayout">
                {items.map((item, idx) => {
                  const isTop = idx === items.length - 1;
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      className={`w-full py-2.5 px-4 rounded-lg flex items-center justify-between font-mono text-sm shadow-subtle border ${
                        isTop
                          ? 'bg-theme-primary/20 border-theme-primary text-theme-text ring-1 ring-theme-primary/40'
                          : 'bg-theme-card border-theme-border text-theme-text'
                      }`}
                    >
                      <span className="text-xs font-semibold text-theme-primary">
                        val: {item.value}
                      </span>
                      <span className="text-[10px] text-theme-text-muted">
                        {isTop ? 'TOP [index ' + idx + ']' : `[index ${idx}]`}
                      </span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {items.length === 0 && (
                <div className="h-full flex items-center justify-center text-xs font-mono text-theme-text-muted">
                  Stack is empty. Click &quot;Push&quot; to insert.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================== QUEUE VIEW (Horizontal FIFO Pipeline) ===================== */}
        {mode === 'queue' && (
          <div className="flex flex-col items-center justify-center w-full max-w-3xl pt-8 space-y-4">
            {/* Direction Signage */}
            <div className="w-full flex items-center justify-between text-xs font-mono px-4">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <ArrowLeft className="w-4 h-4 animate-pulse" />
                <span>FRONT (Dequeue O(1))</span>
              </div>
              <div className="flex items-center gap-1.5 text-theme-primary font-semibold">
                <span>REAR (Enqueue O(1))</span>
                <ArrowRight className="w-4 h-4 animate-pulse" />
              </div>
            </div>

            {/* Queue Pipeline Container */}
            <div className="w-full border-t-4 border-b-4 border-theme-border rounded-lg py-4 px-3 flex items-center justify-start gap-2.5 bg-theme-bg/40 backdrop-blur-sm overflow-x-auto min-h-[90px]">
              <AnimatePresence mode="popLayout">
                {items.map((item, idx) => {
                  const isFront = idx === 0;
                  const isRear = idx === items.length - 1;

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      className={`min-w-[70px] h-16 rounded-lg flex flex-col items-center justify-center font-mono shadow-subtle border flex-shrink-0 ${
                        isFront
                          ? 'bg-emerald-500/20 border-emerald-500 text-theme-text ring-1 ring-emerald-500/40'
                          : isRear
                          ? 'bg-theme-primary/20 border-theme-primary text-theme-text ring-1 ring-theme-primary/40'
                          : 'bg-theme-card border-theme-border text-theme-text'
                      }`}
                    >
                      <span className="text-sm font-bold text-theme-text">{item.value}</span>
                      <span className="text-[9px] text-theme-text-muted mt-0.5">
                        {isFront ? 'FRONT' : isRear ? 'REAR' : `#${idx}`}
                      </span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {items.length === 0 && (
                <div className="w-full text-center py-4 text-xs font-mono text-theme-text-muted">
                  Queue is empty. Click &quot;Enqueue&quot; to insert elements at the rear.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Control Panel */}
      <div className="bg-theme-surface rounded-xl border border-theme-border p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-subtle">
        {/* Value Input & Main Action Form */}
        <form onSubmit={handleInsert} className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Value (e.g. 55)"
            className="w-32 bg-theme-bg border border-theme-border rounded-lg px-3 py-2 text-xs font-mono text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary"
          />

          <button
            type="submit"
            disabled={items.length >= MAX_CAPACITY}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-theme-primary hover:bg-theme-primary-hover text-slate-950 transition-all shadow-subtle disabled:opacity-40"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{mode === 'stack' ? 'Push' : 'Enqueue'}</span>
          </button>

          <button
            type="button"
            onClick={handleRemove}
            disabled={items.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-all disabled:opacity-40"
          >
            <Minus className="w-3.5 h-3.5" />
            <span>{mode === 'stack' ? 'Pop' : 'Dequeue'}</span>
          </button>
        </form>

        {/* Auxiliary Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handlePeek}
            disabled={items.length === 0}
            className="px-3.5 py-2 rounded-lg text-xs font-mono border border-theme-border bg-theme-card hover:bg-theme-surface-hover text-theme-text transition-colors disabled:opacity-40"
          >
            Peek {mode === 'stack' ? 'Top' : 'Front'}
          </button>

          <button
            onClick={handleClear}
            disabled={items.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono border border-theme-border bg-theme-card hover:bg-theme-surface-hover text-theme-text-muted hover:text-theme-text transition-colors disabled:opacity-40"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>
    </div>
  );
}

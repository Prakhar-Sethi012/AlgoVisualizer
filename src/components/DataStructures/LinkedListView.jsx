import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  StepForward,
  RotateCcw,
  Plus,
  Trash2,
  Search,
  Sparkles,
  Info,
  Layers,
  ArrowRight,
  ArrowLeft,
  CornerDownLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Hash,
  Shuffle
} from 'lucide-react';

const INITIAL_NODES = [
  { id: 1, value: 12 },
  { id: 2, value: 25 },
  { id: 3, value: 47 },
  { id: 4, value: 68 },
  { id: 5, value: 89 }
];

export function LinkedListView({ onSwitchStructure, currentStructure = 'linked-list' }) {
  // 'singly' | 'doubly' | 'circular'
  const [listType, setListType] = useState('singly');
  const [nodes, setNodes] = useState(INITIAL_NODES);
  const [inputValue, setInputValue] = useState('');
  const [deleteValue, setDeleteValue] = useState('');
  const [speedMs, setSpeedMs] = useState(400);

  // Generator & Animation State
  const [statusMessage, setStatusMessage] = useState(
    'Linked List initialized. Choose an operation to see pointer traversal in amber.'
  );
  const [currentNodeIndex, setCurrentNodeIndex] = useState(-1);
  const [deletingIndex, setDeletingIndex] = useState(-1);
  const [insertedIndex, setInsertedIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeStepDescription, setActiveStepDescription] = useState('Idle');

  // SVG Coordinates for Circular Return Arrow
  const containerRef = useRef(null);
  const nodeRefs = useRef({});
  const [circularPathData, setCircularPathData] = useState(null);

  // Generator reference and running timeout
  const generatorRef = useRef(null);
  const timerRef = useRef(null);
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Update SVG return path for Circular Linked List
  const updateCircularPath = useCallback(() => {
    if (listType !== 'circular' || nodes.length === 0 || !containerRef.current) {
      setCircularPathData(null);
      return;
    }

    const firstEl = nodeRefs.current[nodes[0]?.id];
    const lastEl = nodeRefs.current[nodes[nodes.length - 1]?.id];

    if (!firstEl || !lastEl) {
      setCircularPathData(null);
      return;
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const firstRect = firstEl.getBoundingClientRect();
    const lastRect = lastEl.getBoundingClientRect();

    // Start point: bottom-right of last node
    const startX = lastRect.right - containerRect.left - 18;
    const startY = lastRect.bottom - containerRect.top;

    // End point: bottom-left of head node
    const endX = firstRect.left - containerRect.left + 24;
    const endY = firstRect.bottom - containerRect.top;

    // Curve height below nodes
    const curveY = Math.max(startY, endY) + 42;

    const path = `M ${startX} ${startY} C ${startX + 20} ${curveY}, ${endX - 20} ${curveY}, ${endX} ${endY + 6}`;
    setCircularPathData({ path, startX, startY, endX, endY, curveY });
  }, [listType, nodes]);

  useEffect(() => {
    const timer = setTimeout(updateCircularPath, 150);
    window.addEventListener('resize', updateCircularPath);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateCircularPath);
    };
  }, [nodes, listType, updateCircularPath]);

  // Stop running animation
  const stopExecution = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsPlaying(false);
    generatorRef.current = null;
  };

  // Step runner for generator
  const runNextStep = useCallback(() => {
    if (!generatorRef.current) {
      setIsPlaying(false);
      return;
    }

    const { value: stepState, done } = generatorRef.current.next();

    if (done || !stepState) {
      setIsPlaying(false);
      generatorRef.current = null;
      return;
    }

    // Apply yielded state
    if (stepState.nodes !== undefined) setNodes(stepState.nodes);
    if (stepState.currentNodeIndex !== undefined) setCurrentNodeIndex(stepState.currentNodeIndex);
    if (stepState.deletingIndex !== undefined) setDeletingIndex(stepState.deletingIndex);
    if (stepState.insertedIndex !== undefined) setInsertedIndex(stepState.insertedIndex);
    if (stepState.status) setStatusMessage(stepState.status);
    if (stepState.description) setActiveStepDescription(stepState.description);

    if (isPlayingRef.current) {
      timerRef.current = setTimeout(() => {
        runNextStep();
      }, speedMs);
    }
  }, [speedMs]);

  // Start generator execution
  const startGenerator = (gen) => {
    stopExecution();
    generatorRef.current = gen;
    setIsPlaying(true);
    // Initial step immediate
    setTimeout(() => {
      runNextStep();
    }, 50);
  };

  // Toggle Play / Pause
  const handleTogglePlay = () => {
    if (isPlaying) {
      stopExecution();
    } else if (generatorRef.current) {
      setIsPlaying(true);
      timerRef.current = setTimeout(() => {
        runNextStep();
      }, speedMs);
    }
  };

  // Manual Step Forward
  const handleStepForward = () => {
    if (isPlaying) {
      stopExecution();
    }
    runNextStep();
  };

  // ==================== GENERATOR LOGIC ====================

  // 1. Insert at Head Generator
  function* insertAtHeadGenerator(val) {
    const newId = Date.now();
    const newNode = { id: newId, value: val };

    yield {
      currentNodeIndex: -1,
      deletingIndex: -1,
      insertedIndex: -1,
      status: `Step 1/3: Allocating new node with value ${val} in heap memory...`,
      description: 'Allocate Node'
    };

    yield {
      currentNodeIndex: -1,
      deletingIndex: -1,
      insertedIndex: -1,
      status: `Step 2/3: Pointing newNode.next -> current Head (${nodes[0] ? nodes[0].value : 'null'})...`,
      description: 'Link Next Pointer'
    };

    const newNodes = [newNode, ...nodes];
    yield {
      nodes: newNodes,
      currentNodeIndex: 0,
      deletingIndex: -1,
      insertedIndex: 0,
      status: `Step 3/3: Updated HEAD pointer to point to new node ${val}. O(1) constant time insertion complete!`,
      description: 'Head Updated'
    };

    yield {
      currentNodeIndex: -1,
      insertedIndex: -1,
      status: `Insert at Head complete. New list length: ${newNodes.length}.`,
      description: 'Complete'
    };
  }

  // 2. Insert at Tail Generator (Traversal in Amber)
  function* insertAtTailGenerator(val) {
    const newId = Date.now();
    const newNode = { id: newId, value: val };

    if (nodes.length === 0) {
      yield {
        currentNodeIndex: -1,
        status: `List is empty. Allocating new node ${val} as Head & Tail...`,
        description: 'Empty List Insert'
      };
      yield {
        nodes: [newNode],
        currentNodeIndex: 0,
        insertedIndex: 0,
        status: `Node ${val} is now both Head and Tail. O(1).`,
        description: 'Complete'
      };
      yield {
        currentNodeIndex: -1,
        insertedIndex: -1,
        status: `Insert complete. List has 1 node.`,
        description: 'Idle'
      };
      return;
    }

    yield {
      currentNodeIndex: -1,
      status: `Starting traversal to find Tail. Initializing traversal pointer (curr = head)...`,
      description: 'Init Pointer'
    };

    // Walk through each node: pointer highlighted in amber!
    for (let i = 0; i < nodes.length; i++) {
      const isTailNode = i === nodes.length - 1;
      yield {
        currentNodeIndex: i,
        deletingIndex: -1,
        insertedIndex: -1,
        status: isTailNode
          ? `Pointer reached Tail (index ${i}, value: ${nodes[i].value})! Ready to link newNode.`
          : `Walking list: Pointer at index ${i} (value: ${nodes[i].value}) -> traversing to next node...`,
        description: isTailNode ? 'Tail Reached' : `Traversing (index ${i})`
      };
    }

    // Link new node
    const newNodes = [...nodes, newNode];
    yield {
      nodes: newNodes,
      currentNodeIndex: newNodes.length - 1,
      insertedIndex: newNodes.length - 1,
      status: `Linked Tail.next -> newNode (${val}). ${
        listType === 'circular' ? 'Circular pointer updated to point back to Head.' : ''
      } O(n) traversal complete!`,
      description: 'Linked to Tail'
    };

    yield {
      currentNodeIndex: -1,
      insertedIndex: -1,
      status: `Insert at Tail complete. Total nodes: ${newNodes.length}.`,
      description: 'Complete'
    };
  }

  // 3. Delete Node Generator (Searches for value with amber pointer, then deletes)
  function* deleteNodeGenerator(targetVal) {
    if (nodes.length === 0) {
      yield {
        status: 'Cannot delete: The linked list is empty.',
        description: 'Underflow'
      };
      return;
    }

    yield {
      currentNodeIndex: -1,
      status: `Starting linear traversal to find target value ${targetVal}...`,
      description: 'Search Started'
    };

    let targetIdx = -1;
    for (let i = 0; i < nodes.length; i++) {
      const isMatch = nodes[i].value === targetVal;
      yield {
        currentNodeIndex: i,
        deletingIndex: isMatch ? i : -1,
        status: isMatch
          ? `Target found! Node at index ${i} matches value ${targetVal}. Relinking adjacent pointers...`
          : `Searching: Inspecting index ${i} (value: ${nodes[i].value}) !== ${targetVal}. Advancing curr = curr.next...`,
        description: isMatch ? 'Target Found' : `Inspecting index ${i}`
      };

      if (isMatch) {
        targetIdx = i;
        break;
      }
    }

    if (targetIdx === -1) {
      yield {
        currentNodeIndex: -1,
        status: `Value ${targetVal} was not found in the linked list. O(n) search finished.`,
        description: 'Not Found'
      };
      return;
    }

    // Prepare deletion
    yield {
      currentNodeIndex: targetIdx,
      deletingIndex: targetIdx,
      status: `Unlinking node at index ${targetIdx} (${targetVal}): Bypassing pointers around node...`,
      description: 'Unlink Pointers'
    };

    const remainingNodes = nodes.filter((_, idx) => idx !== targetIdx);
    yield {
      nodes: remainingNodes,
      currentNodeIndex: -1,
      deletingIndex: -1,
      status: `Node ${targetVal} removed and deallocated. ${
        listType === 'circular' ? 'Circular return path preserved.' : ''
      } List size: ${remainingNodes.length}.`,
      description: 'Deletion Complete'
    };
  }

  // 4. Traverse Entire List Generator
  function* traverseListGenerator() {
    if (nodes.length === 0) {
      yield {
        status: 'Linked list is empty. Nothing to traverse.',
        description: 'Empty List'
      };
      return;
    }

    yield {
      currentNodeIndex: -1,
      status: `Beginning complete list traversal from HEAD...`,
      description: 'Traversal Start'
    };

    for (let i = 0; i < nodes.length; i++) {
      yield {
        currentNodeIndex: i,
        status: `Visiting node at index ${i} [Value: ${nodes[i].value}].${
          i === nodes.length - 1 ? ' Reached end of list!' : ''
        }`,
        description: `Visit index ${i}`
      };
    }

    if (listType === 'circular') {
      yield {
        currentNodeIndex: 0,
        status: `Circular link followed: Tail.next loops back to Head (index 0, value: ${nodes[0].value})!`,
        description: 'Loop back to Head'
      };
    }

    yield {
      currentNodeIndex: -1,
      status: `Traversal finished. Visited all ${nodes.length} nodes in O(n) time.`,
      description: 'Complete'
    };
  }

  // Operation Handlers
  const handleInsertHead = (e) => {
    if (e) e.preventDefault();
    const val = inputValue.trim() !== '' ? parseInt(inputValue, 10) : Math.floor(Math.random() * 90) + 10;
    if (isNaN(val)) return;
    setInputValue('');
    startGenerator(insertAtHeadGenerator(val));
  };

  const handleInsertTail = (e) => {
    if (e) e.preventDefault();
    const val = inputValue.trim() !== '' ? parseInt(inputValue, 10) : Math.floor(Math.random() * 90) + 10;
    if (isNaN(val)) return;
    setInputValue('');
    startGenerator(insertAtTailGenerator(val));
  };

  const handleDeleteSubmit = (e) => {
    if (e) e.preventDefault();
    const val = deleteValue.trim() !== '' ? parseInt(deleteValue, 10) : nodes[0]?.value;
    if (val === undefined || isNaN(val)) return;
    setDeleteValue('');
    startGenerator(deleteNodeGenerator(val));
  };

  const handleDeleteNodeDirect = (val) => {
    startGenerator(deleteNodeGenerator(val));
  };

  const handleTraverse = () => {
    startGenerator(traverseListGenerator());
  };

  const handleReset = () => {
    stopExecution();
    setNodes(INITIAL_NODES);
    setCurrentNodeIndex(-1);
    setDeletingIndex(-1);
    setInsertedIndex(-1);
    setStatusMessage('List reset to default elements.');
    setActiveStepDescription('Reset');
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Top Header: Structure Switcher & Linked List Variant Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-theme-border">
        <div>
          {/* Main Linear Structures Switcher */}
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => onSwitchStructure && onSwitchStructure('linked-list')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 border ${
                currentStructure === 'linked-list'
                  ? 'bg-theme-primary text-slate-950 border-theme-primary shadow-subtle'
                  : 'bg-theme-surface hover:bg-theme-surface-hover text-theme-text-muted hover:text-theme-text border-theme-border'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Linked Lists</span>
            </button>

            <button
              onClick={() => onSwitchStructure && onSwitchStructure('stack')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 border ${
                currentStructure === 'stack'
                  ? 'bg-theme-primary text-slate-950 border-theme-primary shadow-subtle'
                  : 'bg-theme-surface hover:bg-theme-surface-hover text-theme-text-muted hover:text-theme-text border-theme-border'
              }`}
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>Stack (LIFO)</span>
            </button>

            <button
              onClick={() => onSwitchStructure && onSwitchStructure('queue')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 border ${
                currentStructure === 'queue'
                  ? 'bg-theme-primary text-slate-950 border-theme-primary shadow-subtle'
                  : 'bg-theme-surface hover:bg-theme-surface-hover text-theme-text-muted hover:text-theme-text border-theme-border'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Queue (FIFO)</span>
            </button>
          </div>

          {/* Sub-variant Switcher: Singly, Doubly, Circular */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="text-xs font-mono text-theme-text-muted mr-1">Variant:</span>
            <button
              onClick={() => {
                setListType('singly');
                setStatusMessage('Switched to Singly Linked List (unidirectional next pointers).');
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all border ${
                listType === 'singly'
                  ? 'bg-theme-card text-theme-primary font-bold border-theme-primary shadow-subtle'
                  : 'bg-theme-surface text-theme-text-muted hover:text-theme-text border-theme-border'
              }`}
            >
              Singly Linked (Next -&gt;)
            </button>

            <button
              onClick={() => {
                setListType('doubly');
                setStatusMessage('Switched to Doubly Linked List (bidirectional Next & Prev pointers).');
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all border ${
                listType === 'doubly'
                  ? 'bg-theme-card text-emerald-400 font-bold border-emerald-500 shadow-subtle'
                  : 'bg-theme-surface text-theme-text-muted hover:text-theme-text border-theme-border'
              }`}
            >
              Doubly Linked (&lt;- Prev | Next -&gt;)
            </button>

            <button
              onClick={() => {
                setListType('circular');
                setStatusMessage('Switched to Circular Linked List (Tail.next routes back to Head).');
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all border ${
                listType === 'circular'
                  ? 'bg-theme-card text-cyan-400 font-bold border-cyan-500 shadow-subtle'
                  : 'bg-theme-surface text-theme-text-muted hover:text-theme-text border-theme-border'
              }`}
            >
              Circular (Tail ⤾ Head)
            </button>
          </div>
        </div>

        {/* Telemetry HUD */}
        <div className="flex flex-wrap items-center gap-3 bg-theme-surface p-2.5 px-4 rounded-lg border border-theme-border font-mono text-xs self-start lg:self-auto">
          <div>
            <span className="text-theme-text-muted">Nodes:</span>{' '}
            <span className="font-semibold text-theme-primary">{nodes.length}</span>
          </div>
          <div className="h-4 w-px bg-theme-border" />
          <div>
            <span className="text-theme-text-muted">Head:</span>{' '}
            <span className="font-semibold text-cyan-400">
              {nodes.length > 0 ? nodes[0].value : 'null'}
            </span>
          </div>
          <div className="h-4 w-px bg-theme-border" />
          <div>
            <span className="text-theme-text-muted">Tail:</span>{' '}
            <span className="font-semibold text-purple-400">
              {nodes.length > 0 ? nodes[nodes.length - 1].value : 'null'}
            </span>
          </div>
          <div className="h-4 w-px bg-theme-border" />
          <div>
            <span className="text-theme-text-muted">Search / Tail Walk:</span>{' '}
            <span className="font-semibold text-amber-400">O(n)</span>
          </div>
        </div>
      </div>

      {/* Control Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-theme-surface/70 rounded-xl border border-theme-border">
        {/* Insertion Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Value..."
            className="w-24 px-2.5 py-1.5 rounded-lg bg-theme-card border border-theme-border text-xs font-mono text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary"
            onKeyDown={(e) => e.key === 'Enter' && handleInsertTail(e)}
          />

          <button
            onClick={handleInsertHead}
            className="px-3 py-1.5 rounded-lg bg-theme-card hover:bg-theme-surface-hover border border-theme-border text-xs font-mono font-semibold text-theme-text hover:text-cyan-400 transition-colors flex items-center gap-1.5 shadow-subtle"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>Insert Head</span>
          </button>

          <button
            onClick={handleInsertTail}
            className="px-3 py-1.5 rounded-lg bg-theme-card hover:bg-theme-surface-hover border border-theme-border text-xs font-mono font-semibold text-theme-text hover:text-theme-primary transition-colors flex items-center gap-1.5 shadow-subtle"
          >
            <Plus className="w-3.5 h-3.5 text-theme-primary" />
            <span>Insert Tail</span>
          </button>
        </div>

        {/* Deletion & Search Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="number"
            value={deleteValue}
            onChange={(e) => setDeleteValue(e.target.value)}
            placeholder="Target..."
            className="w-24 px-2.5 py-1.5 rounded-lg bg-theme-card border border-theme-border text-xs font-mono text-theme-text focus:outline-none focus:ring-1 focus:ring-red-400"
            onKeyDown={(e) => e.key === 'Enter' && handleDeleteSubmit(e)}
          />

          <button
            onClick={handleDeleteSubmit}
            className="px-3 py-1.5 rounded-lg bg-theme-card hover:bg-theme-surface-hover border border-theme-border text-xs font-mono font-semibold text-theme-text hover:text-red-400 transition-colors flex items-center gap-1.5 shadow-subtle"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
            <span>Delete Target</span>
          </button>

          <button
            onClick={handleTraverse}
            className="px-3 py-1.5 rounded-lg bg-theme-card hover:bg-theme-surface-hover border border-theme-border text-xs font-mono font-semibold text-theme-text hover:text-amber-400 transition-colors flex items-center gap-1.5 shadow-subtle"
          >
            <Search className="w-3.5 h-3.5 text-amber-400" />
            <span>Traverse All</span>
          </button>
        </div>

        {/* Playback & Speed Controls */}
        <div className="flex items-center gap-2 border-l border-theme-border pl-3">
          <button
            onClick={handleTogglePlay}
            disabled={!generatorRef.current}
            className={`p-1.5 rounded-lg border text-xs font-mono transition-all ${
              isPlaying
                ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                : generatorRef.current
                ? 'bg-theme-card border-theme-border text-theme-text hover:text-theme-primary'
                : 'bg-theme-surface border-theme-border text-theme-text-muted/40 cursor-not-allowed'
            }`}
            title={isPlaying ? 'Pause' : 'Resume Generator'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          </button>

          <button
            onClick={handleStepForward}
            disabled={!generatorRef.current}
            className={`p-1.5 rounded-lg border text-xs font-mono transition-all ${
              generatorRef.current
                ? 'bg-theme-card border-theme-border text-theme-text hover:text-theme-primary'
                : 'bg-theme-surface border-theme-border text-theme-text-muted/40 cursor-not-allowed'
            }`}
            title="Step Forward"
          >
            <StepForward className="w-4 h-4" />
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-theme-card hover:bg-theme-surface-hover border border-theme-border text-theme-text-muted hover:text-theme-text transition-colors"
            title="Reset List"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 ml-1 text-xs font-mono text-theme-text-muted">
            <span>Speed:</span>
            <select
              value={speedMs}
              onChange={(e) => setSpeedMs(Number(e.target.value))}
              className="bg-theme-card border border-theme-border rounded px-1.5 py-0.5 text-theme-text text-xs focus:outline-none font-mono"
            >
              <option value={700}>Slow (700ms)</option>
              <option value={400}>Normal (400ms)</option>
              <option value={150}>Fast (150ms)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div
        ref={containerRef}
        className="flex-1 min-h-[420px] bg-theme-surface rounded-xl border border-theme-border p-6 flex flex-col justify-between shadow-subtle relative overflow-x-auto overflow-y-hidden"
      >
        {/* Floating Status & Step HUD */}
        <div className="flex items-center justify-between pointer-events-none z-10 mb-6">
          <div className="flex items-center gap-2 text-xs font-mono bg-theme-bg/95 backdrop-blur-md px-3.5 py-2 rounded-lg border border-theme-border text-theme-text max-w-xl truncate shadow-subtle">
            <Info className="w-4 h-4 text-theme-primary flex-shrink-0" />
            <span className="truncate">{statusMessage}</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono bg-theme-card/90 px-3 py-1.5 rounded-lg border border-theme-border text-theme-text-muted">
            <span>Phase:</span>
            <span className="font-bold text-amber-400">{activeStepDescription}</span>
          </div>
        </div>

        {/* Nodes Horizontal Render Chamber */}
        <div className="flex items-center justify-start min-w-max py-8 px-4 relative z-0">
          <AnimatePresence mode="popLayout">
            {nodes.map((node, index) => {
              const isHead = index === 0;
              const isTail = index === nodes.length - 1;
              const isCurrent = currentNodeIndex === index;
              const isDeleting = deletingIndex === index;
              const isNewlyInserted = insertedIndex === index;

              return (
                <motion.div
                  key={node.id}
                  ref={(el) => (nodeRefs.current[node.id] = el)}
                  layout
                  initial={{ opacity: 0, scale: 0.7, y: -25 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.5, y: 25 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className="flex items-center"
                >
                  {/* Before Head Label for Doubly Linked List */}
                  {isHead && listType === 'doubly' && (
                    <div className="flex items-center mr-2 text-xs font-mono text-theme-text-muted opacity-60">
                      <span className="px-1.5 py-0.5 rounded bg-theme-bg border border-theme-border">
                        NULL
                      </span>
                      <ArrowLeft className="w-3.5 h-3.5 ml-1 text-theme-text-muted" />
                    </div>
                  )}

                  {/* Individual Node Box */}
                  <div className="relative group flex flex-col items-center">
                    {/* Active Traversal Pointer Indicator (Amber) */}
                    {isCurrent && (
                      <motion.div
                        layoutId="activePointer"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute -top-10 flex flex-col items-center z-20 pointer-events-none"
                      >
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-bold uppercase tracking-wider shadow-lg">
                          CURR POINTER
                        </span>
                        <div className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-amber-500" />
                      </motion.div>
                    )}

                    {/* Node Header Tags: HEAD / TAIL / Index */}
                    <div className="flex items-center gap-1 mb-1 text-[10px] font-mono">
                      {isHead && (
                        <span className="px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold">
                          HEAD
                        </span>
                      )}
                      {isTail && (
                        <span className="px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30 font-bold">
                          TAIL
                        </span>
                      )}
                      <span className="text-theme-text-muted">[{index}]</span>
                    </div>

                    {/* Node Memory Card Structure */}
                    <div
                      onClick={() => handleDeleteNodeDirect(node.value)}
                      title="Click to delete this node"
                      className={`cursor-pointer rounded-xl font-mono text-xs shadow-subtle border-2 transition-all duration-200 overflow-hidden ${
                        isCurrent
                          ? 'border-amber-400 bg-amber-500/20 text-amber-200 ring-4 ring-amber-400/40 shadow-[0_0_20px_rgba(245,158,11,0.5)] scale-105'
                          : isDeleting
                          ? 'border-red-500 bg-red-500/20 text-red-200 ring-4 ring-red-500/40'
                          : isNewlyInserted
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-200 ring-2 ring-emerald-400/40'
                          : 'border-theme-border bg-theme-card hover:border-theme-primary/60 text-theme-text'
                      }`}
                    >
                      {/* Node Inner Layout */}
                      <div className="flex items-stretch divide-x divide-theme-border">
                        {/* Doubly: Prev Pointer Field */}
                        {listType === 'doubly' && (
                          <div className="px-2 py-3 bg-theme-bg/40 flex flex-col items-center justify-center text-[10px] text-theme-text-muted">
                            <span className="text-[9px] text-theme-accent">prev</span>
                            <span className="text-emerald-400 font-bold">
                              {index > 0 ? `•` : `ø`}
                            </span>
                          </div>
                        )}

                        {/* Node Value Container */}
                        <div className="px-5 py-3 flex flex-col items-center justify-center min-w-[70px]">
                          <span className="text-[9px] uppercase tracking-wider text-theme-text-muted">
                            data
                          </span>
                          <span className="text-base font-bold text-theme-text tracking-tight">
                            {node.value}
                          </span>
                        </div>

                        {/* Next Pointer Field */}
                        <div className="px-2.5 py-3 bg-theme-bg/40 flex flex-col items-center justify-center text-[10px] text-theme-text-muted">
                          <span className="text-[9px] text-theme-accent">next</span>
                          <span className="text-cyan-400 font-bold">
                            {isTail && listType !== 'circular' ? `ø` : `•`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Quick-Delete prompt on hover */}
                    <span className="text-[9px] font-mono text-theme-text-muted/50 group-hover:text-red-400 mt-1 transition-colors">
                      delete
                    </span>
                  </div>

                  {/* Connectors Between Nodes */}
                  {!isTail ? (
                    <div className="flex flex-col items-center justify-center mx-2.5 space-y-1">
                      {/* Next Pointer (Right Arrow) */}
                      <div className="flex items-center text-cyan-400">
                        <div className="w-5 h-0.5 bg-cyan-400/80" />
                        <ArrowRight className="w-4 h-4 -ml-1 text-cyan-400" />
                      </div>

                      {/* Doubly: Prev Pointer (Left Arrow) */}
                      {listType === 'doubly' && (
                        <div className="flex items-center text-emerald-400">
                          <ArrowLeft className="w-4 h-4 -mr-1 text-emerald-400" />
                          <div className="w-5 h-0.5 bg-emerald-400/80" />
                        </div>
                      )}
                    </div>
                  ) : (
                    /* End of List: NULL or Circular Indication */
                    listType !== 'circular' && (
                      <div className="flex items-center ml-3 text-xs font-mono text-theme-text-muted">
                        <ArrowRight className="w-4 h-4 mr-1.5 text-theme-text-muted" />
                        <span className="px-2 py-1 rounded bg-theme-bg border border-theme-border font-bold">
                          NULL
                        </span>
                      </div>
                    )
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {nodes.length === 0 && (
            <div className="flex flex-col items-center justify-center w-full py-12 text-center text-xs font-mono text-theme-text-muted">
              <AlertCircle className="w-6 h-6 mb-2 text-theme-primary/60" />
              <span>List is empty. Use the controls above to insert elements.</span>
            </div>
          )}
        </div>

        {/* Circular Linked List Return Path SVG Overlay */}
        {listType === 'circular' && circularPathData && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            <defs>
              <marker
                id="circular-arrow"
                viewBox="0 0 10 10"
                refX="6"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#06b6d4" />
              </marker>
            </defs>

            {/* Glowing Shadow Path */}
            <path
              d={circularPathData.path}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="4"
              strokeOpacity="0.2"
              className="filter blur-sm"
            />

            {/* Main Animated Return Curve */}
            <path
              d={circularPathData.path}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2"
              strokeDasharray="6 4"
              markerEnd="url(#circular-arrow)"
            />

            {/* Circular Return Badge */}
            <g transform={`translate(${(circularPathData.startX + circularPathData.endX) / 2 - 60}, ${circularPathData.curveY - 8})`}>
              <rect
                width="120"
                height="20"
                rx="4"
                fill="#0f1418"
                stroke="#06b6d4"
                strokeWidth="1"
                opacity="0.9"
              />
              <text
                x="60"
                y="14"
                textAnchor="middle"
                fill="#06b6d4"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
              >
                Tail.next ⤾ Head
              </text>
            </g>
          </svg>
        )}

        {/* Bottom Educational Footnote */}
        <div className="border-t border-theme-border pt-4 mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono text-theme-text-muted">
          <div className="p-3 rounded-lg bg-theme-bg/40 border border-theme-border">
            <div className="text-cyan-400 font-bold mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Singly Linked</span>
            </div>
            <p className="text-[11px] font-sans leading-relaxed">
              1 forward pointer per node. Memory efficient, strictly unidirectional. $O(1)$ head insertion, $O(n)$ search and tail insertion.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-theme-bg/40 border border-theme-border">
            <div className="text-emerald-400 font-bold mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Doubly Linked</span>
            </div>
            <p className="text-[11px] font-sans leading-relaxed">
              2 pointers per node (prev and next). Enables bidirectional traversal and $O(1)$ node removal given node reference.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-theme-bg/40 border border-theme-border">
            <div className="text-purple-400 font-bold mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Circular Linked</span>
            </div>
            <p className="text-[11px] font-sans leading-relaxed">
              Tail node loops back to Head. Zero NULL pointers. Essential for round-robin CPU scheduling and streaming ring buffers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

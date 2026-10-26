import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Shuffle,
  Compass,
  Repeat
} from 'lucide-react';

const INITIAL_NODES = [
  { id: 1, value: 12 },
  { id: 2, value: 25 },
  { id: 3, value: 47 },
  { id: 4, value: 68 },
  { id: 5, value: 89 }
];

const NODE_WIDTH = 76;
const NODE_HEIGHT = 58;

export function LinkedListView({ onSwitchStructure, currentStructure = 'linked-list' }) {
  // 'singly' | 'doubly' | 'circular'
  const [listType, setListType] = useState('singly');
  const [nodes, setNodes] = useState(INITIAL_NODES);
  const [inputValue, setInputValue] = useState('');
  const [deleteValue, setDeleteValue] = useState('');
  const [speedMs, setSpeedMs] = useState(350);

  // Generator & Animation State
  const [statusMessage, setStatusMessage] = useState(
    'Linked List ready. Switch variants or choose an operation to watch animated pointer traversal.'
  );
  const [currentNodeIndex, setCurrentNodeIndex] = useState(-1);
  const [deletingIndex, setDeletingIndex] = useState(-1);
  const [insertedIndex, setInsertedIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeStepDescription, setActiveStepDescription] = useState('Idle');

  // Container Dimensions with ResizeObserver
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 460 });

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

  // Debounced Resize Observer to avoid layout thrashing
  useEffect(() => {
    let resizeTimer = null;

    function handleResize(width, height) {
      if (width > 0 && height > 0) {
        setDimensions((prev) => {
          // Avoid triggering rerenders for subpixel noise (< 4px change)
          if (Math.abs(prev.width - width) < 4 && Math.abs(prev.height - height) < 4) {
            return prev;
          }
          return {
            width: Math.max(width, 360),
            height: Math.max(height, 420)
          };
        });
      }
    }

    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      handleResize(clientWidth, clientHeight);
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect) {
          const { width, height } = entry.contentRect;
          if (resizeTimer) clearTimeout(resizeTimer);
          resizeTimer = setTimeout(() => {
            handleResize(width, height);
          }, 60);
        }
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
      if (resizeTimer) clearTimeout(resizeTimer);
    };
  }, []);

  // ==========================================================
  // Layout Engine: Physical Radial Layout vs Linear Row Layout
  // Wrapped in useMemo for extreme performance
  // ==========================================================
  const { layoutNodes, layoutEdges, centerPos, radius } = useMemo(() => {
    const N = nodes.length;
    const cx = dimensions.width / 2;
    const cy = dimensions.height / 2;

    if (N === 0) {
      return {
        layoutNodes: [],
        layoutEdges: [],
        centerPos: { cx, cy },
        radius: 150
      };
    }

    if (listType === 'circular') {
      // ----------------------------------------------------
      // RADIAL LAYOUT (Strict Mathematical Circle)
      // cx = containerWidth / 2, cy = containerHeight / 2
      // R = Math.max(150, nodes.length * 25) constrained to viewport
      // angle = (i / N) * 2 * PI - (PI / 2)
      // ----------------------------------------------------
      const maxAvailableR = Math.min(dimensions.width / 2 - 65, dimensions.height / 2 - 60);
      const computedR = Math.max(130, Math.min(maxAvailableR, Math.max(150, N * 25)));

      const computedNodes = nodes.map((node, i) => {
        const angle = (i / N) * 2 * Math.PI - Math.PI / 2; // 12 o'clock start
        const x = cx + computedR * Math.cos(angle);
        const y = cy + computedR * Math.sin(angle);
        return {
          ...node,
          index: i,
          x,
          y,
          angle
        };
      });

      // Construct directed edges around the circle: node i -> (i+1)%N
      const edges = computedNodes.map((src, i) => {
        const target = computedNodes[(i + 1) % N];
        const isClosingEdge = i === N - 1;

        // Calculate boundary offsets so arrows touch the card edges nicely
        const dx = target.x - src.x;
        const dy = target.y - src.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const ux = dx / dist;
        const uy = dy / dist;

        const offset = 32;
        const x1 = src.x + ux * offset;
        const y1 = src.y + uy * offset;
        const x2 = target.x - ux * (offset + 6);
        const y2 = target.y - uy * (offset + 6);

        return {
          id: `circ-edge-${src.id}-${target.id}`,
          sourceIndex: i,
          targetIndex: (i + 1) % N,
          x1,
          y1,
          x2,
          y2,
          isClosingEdge
        };
      });

      return {
        layoutNodes: computedNodes,
        layoutEdges: edges,
        centerPos: { cx, cy },
        radius: computedR
      };
    } else {
      // ----------------------------------------------------
      // LINEAR HORIZONTAL ROW LAYOUT (Singly & Doubly)
      // ----------------------------------------------------
      const nodeSpacing = Math.min(135, Math.max(95, (dimensions.width - 120) / Math.max(1, N)));
      const totalWidth = (N - 1) * nodeSpacing;
      const startX = Math.max(65, (dimensions.width - totalWidth) / 2);

      const computedNodes = nodes.map((node, i) => {
        const x = startX + i * nodeSpacing;
        const y = cy;
        return {
          ...node,
          index: i,
          x,
          y,
          angle: 0
        };
      });

      const edges = [];
      for (let i = 0; i < N - 1; i++) {
        const src = computedNodes[i];
        const target = computedNodes[i + 1];
        edges.push({
          id: `linear-edge-${src.id}-${target.id}`,
          sourceIndex: i,
          targetIndex: i + 1,
          x1: src.x + NODE_WIDTH / 2 - 6,
          y1: cy,
          x2: target.x - NODE_WIDTH / 2 + 6,
          y2: cy,
          isClosingEdge: false
        });
      }

      return {
        layoutNodes: computedNodes,
        layoutEdges: edges,
        centerPos: { cx, cy },
        radius: 150
      };
    }
  }, [nodes, listType, dimensions]);

  // Memoized SVG Edge elements to prevent SVG layout thrashing
  const edgeElements = useMemo(() => {
    return layoutEdges.map((edge) => {
      if (listType === 'circular') {
        return (
          <g key={edge.id}>
            <line
              x1={edge.x1}
              y1={edge.y1}
              x2={edge.x2}
              y2={edge.y2}
              stroke={edge.isClosingEdge ? '#ec4899' : '#06b6d4'}
              strokeWidth={edge.isClosingEdge ? 2.5 : 2}
              strokeDasharray={edge.isClosingEdge ? '4 3' : undefined}
              markerEnd={edge.isClosingEdge ? 'url(#radial-closing-arrow)' : 'url(#radial-arrow)'}
              style={{
                transition: 'x1 300ms ease, y1 300ms ease, x2 300ms ease, y2 300ms ease',
                willChange: 'x1, y1, x2, y2'
              }}
              className="transition-all duration-300"
            />
          </g>
        );
      } else {
        return (
          <g key={edge.id}>
            <line
              x1={edge.x1}
              y1={edge.y1}
              x2={edge.x2}
              y2={edge.y2}
              stroke="#38bdf8"
              strokeWidth="2"
              markerEnd="url(#linear-next-arrow)"
              style={{
                transition: 'x1 300ms ease, y1 300ms ease, x2 300ms ease, y2 300ms ease',
                willChange: 'x1, y1, x2, y2'
              }}
              className="transition-all duration-300"
            />
          </g>
        );
      }
    });
  }, [layoutEdges, listType]);

  // Stop running generator
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
    setTimeout(() => {
      runNextStep();
    }, 40);
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
      status: `Step 1/3: Allocating new node with value ${val}...`,
      description: 'Allocate Node'
    };

    yield {
      currentNodeIndex: -1,
      deletingIndex: -1,
      insertedIndex: -1,
      status: `Step 2/3: Linking newNode.next -> current Head (${nodes[0] ? nodes[0].value : 'null'})...`,
      description: 'Link Next'
    };

    const newNodes = [newNode, ...nodes];
    yield {
      nodes: newNodes,
      currentNodeIndex: 0,
      deletingIndex: -1,
      insertedIndex: 0,
      status: `Step 3/3: Updated HEAD pointer to new node ${val}.${
        listType === 'circular' ? ' Radial ring re-calculated.' : ''
      }`,
      description: 'Head Updated'
    };

    yield {
      currentNodeIndex: -1,
      insertedIndex: -1,
      status: `Insert at Head complete. Total nodes: ${newNodes.length}.`,
      description: 'Complete'
    };
  }

  // 2. Insert at Tail Generator (Amber Traversal Pointer)
  function* insertAtTailGenerator(val) {
    const newId = Date.now();
    const newNode = { id: newId, value: val };

    if (nodes.length === 0) {
      yield {
        currentNodeIndex: -1,
        status: `List is empty. Allocating node ${val} as Head & Tail...`,
        description: 'Insert Single'
      };
      yield {
        nodes: [newNode],
        currentNodeIndex: 0,
        insertedIndex: 0,
        status: `Node ${val} is now Head and Tail.`,
        description: 'Complete'
      };
      yield {
        currentNodeIndex: -1,
        insertedIndex: -1,
        status: `Insert complete.`,
        description: 'Idle'
      };
      return;
    }

    yield {
      currentNodeIndex: -1,
      status: `Starting traversal to find Tail. Pointer initialized at Head...`,
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
          ? `Reached Tail (index ${i}, value ${nodes[i].value})! Ready to link newNode.`
          : `Traversing: Pointer at index ${i} (value ${nodes[i].value}) -> advancing to next...`,
        description: isTailNode ? 'Tail Reached' : `Traversing [${i}]`
      };
    }

    // Link new node
    const newNodes = [...nodes, newNode];
    yield {
      nodes: newNodes,
      currentNodeIndex: newNodes.length - 1,
      insertedIndex: newNodes.length - 1,
      status: `Linked Tail.next -> newNode (${val}). ${
        listType === 'circular' ? 'Radial ring expanded clockwise.' : ''
      }`,
      description: 'Linked to Tail'
    };

    yield {
      currentNodeIndex: -1,
      insertedIndex: -1,
      status: `Insert at Tail complete. Total nodes: ${newNodes.length}.`,
      description: 'Complete'
    };
  }

  // 3. Delete Node Generator
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
      status: `Searching for target value ${targetVal}...`,
      description: 'Search Started'
    };

    let targetIdx = -1;
    for (let i = 0; i < nodes.length; i++) {
      const isMatch = nodes[i].value === targetVal;
      yield {
        currentNodeIndex: i,
        deletingIndex: isMatch ? i : -1,
        status: isMatch
          ? `Match found! Node index ${i} has value ${targetVal}. Relinking pointers...`
          : `Searching: Index ${i} (${nodes[i].value}) !== ${targetVal}. Continuing...`,
        description: isMatch ? 'Target Found' : `Inspecting [${i}]`
      };

      if (isMatch) {
        targetIdx = i;
        break;
      }
    }

    if (targetIdx === -1) {
      yield {
        currentNodeIndex: -1,
        status: `Value ${targetVal} was not found in the linked list.`,
        description: 'Not Found'
      };
      return;
    }

    yield {
      currentNodeIndex: targetIdx,
      deletingIndex: targetIdx,
      status: `Bypassing node at index ${targetIdx} (${targetVal}) from pointer chain...`,
      description: 'Unlink Pointers'
    };

    const remainingNodes = nodes.filter((_, idx) => idx !== targetIdx);
    yield {
      nodes: remainingNodes,
      currentNodeIndex: -1,
      deletingIndex: -1,
      status: `Node ${targetVal} removed. Remaining nodes: ${remainingNodes.length}.`,
      description: 'Deleted'
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
      status: `Beginning traversal from HEAD...`,
      description: 'Start Traversal'
    };

    for (let i = 0; i < nodes.length; i++) {
      yield {
        currentNodeIndex: i,
        status: `Visiting node at index ${i} (value: ${nodes[i].value}).${
          i === nodes.length - 1 ? ' Reached end of list!' : ''
        }`,
        description: `Visit [${i}]`
      };
    }

    if (listType === 'circular') {
      yield {
        currentNodeIndex: 0,
        status: `Circular link followed: Tail.next loops back around to Head (index 0, value: ${nodes[0].value})!`,
        description: 'Loop to Head'
      };
    }

    yield {
      currentNodeIndex: -1,
      status: `Traversal finished in O(n) time.`,
      description: 'Complete'
    };
  }

  // Handlers
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

          {/* Sub-variant Switcher: Singly, Doubly, Circular (Radial) */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="text-xs font-mono text-theme-text-muted mr-1">Variant:</span>
            <button
              onClick={() => {
                setListType('singly');
                setStatusMessage('Switched to Singly Linked List (horizontal linear layout).');
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
                setStatusMessage('Switched to Doubly Linked List (bidirectional Next & Prev).');
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
                setStatusMessage('Switched to Circular Linked List (Radial Clockwise Layout).');
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all border flex items-center gap-1.5 ${
                listType === 'circular'
                  ? 'bg-theme-card text-cyan-400 font-bold border-cyan-500 shadow-subtle'
                  : 'bg-theme-surface text-theme-text-muted hover:text-theme-text border-theme-border'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>Circular (Radial Ring)</span>
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
            <span className="text-theme-text-muted">Topology:</span>{' '}
            <span className="font-semibold text-amber-400">
              {listType === 'circular' ? 'Radial Ring' : 'Linear Chain'}
            </span>
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

          <div className="flex items-center gap-1 ml-1 text-xs font-mono text-theme-text-muted">
            <span>Speed:</span>
            <select
              value={speedMs}
              onChange={(e) => setSpeedMs(Number(e.target.value))}
              className="bg-theme-card border border-theme-border rounded px-1.5 py-0.5 text-theme-text text-xs focus:outline-none font-mono"
            >
              <option value={700}>Slow (700ms)</option>
              <option value={350}>Normal (350ms)</option>
              <option value={150}>Fast (150ms)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Canvas Viewport: Supports Smooth Morphing between Radial Ring and Linear Row */}
      <div
        ref={containerRef}
        className="flex-1 min-h-[460px] bg-theme-surface rounded-xl border border-theme-border p-6 flex flex-col justify-between shadow-subtle relative overflow-hidden"
      >
        {/* Floating Status & Step HUD */}
        <div className="flex items-center justify-between pointer-events-none z-20 mb-4">
          <div className="flex items-center gap-2 text-xs font-mono bg-theme-bg/95 backdrop-blur-md px-3.5 py-2 rounded-lg border border-theme-border text-theme-text max-w-xl truncate shadow-subtle">
            <Info className="w-4 h-4 text-theme-primary flex-shrink-0" />
            <span className="truncate">{statusMessage}</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono bg-theme-card/90 px-3 py-1.5 rounded-lg border border-theme-border text-theme-text-muted">
            <span>Phase:</span>
            <span className="font-bold text-amber-400">{activeStepDescription}</span>
          </div>
        </div>

        {/* Dynamic Canvas Container */}
        <div className="relative flex-1 w-full h-full min-h-[360px]">
          {/* SVG Connector Layer */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <defs>
              <marker
                id="radial-arrow"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#06b6d4" />
              </marker>
              <marker
                id="radial-closing-arrow"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#ec4899" />
              </marker>
              <marker
                id="linear-next-arrow"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8" />
              </marker>
            </defs>

            {/* Circular Variant: Subtle Orbital Guide Ring Track */}
            {listType === 'circular' && layoutNodes.length > 1 && (
              <circle
                cx={centerPos.cx}
                cy={centerPos.cy}
                r={radius}
                fill="none"
                stroke="var(--color-border)"
                strokeWidth="1.5"
                strokeDasharray="4 6"
                strokeOpacity="0.4"
                className="transition-all duration-300"
              />
            )}

            {/* Edges Connecting Nodes */}
            {edgeElements}
          </svg>

          {/* Morphing Nodes Layer with unique layoutId so they physically swing from line to circle */}
          <AnimatePresence>
            {layoutNodes.map((node) => {
              const isHead = node.index === 0;
              const isTail = node.index === layoutNodes.length - 1;
              const isCurrent = currentNodeIndex === node.index;
              const isDeleting = deletingIndex === node.index;
              const isNewlyInserted = insertedIndex === node.index;

              return (
                <motion.div
                  key={node.id}
                  layout
                  layoutId={`ll-node-${node.id}`}
                  animate={{
                    x: node.x - NODE_WIDTH / 2,
                    y: node.y - NODE_HEIGHT / 2,
                    scale: isCurrent ? 1.08 : 1,
                    opacity: 1
                  }}
                  transition={{ type: 'spring', stiffness: 220, damping: 25 }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: NODE_WIDTH,
                    height: NODE_HEIGHT
                  }}
                  className="z-10 group"
                >
                  {/* Active Traversal Pointer Indicator (Amber) */}
                  {isCurrent && (
                    <motion.div
                      layoutId="activePointerBadge"
                      className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center z-30 pointer-events-none"
                    >
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-bold uppercase tracking-wider shadow-lg">
                        CURR
                      </span>
                    </motion.div>
                  )}

                  {/* Node Badge: HEAD / TAIL / [i] */}
                  <div className="absolute -top-3 left-1 flex items-center gap-0.5 z-20 pointer-events-none text-[8px] font-mono">
                    {isHead && (
                      <span className="px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                        H
                      </span>
                    )}
                    {isTail && (
                      <span className="px-1 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">
                        T
                      </span>
                    )}
                    <span className="text-theme-text-muted bg-theme-bg/80 px-1 rounded">
                      [{node.index}]
                    </span>
                  </div>

                  {/* Physical Memory Card Box */}
                  <div
                    onClick={() => handleDeleteNodeDirect(node.value)}
                    title="Click to delete this node"
                    className={`w-full h-full cursor-pointer rounded-xl font-mono text-xs shadow-subtle border-2 transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                      isCurrent
                        ? 'border-amber-400 bg-amber-500/20 text-amber-200 ring-4 ring-amber-400/40 shadow-[0_0_20px_rgba(245,158,11,0.5)]'
                        : isDeleting
                        ? 'border-red-500 bg-red-500/20 text-red-200 ring-4 ring-red-500/40'
                        : isNewlyInserted
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-200 ring-2 ring-emerald-400/40'
                        : 'border-theme-border bg-theme-card hover:border-theme-primary/60 text-theme-text'
                    }`}
                  >
                    <div className="flex items-stretch h-full divide-x divide-theme-border">
                      {/* Doubly: Prev Pointer Field */}
                      {listType === 'doubly' && (
                        <div className="w-5 bg-theme-bg/40 flex flex-col items-center justify-center text-[8px] text-theme-text-muted">
                          <span className="text-emerald-400 font-bold">
                            {node.index > 0 ? `•` : `ø`}
                          </span>
                        </div>
                      )}

                      {/* Data Value */}
                      <div className="flex-1 flex flex-col items-center justify-center">
                        <span className="text-[7px] uppercase tracking-wider text-theme-text-muted leading-none">
                          data
                        </span>
                        <span className="text-sm font-bold text-theme-text leading-tight mt-0.5">
                          {node.value}
                        </span>
                      </div>

                      {/* Next Pointer Field */}
                      <div className="w-5 bg-theme-bg/40 flex flex-col items-center justify-center text-[8px] text-theme-text-muted">
                        <span className="text-cyan-400 font-bold">
                          {isTail && listType !== 'circular' ? `ø` : `•`}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {nodes.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-xs font-mono text-theme-text-muted">
              <AlertCircle className="w-6 h-6 mb-2 text-theme-primary/60" />
              <span>List is empty. Use the controls above to insert elements.</span>
            </div>
          )}
        </div>

        {/* Bottom Educational Footnote */}
        <div className="border-t border-theme-border pt-4 mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono text-theme-text-muted z-20">
          <div className="p-3 rounded-lg bg-theme-bg/40 border border-theme-border">
            <div className="text-cyan-400 font-bold mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Singly Linked</span>
            </div>
            <p className="text-[11px] font-sans leading-relaxed">
              Horizontal linear chain. 1 pointer per node. Linear $O(n)$ search, $O(1)$ head insertion.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-theme-bg/40 border border-theme-border">
            <div className="text-emerald-400 font-bold mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Doubly Linked</span>
            </div>
            <p className="text-[11px] font-sans leading-relaxed">
              Bidirectional traversal with prev and next pointers. Enables $O(1)$ deletion given node reference.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-theme-bg/40 border border-theme-border">
            <div className="text-pink-400 font-bold mb-1 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-pink-400" />
              <span>Radial Circular Ring</span>
            </div>
            <p className="text-[11px] font-sans leading-relaxed">
              True circular radial coordinates: $x = c_x + R\cos(\theta)$, $y = c_y + R\sin(\theta)$. Last node links back to Head in an endless loop.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

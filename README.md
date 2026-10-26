# ⚡ AlgoVisualizer & Bare-Metal Benchmarking Lab

> **"Watch algorithms think, then race them on bare metal to prove the math."**

An enterprise-grade, browser-native Computer Science research and interactive visualization platform that bridges the divide between theoretical computational complexity and physical hardware execution. Built from the ground up on modern web primitives, **AlgoVisualizer** combines fine-grained time-traveling ES6 generator visualizations, a multi-threaded Web Worker benchmarking engine capable of processing millions of elements, an in-browser Monaco Editor algorithm sandbox, a symbolic Master Theorem solver, and a dynamic 5-palette HSL theming system.

---

## 📑 Table of Contents

1. [Core Philosophy: Theory vs. Reality](#-core-philosophy-theory-vs-reality)
2. [Project Architecture & Directory Structure](#-project-architecture--directory-structure)
   - [Complete File-by-File Breakdown](#complete-file-by-file-breakdown)
3. [Deep-Dive Engineering Highlights](#-deep-dive-engineering-highlights)
   - [1. Time-Traveling State Machines via ES6 Generators](#1-time-traveling-state-machines-via-es6-generators)
   - [2. Multi-Threaded Bare-Metal Benchmarking via Web Workers](#2-multi-threaded-bare-metal-benchmarking-via-web-workers)
   - [3. Monaco Code Editor & Live Custom Algorithm Sandbox](#3-monaco-code-editor--live-custom-algorithm-sandbox)
   - [4. Radial Linked List Geometry & Framer Motion Morphing](#4-radial-linked-list-geometry--framer-motion-morphing)
   - [5. Expression Tree (AST) & Notation Converter](#5-expression-tree-ast--notation-converter)
   - [6. Symbolic Master Theorem & Recurrence Engine](#6-symbolic-master-theorem--recurrence-engine)
   - [7. Extreme Performance Polish & Anti-Lag Optimizations](#7-extreme-performance-polish--anti-lag-optimizations)
4. [Algorithm & Data Structure Suite](#-algorithm--data-structure-suite)
5. [Dynamic Theming System](#-dynamic-theming-system)
6. [Getting Started & Installation](#-getting-started--installation)
7. [Production Verification & Build](#-production-verification--build)
8. [License](#-license)

---

## 🔬 Core Philosophy: Theory vs. Reality

Academic computer science traditionally models algorithms under the theoretical **RAM model** (Random Access Machine), which presumes uniform memory access latency and ignores physical hardware factors. In reality, execution speed is dictated by:
- **CPU Cache Spatial & Temporal Locality** ($L1/L2/L3$ caches vs. DRAM fetch cycles)
- **Branch Prediction** & Pipeline Stalls
- **V8 JIT Hidden Classes**, Inline Caching, and Monomorphic Typing
- **Garbage Collection (GC)** pauses and memory fragmentation

AlgoVisualizer makes these phenomena tangible:
- **Bubble Sort vs. Quick Sort**: While asymptotic theory proves $\mathcal{O}(n^2)$ vs. $\mathcal{O}(n \log n)$, physical execution shows Bubble Sort collapsing exponentially past $10,000$ integers due to massive write-pipeline thrashing, while Quick Sort sorts millions of integers in milliseconds.
- **Cache Locality in Action**: In-place Heap Sort vs. Merge Sort illustrates how pointer chasing and non-contiguous memory access in heap trees can lag behind sequential array scans despite sharing $\mathcal{O}(n \log n)$ upper bounds.
- **Empirical Theoretical Overlays**: By computing the scaling constant $C = \frac{\text{Time}(N_{\max})}{f(N_{\max})}$, the benchmarking lab superimposes asymptotic curves ($\mathcal{O}(n \log n), \mathcal{O}(n^2), \mathcal{O}(n)$) directly over real execution data to prove where theory and reality converge.

---

## 📂 Project Architecture & Directory Structure

```
AlgoVisualizer/
├── .gitignore                                  # Git exclusion configuration for builds, dependencies, and caches
├── README.md                                   # Master project manual, architecture documentation, and guide
├── index.html                                  # Single Page Application HTML entry point with fonts and root DOM
├── package.json                                # NPM package manifest, scripts, and runtime/development dependencies
├── package-lock.json                           # Deterministic dependency lockfile ensuring reproducible installs
├── postcss.config.js                           # PostCSS toolchain configuration for Tailwind CSS and Autoprefixer
├── tailwind.config.js                          # Custom Tailwind CSS theme extensions, color tokens, and animations
├── vite.config.js                              # Vite build configuration, worker bundling, and manual chunking
│
└── src/
    ├── App.jsx                                 # Root application component orchestrating view routing and themes
    ├── index.css                               # Global styles declaring dynamic HSL theme CSS variables
    ├── main.jsx                                # React 18 bootstrap entry point mounting App to the DOM
    │
    ├── components/
    │   ├── BenchmarkLab.jsx                    # Multi-threaded benchmark lab with Monaco Sandbox and Recharts
    │   ├── Home.jsx                            # Interactive overview dashboard with feature cards and metrics
    │   ├── MathLab.jsx                         # Symbolic Master Theorem solver, tree visualizer, and Big-O curves
    │   ├── Navigation.jsx                      # Application navigation bar, tab switcher, and theme selector modal
    │   ├── VisualizerView.jsx                  # Interactive Sorting and Searching execution canvas and debugger
    │   │
    │   └── DataStructures/
    │       ├── ExpressionConverterView.jsx     # Infix to Postfix/Prefix expression tree converter and tracer
    │       ├── GraphView.jsx                   # Graph algorithms visualizer (Dijkstra shortest path & Kruskal MST)
    │       ├── LinkedListView.jsx              # Radial circular, singly, and doubly linked list visualizer
    │       ├── StackQueueView.jsx              # Linear LIFO stack and FIFO queue visualizer with spring animations
    │       └── TreeView.jsx                    # Self-balancing AVL tree visualizer with real-time balancing rotations
    │
    ├── core/
    │   ├── algorithms/
    │   │   ├── graphs/
    │   │   │   ├── dijkstra.js                 # Generator-based Dijkstra shortest path algorithm with live tables
    │   │   │   └── kruskal.js                  # Generator-based Kruskal Minimum Spanning Tree with Union-Find
    │   │   │
    │   │   ├── raw/
    │   │   │   ├── binarySearch.js             # Bare-metal iterative Binary Search for nanosecond hardware benchmarks
    │   │   │   ├── bubbleSort.js               # Bare-metal iterative Bubble Sort for CPU race benchmarks
    │   │   │   ├── heapSort.js                 # Bare-metal in-place Heap Sort for CPU race benchmarks
    │   │   │   ├── index.js                    # Central export barrel and registry of all raw benchmark algorithms
    │   │   │   ├── linearSearch.js             # Bare-metal iterative Linear Search for CPU race benchmarks
    │   │   │   ├── mergeSort.js                # Bare-metal buffer-allocated Merge Sort for CPU race benchmarks
    │   │   │   └── quickSort.js                # Bare-metal in-place Quick Sort for CPU race benchmarks
    │   │   │
    │   │   ├── searching/
    │   │   │   ├── binarySearch.js             # Generator-based Binary Search with dynamic search-window dimming
    │   │   │   └── linearSearch.js             # Generator-based Linear Search with sequential pointer tracking
    │   │   │
    │   │   ├── sorting/
    │   │   │   ├── bubbleSort.js               # Generator-based Bubble Sort yielding comparison and swap states
    │   │   │   ├── heapSort.js                 # Generator-based Heap Sort yielding max-heapify and extract states
    │   │   │   ├── mergeSort.js                # Generator-based Merge Sort with recursive divide-and-conquer delegation
    │   │   │   └── quickSort.js                # Generator-based Quick Sort with Lomuto partitioning delegation
    │   │   │
    │   │   └── trees/
    │   │       ├── avlTree.js                  # AVL Tree class with LL/RR/LR/RL rotation step generator engines
    │   │       └── expressionTree.js           # Shunting-Yard AST parser and Postfix/Prefix traversal generators
    │   │
    │   ├── math/
    │   │   ├── curveFitter.js                  # Theoretical asymptotic curve fitting and scaling engine
    │   │   └── masterTheorem.js                # Regex-based Master Theorem recurrence relation parser and solver
    │   │
    │   └── utils/
    │       ├── graphData.js                    # Preset graph topologies (Wheel, Grid, Bottleneck) and coordinate mappers
    │       └── treeLayout.js                   # Node and edge coordinate layout generator for binary and expression trees
    │
    └── workers/
        └── benchmark.worker.js                 # Dedicated Web Worker executing CPU-intensive benchmarks in background thread
```

---

### Complete File-by-File Breakdown

#### Root Configuration Files

| File | Exact Purpose & Functionality |
| :--- | :--- |
| [`.gitignore`](file:///.gitignore) | Configures files and directories excluded from version control, such as `node_modules/`, `dist/`, `.env`, build artifacts, and system scratch directories. |
| [`README.md`](file:///README.md) | The primary engineering documentation, architecture overview, project directory structure file-by-file guide, and getting started instructions. |
| [`index.html`](file:///index.html) | The single HTML document loaded by the browser. Injects Google Fonts (`Inter`, `JetBrains Mono`), sets up the viewport, declares the application title, and provides the `<div id="root">` anchor for React. |
| [`package.json`](file:///package.json) | The project's package manifest. Defines project metadata, npm build/dev scripts, runtime dependencies (`react`, `framer-motion`, `recharts`, `lucide-react`, `@monaco-editor/react`, `canvas-confetti`), and dev tools (`vite`, `tailwindcss`, `postcss`, `autoprefixer`). |
| [`package-lock.json`](file:///package-lock.json) | Automatically generated lockfile pinning exact semantic versions of all direct and transitive npm dependencies to guarantee deterministic builds across environments. |
| [`postcss.config.js`](file:///postcss.config.js) | Configures the PostCSS transformation pipeline to load Tailwind CSS and Autoprefixer, injecting browser vendor prefixes for modern CSS rules. |
| [`tailwind.config.js`](file:///tailwind.config.js) | Configures Tailwind CSS styling rules, custom font families (`font-sans`, `font-mono`), transition durations, and theme color classes wired directly into dynamic HSL CSS variables (`--color-bg`, `--color-surface`, `--color-primary`, etc.). |
| [`vite.config.js`](file:///vite.config.js) | Configures the Vite development server (port 3000), enables the official React plugin (`@vitejs/plugin-react`), configures Web Worker bundling formats, and sets custom Rollup `manualChunks` partitioning for code splitting large dependencies (`recharts`, `framer-motion`). |

---

#### Application Core (`src/`)

| File | Exact Purpose & Functionality |
| :--- | :--- |
| [`src/main.jsx`](file:///src/main.jsx) | The client-side entry point that initializes the React application root using `ReactDOM.createRoot()` and renders `<App />` into the DOM. |
| [`src/index.css`](file:///src/index.css) | Core stylesheet defining CSS root tokens, dynamic theme definitions (Default Dark, Minimal Light, Ocean Depths, Tech Innovation, Arctic Frost), typography defaults, scrollbar customization, and utility styles. |
| [`src/App.jsx`](file:///src/App.jsx) | The master application component. Manages top-level navigation states (`home`, `visualizer`, `data-structures`, `trees`, `equation-converter`, `graphs`, `benchmark`, `recurrence`), dynamic theme switching, responsive mobile navigation drawers, and code-split component rendering with `<Suspense>`. |

---

#### Visualizer Views & Components (`src/components/`)

| File | Exact Purpose & Functionality |
| :--- | :--- |
| [`src/components/Navigation.jsx`](file:///src/components/Navigation.jsx) | Top navigation bar component rendering brand identity, primary navigation links with active indicators, theme selector modal button, and mobile menu toggles. |
| [`src/components/Home.jsx`](file:///src/components/Home.jsx) | Overview landing page featuring animated hero copy, quick-action cards launching specific modules, theory vs. hardware execution summaries, and system architectural badges. |
| [`src/components/VisualizerView.jsx`](file:///src/components/VisualizerView.jsx) | Core execution canvas for sorting (Bubble, Quick, Merge, Heap) and searching (Linear, Binary) algorithms. Includes playback controls (Play, Pause, Step, Reset), execution speed sliders, custom array generators (Random, Reversed, Nearly Sorted), line-by-line code inspector, and state telemetry. |
| [`src/components/BenchmarkLab.jsx`](file:///src/components/BenchmarkLab.jsx) | The bare-metal hardware benchmarking dashboard. Dispatches sorting/searching algorithms to dedicated Web Workers, scales datasets from 10 to 5,000,000 elements, embeds a live Monaco Code Editor for running custom JavaScript algorithms, and displays real-time Recharts execution graphs with theoretical asymptotic curve fitting. |
| [`src/components/MathLab.jsx`](file:///src/components/MathLab.jsx) | Mathematical analysis laboratory featuring an interactive Master Theorem recurrence relation solver with regex parsing, step-by-step recursion tree breakdown, and an interactive Big-O complexity comparator graph. |

---

#### Data Structure Visualizers (`src/components/DataStructures/`)

| File | Exact Purpose & Functionality |
| :--- | :--- |
| [`src/components/DataStructures/LinkedListView.jsx`](file:///src/components/DataStructures/LinkedListView.jsx) | Advanced Linked List visualizer supporting Singly, Doubly, and Circular Linked Lists. Features a literal **radial circle layout engine** with trigonometric node placement, orbital guide tracks, spring-physics morphing between linear and circular topologies, and animated pointer step-by-step traversal. |
| [`src/components/DataStructures/StackQueueView.jsx`](file:///src/components/DataStructures/StackQueueView.jsx) | Linear data structures visualizer demonstrating LIFO Stack mechanics (push, pop, peek, overflow protection) and FIFO Queue operations (enqueue, dequeue, capacity tracking) using Framer Motion animations. |
| [`src/components/DataStructures/TreeView.jsx`](file:///src/components/DataStructures/TreeView.jsx) | Interactive self-balancing AVL Tree visualizer displaying dynamic balance factors, height updates, and animated Left (LL), Right (RR), Left-Right (LR), and Right-Left (RL) balancing rotations with memoized SVG edge connectors and subpixel debounce optimizations. |
| [`src/components/DataStructures/ExpressionConverterView.jsx`](file:///src/components/DataStructures/ExpressionConverterView.jsx) | Interactive Expression Tree visualizer. Parses mathematical infix equations into a binary AST via Shunting-Yard logic, renders the tree with memoized SVG connectors, and dynamically animates Postfix (RPN) and Prefix (Polish) traversals with a live Result HUD. |
| [`src/components/DataStructures/GraphView.jsx`](file:///src/components/DataStructures/GraphView.jsx) | Graph visualizer supporting Dijkstra's Shortest Path and Kruskal's Minimum Spanning Tree algorithms across Wheel, City Grid, and Bottleneck topologies. Features edge weight randomization, live priority queue telemetry, and plain-English real-world analogies. |

---

#### Step-by-Step Visualization Generators (`src/core/algorithms/`)

| File | Exact Purpose & Functionality |
| :--- | :--- |
| [`src/core/algorithms/sorting/bubbleSort.js`](file:///src/core/algorithms/sorting/bubbleSort.js) | Generator-based Bubble Sort algorithm yielding comparison pairs, swap events, and confirmed sorted boundary indices for real-time visual playback. |
| [`src/core/algorithms/sorting/quickSort.js`](file:///src/core/algorithms/sorting/quickSort.js) | Generator-based Quick Sort with Lomuto partitioning. Uses recursive generator delegation (`yield*`) to animate active subarray bounds, pivot selections, and partition swaps. |
| [`src/core/algorithms/sorting/mergeSort.js`](file:///src/core/algorithms/sorting/mergeSort.js) | Generator-based Merge Sort. Implements divide-and-conquer recursion via `yield*`, tracking subarray splitting, auxiliary buffer states, and animated value write-backs. |
| [`src/core/algorithms/sorting/heapSort.js`](file:///src/core/algorithms/sorting/heapSort.js) | Generator-based Heap Sort. Visually illustrates initial max-heap building, recursive sift-down operations, and root-to-end element extractions. |
| [`src/core/algorithms/searching/linearSearch.js`](file:///src/core/algorithms/searching/linearSearch.js) | Generator-based Linear Search yielding current index pointer examinations, target match confirmations, and target-not-found completions. |
| [`src/core/algorithms/searching/binarySearch.js`](file:///src/core/algorithms/searching/binarySearch.js) | Generator-based Binary Search yielding `low`, `mid`, and `high` pointer movements while computing eliminated subarray ranges for dynamic visual dimming. |
| [`src/core/algorithms/graphs/dijkstra.js`](file:///src/core/algorithms/graphs/dijkstra.js) | Generator-based Dijkstra algorithm with greedy relaxation, yielding node extractions, neighbor edge evaluations, distance table updates, and shortest-path backtraces. |
| [`src/core/algorithms/graphs/kruskal.js`](file:///src/core/algorithms/graphs/kruskal.js) | Generator-based Kruskal MST algorithm. Employs Disjoint Set Union (Union-Find with path compression), yielding sorted edge evaluations, accepted tree edges, and discarded cycle edges. |
| [`src/core/algorithms/trees/avlTree.js`](file:///src/core/algorithms/trees/avlTree.js) | Self-balancing AVL Tree implementation. Provides methods for node insertion, height and balance factor updates, and generator functions for Left and Right rotations that yield step-by-step visual snapshots. |
| [`src/core/algorithms/trees/expressionTree.js`](file:///src/core/algorithms/trees/expressionTree.js) | Expression Tree engine parsing infix mathematical strings using a stack-based Shunting-Yard AST algorithm. Contains generator functions for `buildExpressionTree`, `getPostfix` (Post-order), `getPrefix` (Pre-order), and `getInfix` (In-order). |

---

#### Raw Bare-Metal Hardware Implementations (`src/core/algorithms/raw/`)

| File | Exact Purpose & Functionality |
| :--- | :--- |
| [`src/core/algorithms/raw/bubbleSort.js`](file:///src/core/algorithms/raw/bubbleSort.js) | Hyper-optimized in-place iterative Bubble Sort stripped of all generator and UI overhead for pure CPU microsecond benchmarking. |
| [`src/core/algorithms/raw/quickSort.js`](file:///src/core/algorithms/raw/quickSort.js) | High-performance in-place Quick Sort implementation using 3-way/Lomuto partitioning tuned for bare-metal V8 execution. |
| [`src/core/algorithms/raw/mergeSort.js`](file:///src/core/algorithms/raw/mergeSort.js) | High-throughput Merge Sort implementation utilizing pre-allocated auxiliary buffers for optimal hardware benchmarking without garbage collection spikes. |
| [`src/core/algorithms/raw/heapSort.js`](file:///src/core/algorithms/raw/heapSort.js) | In-place bare-metal iterative Heap Sort implementation designed for continuous memory benchmarks. |
| [`src/core/algorithms/raw/linearSearch.js`](file:///src/core/algorithms/raw/linearSearch.js) | Minimalist iterative sequential search implementation measuring raw CPU instruction cycle execution on arrays up to 5,000,000 integers. |
| [`src/core/algorithms/raw/binarySearch.js`](file:///src/core/algorithms/raw/binarySearch.js) | Zero-overhead iterative Binary Search function measuring logarithmic search speeds on sorted datasets in nanoseconds. |
| [`src/core/algorithms/raw/index.js`](file:///src/core/algorithms/raw/index.js) | Central registry exposing raw algorithms, metadata, theoretical complexities, and benchmark runner dispatch hooks. |

---

#### Mathematical Tools & Layout Utilities (`src/core/math/` & `src/core/utils/`)

| File | Exact Purpose & Functionality |
| :--- | :--- |
| [`src/core/math/masterTheorem.js`](file:///src/core/math/masterTheorem.js) | Symbolic recurrence relation parser that extracts parameters $a$, $b$, and $d$ from equations of the form $T(n) = aT(n/b) + \mathcal{O}(n^d)$, computes the critical exponent $\log_b(a)$, determines Master Theorem Cases 1, 2, or 3, and generates level-by-level recursion tree data. |
| [`src/core/math/curveFitter.js`](file:///src/core/math/curveFitter.js) | Empirical curve fitting utility that normalizes theoretical asymptotic functions ($f(n) = n, n \log n, n^2$) by computing scaling constant $C = \text{Time}(N_{\max}) / f(N_{\max})$ and generating chart overlay curves. |
| [`src/core/utils/graphData.js`](file:///src/core/utils/graphData.js) | Graph topology presets (Wheel, City Grid, Bottleneck map), normalized coordinate maps, edge weight generators, and responsive canvas coordinate scaling utilities. |
| [`src/core/utils/treeLayout.js`](file:///src/core/utils/treeLayout.js) | Deterministic tree layout engine computing $(x, y)$ coordinate positions for binary tree nodes and connecting SVG edges based on depth and viewport width. |

---

#### Concurrency & Workers (`src/workers/`)

| File | Exact Purpose & Functionality |
| :--- | :--- |
| [`src/workers/benchmark.worker.js`](file:///src/workers/benchmark.worker.js) | Dedicated Web Worker operating on an isolated OS background thread. Handles dataset generation, V8 JIT warmup iterations, high-precision `performance.now()` microsecond timing, safe execution of user-submitted Monaco Editor code, and asynchronous progress reporting back to the main UI. |

---

## 🏛️ Deep-Dive Engineering Highlights

### 1. Time-Traveling State Machines via ES6 Generators
Standard educational visualizers rely on crude `setTimeout` loops or recursive callbacks that freeze the main thread, cause memory leaks, or cannot pause or reverse.

AlgoVisualizer designs every algorithm as a **pure ES6 generator function** (`function*` and `yield*`):
- **Deterministic Step-by-Step Traversal**: The UI controls execution using `.next()`, pulling immutable snapshots only when needed.
- **Recursive Generator Delegation**: Complex recursive algorithms (Quick Sort, Merge Sort) delegate execution to subproblems using `yield*`, retaining standard call stack semantics while preserving pause and step capabilities.
- **Spring-Physics Rendering**: State snapshots are rendered via **Framer Motion** layout projections. When array elements swap or AVL trees undergo rotations, nodes smoothly glide across screen coordinates.

---

### 2. Multi-Threaded Bare-Metal Benchmarking via Web Workers
Visualizers with animation overhead cannot accurately benchmark raw execution speeds. To measure genuine computational throughput:
- **Dedicated Web Worker Offloading**: Raw, bare-metal algorithm implementations run in an isolated V8 thread (`benchmark.worker.js`) via Vite's `?worker` module syntax.
- **Zero UI Stutter**: Benchmarking executes datasets up to $5,000,000$ integers on background threads without locking the 60fps main UI thread.
- **V8 JIT Warmup & Monomorphic Typing**: Benchmark runs execute warmup iterations to ensure V8 optimizes hot loops. Large datasets utilize typed `Int32Array` buffers for high-density cache utilization.
- **High-Precision Timing**: Execution runtimes are measured using `performance.now()` microsecond timestamps and streamed back via typed worker messages to interactive **Recharts** visualizations.

---

### 3. Monaco Code Editor & Live Custom Algorithm Sandbox
The Benchmarking Lab integrates a full in-browser IDE powered by **Monaco Editor** (`@monaco-editor/react`):
- Write custom sorting or searching algorithms directly in JavaScript.
- Monaco provides full syntax highlighting, bracket matching, line numbering, and dark theme support.
- Code is compiled into a self-executing function and executed inside the Web Worker against native algorithms across matching dataset sizes.

---

### 4. Radial Linked List Geometry & Framer Motion Morphing
In [`LinkedListView.jsx`](file:///src/components/DataStructures/LinkedListView.jsx), the Circular Linked List variant renders in a literal mathematical circle rather than a straight line with a wrapped arrow:
- **Trigonometric Coordinate System**:
  $$c_x = \frac{\text{width}}{2}, \quad c_y = \frac{\text{height}}{2}, \quad R = \max\left(130, \min(R_{\max}, \max(150, N \times 25))\right)$$
  $$\theta_i = \left(\frac{i}{N}\right) \times 2\pi - \frac{\pi}{2}$$
  $$x_i = c_x + R \cdot \cos(\theta_i), \quad y_i = c_y + R \cdot \sin(\theta_i)$$
- **Topological Morphing**: Nodes use `<motion.div layout layoutId={`ll-node-${node.id}`}>`. When switching between Singly/Doubly (linear coordinates) and Circular (radial coordinates), Framer Motion calculates bounding box deltas and smoothly swings the nodes into a circle.
- **Closing Directed Arrow**: A dedicated SVG arrow connects the last node $(N-1)$ directly back to the head node $(0)$, completing the visual ring.

---

### 5. Expression Tree (AST) & Notation Converter
In [`expressionTree.js`](file:///src/core/algorithms/trees/expressionTree.js) and [`ExpressionConverterView.jsx`](file:///src/components/DataStructures/ExpressionConverterView.jsx):
- **Shunting-Yard AST Generation**: Parses infix mathematical expressions (e.g. `(a+b)*(c-d)` or `a+b*c^d`) into a binary Expression Tree respecting operator precedence (`^` > `*`, `/`, `%` > `+`, `-`) and parentheses.
- **Interactive Traversal Tracers**:
  - **Postfix (RPN)**: Post-order generator (Left $\to$ Right $\to$ Root) tracing token-by-token evaluation.
  - **Prefix (Polish)**: Pre-order generator (Root $\to$ Left $\to$ Right) tracing expression generation.
  - **Infix**: In-order generator (Left $\to$ Root $\to$ Right) reconstructing parenthesized infix expressions.
- **Dynamic Result HUD**: Bottom telemetry bar displaying animated token chips as they are generated in real time.

---

### 6. Symbolic Master Theorem & Recurrence Engine
In [`masterTheorem.js`](file:///src/core/math/masterTheorem.js) and [`MathLab.jsx`](file:///src/components/MathLab.jsx):
- **Regex Equation Parser**: Parses recurrence relations of the form:
  $$T(n) = aT(n/b) + \Theta(n^d)$$
- **Analytical Solver**:
  - Computes critical exponent $c_{\text{crit}} = \log_b(a)$.
  - Compares $c_{\text{crit}}$ against $d$ to classify into:
    - **Case 1 ($c_{\text{crit}} > d$)**: Tree-heavy work $\implies \Theta(n^{\log_b a})$.
    - **Case 2 ($c_{\text{crit}} = d$)**: Balanced work across all levels $\implies \Theta(n^d \log n)$.
    - **Case 3 ($c_{\text{crit}} < d$)**: Root-heavy work $\implies \Theta(n^d)$.
- **Recursion Tree Visualization**: Generates level-by-level breakdowns showing node count, subproblem size, and work per level.

---

### 7. Extreme Performance Polish & Anti-Lag Optimizations
To eliminate rendering jank and layout thrashing across all visualizers:
- **Debounced Resize Observers**: Container `ResizeObserver` instances ignore subpixel noise ($< 4\text{px}$ variations), preventing unnecessary layout recalculation cycles.
- **Memoized Layout & SVG Elements**: Tree coordinate calculations (`calculateTreeLayout`) and rendered SVG `<line>` elements are wrapped in `useMemo`, recalculating only when tree structure or dimensions change.
- **Framer Motion Layout ID Caching**: Every node uses persistent keys and `layoutId` props (`tree-node-${id}`, `expr-node-${id}`, `graph-node-${id}`, `ll-node-${id}`), enabling GPU transform animations without unmounting or remounting DOM elements.
- **GPU-Accelerated SVG Edge Transitions**: Replaced heavy motion line projections with standard SVG `<line>` elements styled with CSS GPU transitions (`will-change: x1, y1, x2, y2`), offloading edge updates to the compositor.

---

## 🧩 Algorithm & Data Structure Suite

| Category | Structure / Algorithm | Theoretical Complexity | Visual & Engineering Highlight |
| :--- | :--- | :--- | :--- |
| **Sorting** | Bubble Sort | $\mathcal{O}(n^2)$ | Real-time comparison highlights, animated pointer swaps, sorted bounds |
| **Sorting** | Quick Sort | $\mathcal{O}(n \log n)$ | Lomuto partitioning, recursive generator delegation (`yield*`), active pivot |
| **Sorting** | Merge Sort | $\mathcal{O}(n \log n)$ | Divide-and-conquer splitting, auxiliary buffer tracking, animated writes |
| **Sorting** | Heap Sort | $\mathcal{O}(n \log n)$ | Max-heap construction, sift-down restructuring, root-to-tail extraction |
| **Searching** | Binary Search | $\mathcal{O}(\log n)$ | Dynamic `low`/`mid`/`high` pointers, out-of-scope window dimming |
| **Searching** | Linear Search | $\mathcal{O}(n)$ | Sequential index scanning, target match and not-found confirmations |
| **Linear Data Structures** | Singly Linked List | $\mathcal{O}(n)$ traversal / $\mathcal{O}(1)$ head | Dynamic pointer-following traversal, animated head/tail insertions |
| **Linear Data Structures** | Doubly Linked List | $\mathcal{O}(n)$ traversal | Bidirectional pointer visualization (`Next ->` and `<- Prev`) |
| **Linear Data Structures** | Circular Linked List | $\mathcal{O}(n)$ traversal | **Radial Circle Layout** ($x = c_x + R\cos\theta, y = c_y + R\sin\theta$) |
| **Linear Data Structures** | Stack (LIFO) | $\mathcal{O}(1)$ push / pop | Top-pointer tracking, peek operations, capacity limit safeguards |
| **Linear Data Structures** | Queue (FIFO) | $\mathcal{O}(1)$ enqueue / dequeue | Head dequeue slide-out, tail enqueue entry, capacity indicators |
| **Self-Balancing Trees** | AVL Tree | $\mathcal{O}(\log n)$ search / insert | Live balance factor indicators, Left/Right/LR/RL balancing rotations |
| **Expression Trees** | Infix $\to$ Postfix/Prefix | $\mathcal{O}(n)$ parse / traverse | Shunting-Yard AST builder, Post-order & Pre-order visual tracer |
| **Graphs** | Dijkstra's Algorithm | $\mathcal{O}((V+E)\log V)$ | Greedy relaxation, live distance cost table, backtrace shortest path |
| **Graphs** | Kruskal's Algorithm | $\mathcal{O}(E \log E)$ | Disjoint Set Union (Union-Find), cycle rejection, MST construction |

---

## 🎨 Dynamic Theming System

AlgoVisualizer features a dynamic theming system built on CSS custom properties. Switching themes instantly updates all UI components, SVGs, charts, and background layers without a full-page reload:

1. **Modern Minimalist (Dark)** *(Default)*: Slate and charcoal backdrop with glowing emerald, cyan, and amber telemetry accents.
2. **Modern Minimalist (Light)**: High-contrast paper aesthetic with crisp zinc borders and subtle shadows.
3. **Ocean Depths**: Deep marine abyss styling with cyan, aqua, and deep sea tones.
4. **Tech Innovation**: High-voltage electric blue accents on graphite surfaces.
5. **Arctic Frost**: Cold glacial blue palette with crisp border highlights.

---

## 🚀 Getting Started & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (`v18.x` or higher recommended)
- [npm](https://www.npmjs.com/) (`v9.x` or higher)

### Setup Instructions
1. **Clone the repository**:
   ```bash
   git clone https://github.com/Prakhar-Sethi012/AlgoVisualizer.git
   cd AlgoVisualizer
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000`.

---

## 🏗️ Production Verification & Build

To compile an optimized production distribution with manual chunking and Web Worker asset bundling:

```bash
npm run build
```

To preview the production bundle locally:

```bash
npm run preview
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
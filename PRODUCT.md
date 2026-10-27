# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Computer science students, educators, and software engineers studying algorithms, analyzing systems performance, and preparing for technical interviews who need to validate abstract asymptotic theory against physical hardware execution.

## Product Purpose

AlgoVisualizer exists to bridge the gap between academic computational theory (RAM model, big-O notation) and physical hardware reality (CPU cache hierarchies, branch prediction, V8 JIT compilation, and thread utilization). Success means a user can visually inspect how an algorithm manipulates data step-by-step, benchmark it against millions of elements on real multi-threaded hardware, and mathematically prove its asymptotic bounds in one unified environment.

## Positioning

Unlike conventional educational algorithm visualizers that rely on simulated toy animations or laggy `setTimeout` loops, AlgoVisualizer delivers a dual-mode engine: fine-grained, time-traveling ES6 generator visualizations paired with an isolated Web Worker benchmarking engine capable of stressing datasets up to 5,000,000 elements, complete with a live Monaco Code Editor sandbox and theoretical asymptotic curve fitting.

## Operating Context

- Used in desktop web browsers (Chrome, Firefox, Safari, Edge) during coursework, lecture demonstrations, interview preparation, and self-guided engineering study.
- Primary workflows:
  1. Interactive visualization: Stepping, pausing, or scrubbing through sorting, searching, graph traversal, and dynamic data structure morphing.
  2. Bare-metal benchmarking: Configuring dataset sizes (10 to 5,000,000 items), selecting algorithm matchups or writing custom algorithms in Monaco Editor, running on background Web Workers, and analyzing empirical vs. theoretical curve overlays.
  3. Mathematical recurrence analysis: Parsing recurrence relations using the Master Theorem engine, visualizing recursion trees, and comparing complexity classes.

## Capabilities and Constraints

- **Execution Engine**:
  - Deterministic state stepping via pure ES6 generators (`function*`, `yield*`).
  - Web Worker offloading for zero-UI-jank background benchmarks (`benchmark.worker.js`).
  - Monaco Editor code sandbox for executing custom JavaScript algorithms against built-ins.
- **Algorithm & Data Structure Suites**:
  - Sorting: Bubble Sort, Quick Sort (Lomuto), Merge Sort, Heap Sort.
  - Searching: Linear Search, Binary Search with active range dimming.
  - Data Structures: Radial Circular/Singly/Doubly Linked Lists with trigonometry-driven spring physics morphing, AVL Trees with self-balancing rotation generators, Expression Trees (Shunting-Yard AST infix-to-postfix/prefix conversion), Stacks & Queues.
  - Graphs: Dijkstra Shortest Path, Kruskal MST with Disjoint Set Union (Union-Find).
  - Math Lab: Symbolic Master Theorem recurrence solver with regex parsing and recursion tree generation; empirical asymptotic curve fitting ($C = \text{Time}(N_{\max}) / f(N_{\max})$).
- **Theming**: Dynamic 5-palette HSL theming system (Default Dark, Minimal Light, Ocean Depths, Tech Innovation, Arctic Frost) stored in CSS custom properties.
- **Technical Constraints**: Client-side single-page app (React 18, Vite, Tailwind CSS, Framer Motion, Recharts). All execution and compilation occurs client-side in the browser.

## Brand Commitments

- **Name**: AlgoVisualizer & Bare-Metal Benchmarking Lab
- **Voice**: Clear, technically precise, educational, and engineering-grounded. Avoids gimmicks; respects computer science rigor while remaining accessible and visually responsive.
- **Visual Identity**: Dark-mode-first aesthetic with high-contrast state badges, crisp monospace telemetry (JetBrains Mono), refined engineering typography (Sora), and dynamic HSL theme switching.

## Evidence on Hand

- Fully functional working SPA implemented in `src/` with React 18, Tailwind CSS, Framer Motion, Lucide icons, Monaco Editor, and Recharts.
- Complete architecture and engineering breakdown documented in `README.md`.
- Established generator and raw algorithm implementations located in `src/core/algorithms/`.

## Product Principles

1. **Reality Over Toy Models**: Never hide hardware realities; show how cache locality, memory layout, and branch prediction cause real execution to deviate from theoretical RAM-model assumptions.
2. **Deterministic Time-Travel**: Every visualization must be step-controllable, inspectable, and deterministic without locking the UI thread.
3. **Multi-Threaded Integrity**: Intensive computation and user-written benchmarks must never freeze the interface; execution belongs on dedicated Web Workers with microsecond timing.
4. **Instant Comprehension**: Complex topological structures (radial linked lists, AVL balance rotations, AST expression trees) should convey mechanical relationships through fluid physical animation and live telemetry.

## Accessibility & Inclusion

- Responsive layout across desktop viewports with responsive navigation drawers.
- High-contrast visual cues for algorithm states (comparisons, swaps, pivot selections, eliminated ranges).
- Semantic headings, clear telemetry readouts, and accessible typography scale with Sora and JetBrains Mono.

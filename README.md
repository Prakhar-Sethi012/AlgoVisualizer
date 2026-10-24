# AlgoVisualizer & Benchmarking Lab

> **"Watch algorithms think, then race them on bare metal to prove the math."**

An advanced, browser-native Computer Science laboratory that bridges the gap between theoretical algorithm analysis and physical hardware execution. Built from the ground up with a pure frontend architecture, **AlgoVisualizer** combines step-by-step state machine visualizations with multi-threaded bare-metal execution benchmarks and formal recurrence relation solvers.

---

## 🔬 Core Hook: Theory vs. Reality

In academic textbooks, asymptotic analysis ($O(n \log n)$ vs. $O(n^2)$) assumes uniform memory access latency and ignores hardware constant factors. In reality, modern V8 JIT compilation, CPU cache line spatial locality ($L1/L2/L3$), branch prediction, and garbage collection dramatically shape physical runtimes:

- **Bubble Sort vs. Quick Sort**: While theory predicts $O(n^2)$ vs. $O(n \log n)$, physical execution shows Bubble Sort degrading exponentially after $10,000$ elements due to redundant memory writes, while Quick Sort processes millions of elements in milliseconds.
- **Linear vs. Binary Search**: Binary search cuts search space logarithmically ($O(\log n)$), allowing $5,000,000$ elements to be searched in under $0.05\text{ ms}$, contrasting with linear scan times that scale with dataset size.
- **Empirical Curve Overlays**: By computing scaling constants $C = \frac{\text{Time}(N_{\max})}{f(N_{\max})}$, the platform scales theoretical Big-O curves directly atop physical hardware measurements to visually prove where theory aligns with physical reality.

---

## 🏛️ Engineering Architecture & Highlights

### 1. Time-Traveling State Machines via ES6 Recursive Generators (`function*` & `yield*`)
Standard visualizers rely on crude `setTimeout` loops or asynchronous recursion that cannot be paused, reversed, or inspected without freezing the main thread or causing race conditions.
- **Deterministic Step-by-Step Control**: Every algorithm (Sorting, Searching, AVL Trees, Graphs) is authored as an ES6 generator function.
- **Fine-Grained Snapshot Yields**: Algorithms yield immutable UI state snapshots during comparisons, index pointer swaps, tree rotations, and edge relaxations.
- **Recursive Generator Delegation**: Complex algorithms like Merge Sort and Quick Sort utilize recursive delegation (`yield*`) across Lomuto partitioning and divide-and-conquer subproblems.
- **Physics-Based Fluid Rendering**: State snapshots are rendered using **Framer Motion** spring transitions (`transition={{ type: "spring", stiffness: 300, damping: 25 }}`) with layout projections. When array elements swap or AVL trees undergo rotations, nodes smoothly glide across screen coordinates.

```javascript
// Example: Recursive Quick Sort Generator Delegation
export function* quickSort(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    const pivotIndex = yield* partition(arr, low, high);
    yield* quickSort(arr, low, pivotIndex - 1);
    yield* quickSort(arr, pivotIndex + 1, high);
  }
}
```

### 2. Multi-Threaded Bare-Metal Benchmarking via Dedicated Web Workers
UI state generators introduce significant overhead and cannot be benchmarked accurately. To measure genuine computational throughput:
- **Dedicated Web Worker Offloading**: Raw, hyper-optimized iterative implementations run in a separate V8 runtime thread (`benchmark.worker.js`) via Vite's `?worker` module syntax.
- **Zero UI Stutter**: Benchmarking executes datasets up to $5,000,000$ integers on background threads without locking the 60fps main UI thread.
- **V8 JIT Warmup & Monomorphic Typing**: Benchmark runs execute warmup iterations to ensure V8 optimizes hot loops. Large datasets utilize typed `Int32Array` buffers for high-density cache utilization.
- **High-Precision Timing**: Execution runtimes are measured using `performance.now()` microsecond timestamps and streamed back via typed worker messages to interactive **Recharts** visualizations.

### 3. Regex Recurrence Parser & Asymptotic Curve Fitting Engine
To mathematically validate physical benchmarks, the lab embeds a symbolic mathematics engine:
- **Regex Master Theorem Solver** (`masterTheorem.js`): Parses recurrence relations such as:
  $$T(n) = aT(n/b) + \mathcal{O}(n^d)$$
  Evaluates critical exponents $c_{\text{crit}} = \log_b(a)$ against $d$ and categorizes the recurrence into Master Theorem Case 1, Case 2, or Case 3 with explicit level-by-level recursion tree summaries.
- **Empirical Curve Fitting** (`curveFitter.js`): Maps theoretical functions ($f(n) = n \log n, n^2, n$) onto physical milliseconds:
  $$C = \frac{\text{MeasuredTime}(N_{\max})}{f(N_{\max})}, \quad \text{Curve}(n) = C \cdot f(n)$$
  Renders dashed theoretical overlays on real execution charts, revealing how physical benchmarks converge asymptotically to theoretical bounds.

---

## 🧩 Algorithm & Data Structure Suite

| Category | Algorithm / Structure | Complexity | Engineering Highlight |
| :--- | :--- | :--- | :--- |
| **Sorting** | Bubble Sort | $\mathcal{O}(n^2)$ | Active swap indicators, comparison highlights |
| **Sorting** | Quick Sort | $\mathcal{O}(n \log n)$ | Lomuto partition recursive generator (`yield*`) |
| **Sorting** | Merge Sort | $\mathcal{O}(n \log n)$ | Auxiliary buffer tracking with overwrite states |
| **Searching** | Binary Search | $\mathcal{O}(\log n)$ | Dynamic search window with $0.2$ opacity dimming |
| **Searching** | Linear Search | $\mathcal{O}(n)$ | Sequential scan pointer visualization |
| **Data Structures** | Stack (LIFO) | $\mathcal{O}(1)$ | `AnimatePresence` top insertion and pop ejection |
| **Data Structures** | Queue (FIFO) | $\mathcal{O}(1)$ | Head dequeue slide-out and tail enqueue entry |
| **Self-Balancing Trees**| AVL Tree | $\mathcal{O}(\log n)$ | Physical LL, RR, LR, RL balancing rotations |
| **Graphs** | Dijkstra's Algorithm | $\mathcal{O}((V+E)\log V)$ | Greedy relaxation with live distance table updates |
| **Graphs** | Kruskal's Algorithm | $\mathcal{O}(E \log E)$ | Disjoint Set Union (Union-Find) with cycle rejection |

---

## 🛠️ Technology Stack

- **Runtime & Framework**: [React 18](https://react.dev/) + [Vite 5](https://vitejs.dev/)
- **Animation Physics**: [Framer Motion](https://www.framer.com/motion/) (spring layout transitions and `AnimatePresence`)
- **Styling & Theming**: [Tailwind CSS](https://tailwindcss.com/) with dynamic HSL CSS variable injection (supports 5 dynamic visual themes)
- **Data Visualization**: [Recharts](https://recharts.org/) (responsive SVG line charts and hardware overlays)
- **Icons & UI**: [Lucide React](https://lucide.dev/)
- **Concurrency**: HTML5 Web Workers API (`benchmark.worker.js`)
- **Code Optimization**: `React.lazy()` route splitting and Rollup manual chunk partitioning

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version `18.x` or higher recommended)
- `npm` (version `9.x` or higher)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Prakhar-Sethi012/AlgoVisualizer.git
   cd AlgoVisualizer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch the development server:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000`.

### Production Build & Verification
To compile optimized production bundles with Web Worker integration and code-split chunks:
```bash
npm run build
```
To preview the production build locally:
```bash
npm run preview
```

---

## 🎨 Dynamic Theming System

AlgoVisualizer features a dynamic theming engine that seamlessly restyles all components without page reloads:
- **Modern Minimalist (Dark)**: High-contrast charcoal with emerald and amber state accents.
- **Modern Minimalist (Light)**: Crisp grayscale paper-like aesthetic with subtle drop shadows.
- **Ocean Depths**: Deep teal, cyan, and marine tones.
- **Tech Innovation**: High-voltage electric blue accents.
- **Arctic Frost**: Cool slate and glacial blue palette.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
import { rawBubbleSort } from '../core/algorithms/raw/bubbleSort.js';
import { rawMergeSort } from '../core/algorithms/raw/mergeSort.js';
import { rawQuickSort } from '../core/algorithms/raw/quickSort.js';

const ALGO_FUNCTIONS = {
  bubble: rawBubbleSort,
  merge: rawMergeSort,
  quick: rawQuickSort
};

/**
 * JIT Warmup Helper
 * Runs small workloads through V8 to trigger JIT optimization and avoid cold-start bias.
 */
function warmupV8() {
  const dummy = Array.from({ length: 500 }, () => Math.floor(Math.random() * 10000));
  rawQuickSort([...dummy]);
  rawMergeSort([...dummy]);
  rawBubbleSort(dummy.slice(0, 100));
}

// Handle messages from the main thread
self.onmessage = function (event) {
  const { algorithms = ['bubble', 'merge', 'quick'], sizes = [1000, 5000, 10000, 25000] } = event.data || {};

  // 1. JIT Warmup
  self.postMessage({ type: 'status', message: 'Warming up V8 JIT compiler...' });
  warmupV8();

  const results = [];
  const totalTasks = sizes.length * algorithms.length;
  let completedTasks = 0;

  // 2. Loop through each size and benchmark
  for (let sIdx = 0; sIdx < sizes.length; sIdx++) {
    const size = sizes[sIdx];
    // Generate fresh pseudo-random dataset for this size
    const baseDataset = Array.from({ length: size }, () => Math.floor(Math.random() * 1000000));
    const resultRow = { size };

    for (let aIdx = 0; aIdx < algorithms.length; aIdx++) {
      const algoKey = algorithms[aIdx].toLowerCase();
      const sortFn = ALGO_FUNCTIONS[algoKey];

      if (!sortFn) {
        resultRow[algoKey] = 0;
        continue;
      }

      // Notify main thread of current task
      self.postMessage({
        type: 'progress',
        currentSize: size,
        currentAlgorithm: algoKey,
        progressPercent: Math.round((completedTasks / totalTasks) * 100)
      });

      // Clone dataset so every algorithm receives the exact same unsorted input
      const inputCopy = [...baseDataset];

      // Measure execution time
      const startTime = performance.now();
      sortFn(inputCopy);
      const endTime = performance.now();

      // Precision in milliseconds (3 decimal places)
      const durationMs = Number((endTime - startTime).toFixed(3));
      resultRow[algoKey] = durationMs;

      completedTasks++;
    }

    results.push(resultRow);
  }

  // 3. Post final results back to main thread
  self.postMessage({
    type: 'done',
    results: results,
    // Direct array for simple consumers
    data: results
  });
};

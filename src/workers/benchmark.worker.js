import { rawBubbleSort } from '../core/algorithms/raw/bubbleSort.js';
import { rawMergeSort } from '../core/algorithms/raw/mergeSort.js';
import { rawQuickSort } from '../core/algorithms/raw/quickSort.js';
import { rawLinearSearch } from '../core/algorithms/raw/linearSearch.js';
import { rawBinarySearch } from '../core/algorithms/raw/binarySearch.js';

const SORT_FUNCTIONS = {
  bubble: rawBubbleSort,
  merge: rawMergeSort,
  quick: rawQuickSort
};

const SEARCH_FUNCTIONS = {
  linear: rawLinearSearch,
  binary: rawBinarySearch
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

  const sortedDummy = new Int32Array(500);
  for (let i = 0; i < 500; i++) sortedDummy[i] = i * 2;
  rawBinarySearch(sortedDummy, 250);
  rawLinearSearch(sortedDummy, 250);
}

self.onmessage = function (event) {
  const {
    mode = 'sorting',
    algorithms,
    sizes,
    customCode
  } = event.data || {};

  // Try to compile user's custom algorithm if provided
  let userSortFunction = null;
  if (event.data && event.data.customCode) {
    try {
      userSortFunction = new Function('arr', event.data.customCode);
    } catch (error) {
      self.postMessage({
        type: 'error',
        message: `Syntax Error in Custom Code: ${error.message || error}`
      });
      return;
    }
  }

  // 1. JIT Warmup
  self.postMessage({ type: 'status', message: 'Warming up V8 JIT compiler...' });
  warmupV8();

  if (mode === 'searching') {
    // ================= SEARCHING BENCHMARK (Massive Datasets: 100k - 5M) =================
    const searchSizes = sizes || [100000, 500000, 1000000, 5000000];
    const searchAlgos = algorithms || ['linear', 'binary'];
    const results = [];
    const totalTasks = searchSizes.length * searchAlgos.length;
    let completedTasks = 0;

    for (let sIdx = 0; sIdx < searchSizes.length; sIdx++) {
      const size = searchSizes[sIdx];
      self.postMessage({
        type: 'status',
        message: `Allocating contiguous dataset for N = ${size.toLocaleString()}...`
      });

      // Use Int32Array for memory efficiency on 5M elements (only 20MB RAM)
      const sortedDataset = new Int32Array(size);
      for (let i = 0; i < size; i++) {
        sortedDataset[i] = i * 2;
      }

      // Pick target at 90% of dataset so Linear Search demonstrates true O(N) traversal
      const target = sortedDataset[Math.floor(size * 0.9)];
      const resultRow = { size };

      for (let aIdx = 0; aIdx < searchAlgos.length; aIdx++) {
        const algoKey = searchAlgos[aIdx].toLowerCase();
        const searchFn = SEARCH_FUNCTIONS[algoKey];

        if (!searchFn) {
          resultRow[algoKey] = 0;
          continue;
        }

        self.postMessage({
          type: 'progress',
          currentSize: size,
          currentAlgorithm: algoKey,
          progressPercent: Math.round((completedTasks / totalTasks) * 100)
        });

        // Time measurement
        const startTime = performance.now();
        searchFn(sortedDataset, target);
        const endTime = performance.now();

        const durationMs = Number((endTime - startTime).toFixed(4));
        resultRow[algoKey] = durationMs;

        completedTasks++;
      }

      results.push(resultRow);
    }

    self.postMessage({
      type: 'done',
      results: results,
      data: results
    });
    return;
  }

  // ================= SORTING BENCHMARK (1k - 25k) =================
  const sortSizes = sizes || [1000, 5000, 10000, 25000];
  const sortAlgos = algorithms || ['bubble', 'merge', 'quick'];
  const results = [];
  const totalTasks = sortSizes.length * (sortAlgos.length + (userSortFunction ? 1 : 0));
  let completedTasks = 0;

  for (let sIdx = 0; sIdx < sortSizes.length; sIdx++) {
    const size = sortSizes[sIdx];
    const baseDataset = Array.from({ length: size }, () => Math.floor(Math.random() * 1000000));
    const resultRow = { size };

    for (let aIdx = 0; aIdx < sortAlgos.length; aIdx++) {
      const algoKey = sortAlgos[aIdx].toLowerCase();
      const sortFn = SORT_FUNCTIONS[algoKey];

      if (!sortFn) {
        resultRow[algoKey] = 0;
        continue;
      }

      self.postMessage({
        type: 'progress',
        currentSize: size,
        currentAlgorithm: algoKey,
        progressPercent: Math.round((completedTasks / totalTasks) * 100)
      });

      const inputCopy = [...baseDataset];
      const startTime = performance.now();
      sortFn(inputCopy);
      const endTime = performance.now();

      const durationMs = Number((endTime - startTime).toFixed(3));
      resultRow[algoKey] = durationMs;

      completedTasks++;
    }

    // Benchmark custom user algorithm if provided
    if (userSortFunction) {
      self.postMessage({
        type: 'progress',
        currentSize: size,
        currentAlgorithm: 'custom',
        progressPercent: Math.round((completedTasks / totalTasks) * 100)
      });

      const inputCopy = [...baseDataset];
      try {
        const startTime = performance.now();
        userSortFunction(inputCopy);
        const endTime = performance.now();

        const durationMs = Number((endTime - startTime).toFixed(3));
        resultRow.custom = durationMs;
      } catch (runtimeErr) {
        self.postMessage({
          type: 'error',
          message: `Runtime Error: ${runtimeErr.message || runtimeErr}`
        });
        return; // Halt worker
      }

      completedTasks++;
    }

    results.push(resultRow);
  }

  self.postMessage({
    type: 'done',
    results: results,
    data: results
  });
};

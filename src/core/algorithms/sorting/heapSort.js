/**
 * Heap Sort Algorithm Generator
 * 
 * In-place O(n log n) comparison-based sorting algorithm using a Binary Max-Heap.
 * 
 * Visualization Contract:
 * - Root index of active heapify subtree is yielded as `pivot` (styled via var(--color-algo-pivot)).
 * - Active left and right children being evaluated are yielded as `comparing` (styled via var(--color-algo-comparing)).
 * - Swaps between parent and child or root and end-of-heap set `swapped: true`.
 * - Settled elements in the extracted max partition are yielded in `sortedIndices` (emerald).
 * 
 * @param {number[]} initialArray
 * @yields {{ array: number[], comparing: number[], pivot: number|null, swapped: boolean, sortedIndices: number[], comparisons: number, swaps: number, stepInfo: string }}
 */
export function* heapSort(initialArray) {
  const arr = [...initialArray];
  const n = arr.length;
  const sortedIndices = [];
  const stats = { comparisons: 0, swaps: 0 };

  // Initial state yield
  yield {
    array: [...arr],
    comparing: [],
    pivot: null,
    overwriting: [],
    swapped: false,
    sortedIndices: [...sortedIndices],
    comparisons: stats.comparisons,
    swaps: stats.swaps,
    stepInfo: 'Starting Heap Sort. Phase 1: Building initial Binary Max-Heap.'
  };

  if (n <= 1) {
    yield {
      array: [...arr],
      comparing: [],
      pivot: null,
      overwriting: [],
      swapped: false,
      sortedIndices: Array.from({ length: n }, (_, i) => i),
      comparisons: stats.comparisons,
      swaps: stats.swaps,
      stepInfo: 'Array already sorted.'
    };
    return;
  }

  // ==========================================
  // Generator-based Heapify Subroutine
  // ==========================================
  function* heapify(limit, rootIndex, phaseName) {
    let largest = rootIndex;
    const leftChild = 2 * rootIndex + 1;
    const rightChild = 2 * rootIndex + 2;

    // Collect valid children within current heap boundary [0, limit)
    const validChildren = [];
    if (leftChild < limit) validChildren.push(leftChild);
    if (rightChild < limit) validChildren.push(rightChild);

    // Yield comparison state: root is pivot (purple), children are comparing (amber)
    if (validChildren.length > 0) {
      stats.comparisons += validChildren.length;

      const childrenStr = validChildren
        .map((c) => `child[${c}]=${arr[c]}`)
        .join(', ');

      yield {
        array: [...arr],
        comparing: [...validChildren],
        pivot: rootIndex,
        overwriting: [],
        swapped: false,
        sortedIndices: [...sortedIndices],
        comparisons: stats.comparisons,
        swaps: stats.swaps,
        stepInfo: `${phaseName}: Comparing root[${rootIndex}]=${arr[rootIndex]} against ${childrenStr}`
      };
    }

    // Check if left child is larger than root
    if (leftChild < limit && arr[leftChild] > arr[largest]) {
      largest = leftChild;
    }

    // Check if right child is larger than current largest
    if (rightChild < limit && arr[rightChild] > arr[largest]) {
      largest = rightChild;
    }

    // If largest is not root, swap and recursively heapify affected subtree
    if (largest !== rootIndex) {
      stats.swaps++;
      const temp = arr[rootIndex];
      arr[rootIndex] = arr[largest];
      arr[largest] = temp;

      // Yield swapped state: root and largest highlighted in swap coral
      yield {
        array: [...arr],
        comparing: [rootIndex, largest],
        pivot: null,
        overwriting: [],
        swapped: true,
        sortedIndices: [...sortedIndices],
        comparisons: stats.comparisons,
        swaps: stats.swaps,
        stepInfo: `${phaseName}: Heap property violated. Swapped root ${temp} with larger child ${arr[rootIndex]} at index ${largest}.`
      };

      // Recursively sift down the affected child subtree
      yield* heapify(limit, largest, phaseName);
    }
  }

  // ==========================================
  // PHASE 1: Build Max Heap (O(n) bottom-up)
  // ==========================================
  const startIdx = Math.floor(n / 2) - 1;
  for (let i = startIdx; i >= 0; i--) {
    yield* heapify(n, i, 'Build Max-Heap');
  }

  yield {
    array: [...arr],
    comparing: [],
    pivot: 0,
    overwriting: [],
    swapped: false,
    sortedIndices: [...sortedIndices],
    comparisons: stats.comparisons,
    swaps: stats.swaps,
    stepInfo: 'Max-Heap successfully built! Maximum element is now at root (index 0). Starting Phase 2: Extract Max.'
  };

  // ==========================================
  // PHASE 2: Extract Max (Sort Phase)
  // ==========================================
  for (let i = n - 1; i > 0; i--) {
    // 1. Highlight root (max) and target swap position at end of unsorted region
    yield {
      array: [...arr],
      comparing: [i],
      pivot: 0,
      overwriting: [],
      swapped: false,
      sortedIndices: [...sortedIndices],
      comparisons: stats.comparisons,
      swaps: stats.swaps,
      stepInfo: `Extract Max: Moving max element ${arr[0]} to its sorted position at index ${i}.`
    };

    // 2. Swap root with end of unsorted heap
    stats.swaps++;
    const temp = arr[0];
    arr[0] = arr[i];
    arr[i] = temp;

    // Element at index i is now settled in its final sorted position
    sortedIndices.unshift(i);

    yield {
      array: [...arr],
      comparing: [0, i],
      pivot: null,
      overwriting: [],
      swapped: true,
      sortedIndices: [...sortedIndices],
      comparisons: stats.comparisons,
      swaps: stats.swaps,
      stepInfo: `Swapped root ${temp} with element ${arr[0]} at index ${i}. Index ${i} is now locked & sorted.`
    };

    // 3. Re-heapify root element on reduced heap of size i
    yield* heapify(i, 0, `Restore Max-Heap (size ${i})`);
  }

  // The final remaining element at index 0 is naturally sorted
  if (!sortedIndices.includes(0)) {
    sortedIndices.unshift(0);
  }

  // Final completion yield
  yield {
    array: [...arr],
    comparing: [],
    pivot: null,
    overwriting: [],
    swapped: false,
    sortedIndices: Array.from({ length: n }, (_, idx) => idx),
    comparisons: stats.comparisons,
    swaps: stats.swaps,
    stepInfo: 'Heap Sort completed! In-place O(n log n) sorting verified.'
  };
}

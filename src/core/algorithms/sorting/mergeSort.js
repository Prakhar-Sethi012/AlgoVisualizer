/**
 * Merge Sort Algorithm Recursive Generator
 * 
 * Uses recursive generator delegation (yield*) to visualize the divide-and-conquer merge strategy.
 * For in-place visualization of out-of-place merges, every overwrite from auxiliary buffers
 * into the main array yields a visual update:
 * { array: [...], overwriting: [index], comparing: [leftIndex, rightIndex] }
 * 
 * @param {number[]} initialArray
 * @yields {{ array: number[], comparing: number[], overwriting: number[], pivot: null, swapped: boolean, sortedIndices: number[], comparisons: number, swaps: number, stepInfo: string }}
 */
export function* mergeSort(initialArray) {
  const arr = [...initialArray];
  const n = arr.length;
  const sortedIndices = [];
  const stats = { comparisons: 0, swaps: 0 };

  // Initial state yield
  yield {
    array: [...arr],
    comparing: [],
    overwriting: [],
    pivot: null,
    swapped: false,
    sortedIndices: [...sortedIndices],
    comparisons: stats.comparisons,
    swaps: stats.swaps,
    stepInfo: 'Starting Merge Sort. Ready to divide.'
  };

  if (n <= 1) {
    yield {
      array: [...arr],
      comparing: [],
      overwriting: [],
      pivot: null,
      swapped: false,
      sortedIndices: Array.from({ length: n }, (_, i) => i),
      comparisons: stats.comparisons,
      swaps: stats.swaps,
      stepInfo: 'Array already sorted.'
    };
    return;
  }

  // Recursive merge sort using yield* delegation
  yield* mergeSortHelper(arr, 0, n - 1, sortedIndices, stats);

  // Final yield: all indices sorted
  yield {
    array: [...arr],
    comparing: [],
    overwriting: [],
    pivot: null,
    swapped: false,
    sortedIndices: Array.from({ length: n }, (_, i) => i),
    comparisons: stats.comparisons,
    swaps: stats.swaps,
    stepInfo: 'Merge Sort completed! All subarrays merged and sorted.'
  };
}

/**
 * Recursive Divide-and-Conquer Helper
 */
function* mergeSortHelper(arr, left, right, sortedIndices, stats) {
  if (left >= right) return;

  const mid = Math.floor((left + right) / 2);

  // Recursively divide left and right halves using yield*
  yield* mergeSortHelper(arr, left, mid, sortedIndices, stats);
  yield* mergeSortHelper(arr, mid + 1, right, sortedIndices, stats);

  // Merge the two halves
  yield* merge(arr, left, mid, right, sortedIndices, stats);
}

/**
 * Merge Generator Step
 * Copies to auxiliary arrays and visualizes overwriting elements into the primary array.
 */
function* merge(arr, left, mid, right, sortedIndices, stats) {
  // Auxiliary buffers for left and right subarrays
  const leftCopy = arr.slice(left, mid + 1);
  const rightCopy = arr.slice(mid + 1, right + 1);

  let i = 0; // Pointer into leftCopy
  let j = 0; // Pointer into rightCopy
  let k = left; // Pointer into primary arr

  const isFinalMerge = left === 0 && right === arr.length - 1;

  yield {
    array: [...arr],
    comparing: [left, right],
    overwriting: [],
    pivot: null,
    swapped: false,
    sortedIndices: [...sortedIndices],
    comparisons: stats.comparisons,
    swaps: stats.swaps,
    stepInfo: `Merging subarrays [${left}..${mid}] and [${mid + 1}..${right}]`
  };

  while (i < leftCopy.length && j < rightCopy.length) {
    stats.comparisons++;
    const leftIdx = left + i;
    const rightIdx = mid + 1 + j;

    // Yield comparison state
    yield {
      array: [...arr],
      overwriting: [k],
      comparing: [leftIdx, rightIdx],
      pivot: null,
      swapped: false,
      sortedIndices: [...sortedIndices],
      comparisons: stats.comparisons,
      swaps: stats.swaps,
      stepInfo: `Comparing left buffer ${leftCopy[i]} (orig index ${leftIdx}) with right buffer ${rightCopy[j]} (orig index ${rightIdx})`
    };

    if (leftCopy[i] <= rightCopy[j]) {
      arr[k] = leftCopy[i];
      stats.swaps++; // Track assignment/overwrite
      i++;
    } else {
      arr[k] = rightCopy[j];
      stats.swaps++; // Track assignment/overwrite
      j++;
    }

    // Yield overwrite state: element written into main array
    yield {
      array: [...arr],
      overwriting: [k],
      comparing: [],
      pivot: null,
      swapped: false,
      sortedIndices: isFinalMerge
        ? Array.from({ length: k - left + 1 }, (_, idx) => left + idx)
        : [...sortedIndices],
      comparisons: stats.comparisons,
      swaps: stats.swaps,
      stepInfo: `Overwrote index ${k} with value ${arr[k]}`
    };

    k++;
  }

  // Copy any remaining elements from leftCopy
  while (i < leftCopy.length) {
    arr[k] = leftCopy[i];
    stats.swaps++;
    i++;

    yield {
      array: [...arr],
      overwriting: [k],
      comparing: [],
      pivot: null,
      swapped: false,
      sortedIndices: isFinalMerge
        ? Array.from({ length: k - left + 1 }, (_, idx) => left + idx)
        : [...sortedIndices],
      comparisons: stats.comparisons,
      swaps: stats.swaps,
      stepInfo: `Flushed remaining left buffer value ${arr[k]} to index ${k}`
    };

    k++;
  }

  // Copy any remaining elements from rightCopy
  while (j < rightCopy.length) {
    arr[k] = rightCopy[j];
    stats.swaps++;
    j++;

    yield {
      array: [...arr],
      overwriting: [k],
      comparing: [],
      pivot: null,
      swapped: false,
      sortedIndices: isFinalMerge
        ? Array.from({ length: k - left + 1 }, (_, idx) => left + idx)
        : [...sortedIndices],
      comparisons: stats.comparisons,
      swaps: stats.swaps,
      stepInfo: `Flushed remaining right buffer value ${arr[k]} to index ${k}`
    };

    k++;
  }

  // If this was the root merge, mark all as sorted
  if (isFinalMerge) {
    for (let idx = 0; idx < arr.length; idx++) {
      if (!sortedIndices.includes(idx)) {
        sortedIndices.push(idx);
      }
    }
  }

  yield {
    array: [...arr],
    comparing: [],
    overwriting: [],
    pivot: null,
    swapped: false,
    sortedIndices: [...sortedIndices],
    comparisons: stats.comparisons,
    swaps: stats.swaps,
    stepInfo: `Subarray [${left}..${right}] merged successfully.`
  };
}

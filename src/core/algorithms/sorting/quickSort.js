/**
 * Quick Sort Algorithm Recursive Generator
 * 
 * Uses recursive generator delegation (yield*) to visualize divide-and-conquer partitioning.
 * Highlights the active pivot, comparison pointers, swaps, and settled elements.
 * 
 * @param {number[]} initialArray
 * @yields {{ array: number[], comparing: number[], pivot: number|null, swapped: boolean, overwriting: number[], sortedIndices: number[], comparisons: number, swaps: number, stepInfo: string }}
 */
export function* quickSort(initialArray) {
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
    stepInfo: 'Starting Quick Sort. Ready to partition.'
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

  // Recursive call using yield* delegation
  yield* quickSortHelper(arr, 0, n - 1, sortedIndices, stats);

  // Final yield: all elements confirmed sorted
  yield {
    array: [...arr],
    comparing: [],
    pivot: null,
    overwriting: [],
    swapped: false,
    sortedIndices: Array.from({ length: n }, (_, i) => i),
    comparisons: stats.comparisons,
    swaps: stats.swaps,
    stepInfo: 'Quick Sort completed! All partitions sorted.'
  };
}

/**
 * Recursive Quick Sort Helper using generator delegation
 */
function* quickSortHelper(arr, low, high, sortedIndices, stats) {
  if (low > high) return;

  if (low === high) {
    if (!sortedIndices.includes(low)) {
      sortedIndices.push(low);
    }
    yield {
      array: [...arr],
      comparing: [],
      pivot: null,
      overwriting: [],
      swapped: false,
      sortedIndices: [...sortedIndices],
      comparisons: stats.comparisons,
      swaps: stats.swaps,
      stepInfo: `Subarray [${low}] has length 1; element ${arr[low]} is sorted.`
    };
    return;
  }

  // Partition step: returns pivot index
  const pivotIndex = yield* partition(arr, low, high, sortedIndices, stats);

  // Recursively sort elements before partition and after partition
  yield* quickSortHelper(arr, low, pivotIndex - 1, sortedIndices, stats);
  yield* quickSortHelper(arr, pivotIndex + 1, high, sortedIndices, stats);
}

/**
 * Lomuto Partition Generator Step
 * Yields active pivot, comparison pointers, and swap states.
 */
function* partition(arr, low, high, sortedIndices, stats) {
  const pivotValue = arr[high];

  // 1. Highlight pivot selection
  yield {
    array: [...arr],
    comparing: [],
    pivot: high,
    overwriting: [],
    swapped: false,
    sortedIndices: [...sortedIndices],
    comparisons: stats.comparisons,
    swaps: stats.swaps,
    stepInfo: `Selected pivot: ${pivotValue} at index ${high} for range [${low}..${high}]`
  };

  let i = low - 1;

  for (let j = low; j < high; j++) {
    stats.comparisons++;

    // 2. Yield comparison with pivot
    yield {
      array: [...arr],
      comparing: [j, high],
      pivot: high,
      overwriting: [],
      swapped: false,
      sortedIndices: [...sortedIndices],
      comparisons: stats.comparisons,
      swaps: stats.swaps,
      stepInfo: `Comparing element arr[${j}]=${arr[j]} with pivot arr[${high}]=${pivotValue}`
    };

    if (arr[j] <= pivotValue) {
      i++;
      if (i !== j) {
        // Swap arr[i] and arr[j]
        const temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
        stats.swaps++;

        // 3. Yield swapped state
        yield {
          array: [...arr],
          comparing: [i, j],
          pivot: high,
          overwriting: [],
          swapped: true,
          sortedIndices: [...sortedIndices],
          comparisons: stats.comparisons,
          swaps: stats.swaps,
          stepInfo: `Swapped arr[${i}] (${arr[i]}) and arr[${j}] (${arr[j]}) (<= pivot)`
        };
      }
    }
  }

  // Place pivot in its correct sorted position
  const targetPivotPos = i + 1;
  if (targetPivotPos !== high) {
    const temp = arr[targetPivotPos];
    arr[targetPivotPos] = arr[high];
    arr[high] = temp;
    stats.swaps++;

    yield {
      array: [...arr],
      comparing: [targetPivotPos, high],
      pivot: targetPivotPos,
      overwriting: [],
      swapped: true,
      sortedIndices: [...sortedIndices],
      comparisons: stats.comparisons,
      swaps: stats.swaps,
      stepInfo: `Placed pivot ${pivotValue} into its final position at index ${targetPivotPos}`
    };
  }

  // Mark pivot as sorted
  if (!sortedIndices.includes(targetPivotPos)) {
    sortedIndices.push(targetPivotPos);
  }

  yield {
    array: [...arr],
    comparing: [],
    pivot: targetPivotPos,
    overwriting: [],
    swapped: false,
    sortedIndices: [...sortedIndices],
    comparisons: stats.comparisons,
    swaps: stats.swaps,
    stepInfo: `Pivot ${pivotValue} is now placed at sorted index ${targetPivotPos}`
  };

  return targetPivotPos;
}

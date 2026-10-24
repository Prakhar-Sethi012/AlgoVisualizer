/**
 * Bubble Sort Algorithm Generator
 * 
 * Yields visualization state at each comparison and swap step.
 * Conforms strictly to the required yield contract:
 * { array: [...], comparing: [i, j], swapped: boolean }
 * 
 * @param {number[]} initialArray
 * @yields {{ array: number[], comparing: number[], swapped: boolean, sortedIndices?: number[], stepInfo?: string }}
 */
export function* bubbleSort(initialArray) {
  const arr = [...initialArray];
  const n = arr.length;
  const sortedIndices = [];
  let comparisons = 0;
  let swaps = 0;

  // Initial state yield
  yield {
    array: [...arr],
    comparing: [],
    swapped: false,
    sortedIndices: [...sortedIndices],
    comparisons,
    swaps,
    stepInfo: 'Starting Bubble Sort. Ready to begin.'
  };

  for (let i = 0; i < n - 1; i++) {
    let anySwappedInPass = false;

    for (let j = 0; j < n - i - 1; j++) {
      comparisons++;

      // 1. Yield comparison state
      yield {
        array: [...arr],
        comparing: [j, j + 1],
        swapped: false,
        sortedIndices: [...sortedIndices],
        comparisons,
        swaps,
        stepInfo: `Comparing indices ${j} (value: ${arr[j]}) and ${j + 1} (value: ${arr[j + 1]})`
      };

      if (arr[j] > arr[j + 1]) {
        // Swap elements
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
        swaps++;
        anySwappedInPass = true;

        // 2. Yield swapped state
        yield {
          array: [...arr],
          comparing: [j, j + 1],
          swapped: true,
          sortedIndices: [...sortedIndices],
          comparisons,
          swaps,
          stepInfo: `Swapped: ${arr[j + 1]} > ${arr[j]}, moved ${arr[j + 1]} forward`
        };
      }
    }

    // Element at n - 1 - i is now in its final sorted position
    sortedIndices.unshift(n - 1 - i);

    yield {
      array: [...arr],
      comparing: [],
      swapped: false,
      sortedIndices: [...sortedIndices],
      comparisons,
      swaps,
      stepInfo: `Pass ${i + 1} complete. Element ${arr[n - 1 - i]} is sorted.`
    };

    // Optimization: if no two elements were swapped by inner loop, array is sorted
    if (!anySwappedInPass) {
      break;
    }
  }

  // All remaining elements are sorted
  const allIndices = Array.from({ length: n }, (_, idx) => idx);
  yield {
    array: [...arr],
    comparing: [],
    swapped: false,
    sortedIndices: allIndices,
    comparisons,
    swaps,
    stepInfo: 'Bubble Sort completed! All elements are sorted.'
  };
}

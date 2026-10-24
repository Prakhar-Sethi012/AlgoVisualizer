/**
 * Binary Search Generator
 * 
 * Operates on a sorted array and continuously divides search space in half.
 * Conforms to the Binary Search Visualization Rule:
 * Yields state containing left, right, and mid indices.
 * 
 * @param {number[]} array
 * @param {number} target
 * @yields {{ array: number[], left: number, right: number, mid: number, comparing: number[], target: number, foundIndex: number, found: boolean, comparisons: number, stepInfo: string }}
 */
export function* binarySearch(array, target) {
  // Binary search strictly requires a sorted array
  const arr = [...array].sort((a, b) => a - b);
  const n = arr.length;
  let left = 0;
  let right = n - 1;
  let comparisons = 0;

  // Initial state yield
  yield {
    array: [...arr],
    left,
    right,
    mid: -1,
    comparing: [],
    target,
    foundIndex: -1,
    found: false,
    comparisons: 0,
    stepInfo: `Binary Search initialized on sorted array [0..${right}]. Target: ${target}.`
  };

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    comparisons++;

    // 1. Yield active midpoint calculation
    yield {
      array: [...arr],
      left,
      right,
      mid,
      comparing: [mid],
      target,
      foundIndex: -1,
      found: false,
      comparisons,
      stepInfo: `Evaluating midpoint index ${mid} (value: ${arr[mid]}) against target ${target}. Current window: [${left}..${right}].`
    };

    if (arr[mid] === target) {
      // 2. Found target
      yield {
        array: [...arr],
        left,
        right,
        mid,
        comparing: [mid],
        target,
        foundIndex: mid,
        found: true,
        comparisons,
        sortedIndices: [mid],
        stepInfo: `Target ${target} located at index ${mid} in ${comparisons} iterations (O(log n))!`
      };
      return;
    }

    if (arr[mid] < target) {
      // Discard left half
      const prevLeft = left;
      left = mid + 1;
      yield {
        array: [...arr],
        left,
        right,
        mid,
        comparing: [mid],
        target,
        foundIndex: -1,
        found: false,
        comparisons,
        stepInfo: `${arr[mid]} < ${target}. Discarding left window [${prevLeft}..${mid}]. New search boundary: [${left}..${right}].`
      };
    } else {
      // Discard right half
      const prevRight = right;
      right = mid - 1;
      yield {
        array: [...arr],
        left,
        right,
        mid,
        comparing: [mid],
        target,
        foundIndex: -1,
        found: false,
        comparisons,
        stepInfo: `${arr[mid]} > ${target}. Discarding right window [${mid}..${prevRight}]. New search boundary: [${left}..${right}].`
      };
    }
  }

  // Not found
  yield {
    array: [...arr],
    left: -1,
    right: -1,
    mid: -1,
    comparing: [],
    target,
    foundIndex: -1,
    found: false,
    comparisons,
    stepInfo: `Target ${target} does not exist within the array bounds.`
  };
}

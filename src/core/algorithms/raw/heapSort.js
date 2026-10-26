/**
 * Raw, Hyper-Optimized Heap Sort for Benchmarking
 * 
 * High-performance, zero-allocation in-place heapsort.
 * Uses iterative sift-down with bitwise arithmetic for maximum V8 JIT speed.
 * 
 * Time Complexity: O(n log n) Best, Average, Worst
 * Auxiliary Space: O(1) in-place
 * 
 * @param {number[]} arr
 * @returns {number[]}
 */
export function rawHeapSort(arr) {
  const n = arr.length;
  if (n <= 1) return arr;

  /**
   * Sift-down subroutine to maintain max-heap invariant.
   * Pushes smaller root down iteratively without recursive call overhead.
   */
  function siftDown(root, limit) {
    let parent = root;
    const parentVal = arr[parent];

    while (true) {
      let child = (parent << 1) + 1; // 2 * parent + 1
      if (child >= limit) break;

      // Select larger of two children if right child is in bounds
      if (child + 1 < limit && arr[child + 1] > arr[child]) {
        child++;
      }

      // If largest child dominates parent value, promote child
      if (arr[child] > parentVal) {
        arr[parent] = arr[child];
        parent = child;
      } else {
        break;
      }
    }

    arr[parent] = parentVal;
  }

  // 1. Build max-heap (bottom-up from last non-leaf down to root)
  for (let i = (n >>> 1) - 1; i >= 0; i--) {
    siftDown(i, n);
  }

  // 2. Extract elements from heap one by one
  for (let i = n - 1; i > 0; i--) {
    // Swap root (maximum) with end of unsorted heap
    const maxVal = arr[0];
    arr[0] = arr[i];
    arr[i] = maxVal;

    // Restore max-heap property on remaining unsorted range [0, i)
    siftDown(0, i);
  }

  return arr;
}

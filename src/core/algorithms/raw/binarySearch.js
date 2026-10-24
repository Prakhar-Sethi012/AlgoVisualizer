/**
 * Raw, Hyper-Optimized Binary Search for Benchmarking
 * Logarithmic search on sorted arrays using bitwise mid calculation.
 * 
 * @param {number[]|Int32Array} arr
 * @param {number} target
 * @returns {number} Index of target, or -1
 */
export function rawBinarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = (left + right) >> 1;
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return -1;
}

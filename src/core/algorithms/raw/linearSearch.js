/**
 * Raw, Hyper-Optimized Linear Search for Benchmarking
 * Sequential scan through array.
 * 
 * @param {number[]|Int32Array} arr
 * @param {number} target
 * @returns {number} Index of target, or -1
 */
export function rawLinearSearch(arr, target) {
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}

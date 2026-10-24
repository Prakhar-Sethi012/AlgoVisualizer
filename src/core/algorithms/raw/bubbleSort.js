/**
 * Raw, Hyper-Optimized Bubble Sort for Benchmarking
 * In-place with early termination if no swaps occur.
 * 
 * @param {number[]} arr
 * @returns {number[]}
 */
export function rawBubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
        swapped = true;
      }
    }
    if (!swapped) break;
  }
  return arr;
}

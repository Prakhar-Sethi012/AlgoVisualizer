/**
 * Raw, Hyper-Optimized Merge Sort for Benchmarking
 * Uses a single pre-allocated auxiliary buffer to eliminate garbage collection overhead.
 * 
 * @param {number[]} arr
 * @returns {number[]}
 */
export function rawMergeSort(arr) {
  const n = arr.length;
  if (n <= 1) return arr;
  const aux = new Array(n);

  function merge(low, mid, high) {
    for (let k = low; k <= high; k++) {
      aux[k] = arr[k];
    }

    let i = low;
    let j = mid + 1;

    for (let k = low; k <= high; k++) {
      if (i > mid) {
        arr[k] = aux[j++];
      } else if (j > high) {
        arr[k] = aux[i++];
      } else if (aux[j] < aux[i]) {
        arr[k] = aux[j++];
      } else {
        arr[k] = aux[i++];
      }
    }
  }

  function sort(low, high) {
    if (low >= high) return;
    const mid = (low + high) >> 1;
    sort(low, mid);
    sort(mid + 1, high);
    merge(low, mid, high);
  }

  sort(0, n - 1);
  return arr;
}
